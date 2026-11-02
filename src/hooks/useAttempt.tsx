import { useEffect, useRef, useState } from "react";
import { ActiveClock, EMBEDDED, PORTAL_ORIGIN, parseSnapshot, sendToPortal, type Snapshot } from "../lib/attempt";
import { MAX_HINTS, createAttemptId, isGeneratedAttemptId } from "../data/layout";

export function useAttempt(onRestore: (snapshot: Snapshot) => void) {
  const [seconds, setSeconds] = useState(0);
  const [hints, setHints] = useState(0);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(!EMBEDDED);
  // The attempt id decides the board. Before the first touch it is only "pending":
  // a fresh id comes only with a genuinely new attempt (first open, Reset, Play Again).
  const [boardId, setBoardId] = useState<string | null>(() => EMBEDDED ? null : createAttemptId());
  const pendingId = useRef<string | null>(boardId);
  const [saveMessage, setSaveMessage] = useState(EMBEDDED ? "Connecting to your portal…" : "Practice mode — open this game through your portal to save results.");
  const clock = useRef(new ActiveClock());
  const current = useRef<Snapshot | null>(null);
  const pauseRef = useRef(false);
  const focused = useRef(typeof document === "undefined" || document.hasFocus());
  const latest = useRef<Snapshot | null>(null);
  const handshakeReceived = useRef(!EMBEDDED);
  const syncClock = () => clock.current.setRunning(Boolean(current.current && current.current.status === "in_progress" && !pauseRef.current && !document.hidden && focused.current));
  const snapshot = () => current.current ? { ...current.current, activeSeconds: clock.current.seconds() } : null;
  const prepare = (requested?: unknown) => {
    const id = isGeneratedAttemptId(requested) ? requested.toLowerCase() : createAttemptId();
    pendingId.current = id;
    setBoardId(id);
    // Lets the portal keep this board across a reload before the first touch. Preview ignores it.
    sendToPortal("board", { attemptId: id });
  };
  const publish = () => {
    const data = snapshot();
    if (data) { latest.current = data; sendToPortal("progress", data); }
  };
  useEffect(() => {
    const message = (event: MessageEvent) => {
      if (event.source !== window.parent || event.origin !== PORTAL_ORIGIN || event.data?.channel !== "ewm-word-search-v1") return;
      if (event.data.type === "save-status" && typeof event.data.payload?.message === "string") setSaveMessage(event.data.payload.message);
      if (event.data.type === "new-attempt") {
        handshakeReceived.current = true;
        if (!current.current) {
          const requested = event.data.payload?.attemptId;
          if (isGeneratedAttemptId(requested)) { if (requested.toLowerCase() !== pendingId.current) prepare(requested); }
          else if (!pendingId.current) prepare();
        }
        setReady(true);
        setSaveMessage("Connected — your progress will save here.");
      }
      if (event.data.type === "restore") {
        const restored = parseSnapshot(event.data.payload);
        if (!restored || restored.status !== "in_progress") return;
        handshakeReceived.current = true;
        current.current = restored;
        latest.current = restored;
        pendingId.current = null;
        setBoardId(restored.attemptId);
        clock.current = new ActiveClock(undefined, restored.activeSeconds);
        setSeconds(restored.activeSeconds);
        setHints(restored.hints);
        setStarted(true);
        setReady(true);
        pauseRef.current = false;
        setPaused(false);
        focused.current = true;
        syncClock();
        onRestore(restored);
        setSaveMessage(`Progress restored — ${restored.words.length} of 30 words found.`);
      }
      if (event.data.type === "ready") {
        sendToPortal("ready", null);
        if (latest.current) sendToPortal("progress", latest.current);
      }
    };
    const visibility = () => { syncClock(); publish(); };
    const focus = () => { focused.current = true; syncClock(); };
    const blur = () => { focused.current = false; syncClock(); publish(); };
    window.addEventListener("message", message);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("focus", focus);
    window.addEventListener("blur", blur);
    const tick = window.setInterval(() => setSeconds(clock.current.seconds()), 500);
    const save = window.setInterval(publish, 10000);
    const fallback = window.setTimeout(() => {
      if (EMBEDDED && !handshakeReceived.current) {
        setReady(true);
        setSaveMessage("Connected — your progress will save here.");
        if (!current.current && !pendingId.current) prepare();
      }
    }, 5000);
    sendToPortal("ready", null);
    return () => {
      publish();
      window.clearInterval(tick); window.clearInterval(save); window.clearTimeout(fallback);
      window.removeEventListener("message", message);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("focus", focus); window.removeEventListener("blur", blur);
    };
  }, [onRestore]);
  const start = () => {
    if (current.current) return;
    clock.current = new ActiveClock();
    if (!ready) return;
    const attemptId = pendingId.current ?? createAttemptId();
    if (!pendingId.current) setBoardId(attemptId);
    pendingId.current = null;
    current.current = { attemptId, words: [], activeSeconds: 0, hints: 0, status: "in_progress", puzzleVersion: "word-search-v1", foundPaths: {}, selection: [] };
    setStarted(true); focused.current = true; syncClock(); publish();
  };
  const found = (words: string[], foundPaths: Record<string, number[]>) => {
    start();
    if (!current.current) return;
    current.current!.words = [...words];
    current.current!.foundPaths = foundPaths;
    current.current!.selection = [];
    if (words.length === 30) { current.current!.status = "completed"; syncClock(); }
    publish();
  };
  const select = (selection: number[]) => {
    if (!current.current || current.current.status !== "in_progress") return;
    if (current.current.selection.join(",") === selection.join(",")) return;
    current.current.selection = [...selection];
    publish();
  };
  // At most MAX_HINTS per attempt. Returns false when no hint may be given.
  const hint = () => {
    start();
    if (!current.current || current.current.status !== "in_progress" || current.current.hints >= MAX_HINTS) return false;
    current.current.hints++; setHints(current.current.hints); publish();
    return true;
  };
  const reset = () => {
    if (current.current) {
      if (current.current.status !== "completed") current.current.status = "stopped";
      syncClock(); publish();
    }
    current.current = null; latest.current = null; clock.current = new ActiveClock();
    setSeconds(0); setHints(0); setStarted(false); pauseRef.current = false; setPaused(false);
    prepare();
  };
  const togglePause = () => {
    pauseRef.current = !pauseRef.current; setPaused(pauseRef.current); syncClock(); publish();
  };
  const retry = () => publish();
  const hintsLeft = Math.max(0, MAX_HINTS - hints);
  return { boardId, hintsLeft, seconds, hints, paused, started, ready, saveMessage, start, found, select, hint, reset, togglePause, retry };
}
