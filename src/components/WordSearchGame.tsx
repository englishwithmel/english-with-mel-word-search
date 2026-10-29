import { useCallback, useEffect, useRef, useState } from "react";
import PuzzleBoard from "./PuzzleBoard";
import ProgressCard from "./ProgressCard";
import WordList from "./WordList";
import Celebration from "./Celebration";
import { useSpeech } from "../hooks/useSpeech";
import { useAttempt } from "../hooks/useAttempt";
import { formatTime, type Snapshot } from "../lib/attempt";
import {
  ALL_WORDS,
  FLAT_LETTERS,
  TOTAL_WORDS,
  WORD_PATHS,
  WORD_TONE,
} from "../data/puzzle";
import {
  CheckIcon,
  GridIcon,
  LightbulbIcon,
  ResetIcon,
  SparkleIcon,
  SpeakerIcon,
  VolumeIcon,
  VolumeOffIcon,
} from "./Icons";

const AUDIO_STORAGE_KEY = "ewm-word-search-audio";

type Feedback = {
  kind: "found" | "error" | "hint" | "info";
  message: string;
  word?: string;
};

type Toast = {
  id: number;
  message: string;
};

function getInitialAudioPreference() {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(AUDIO_STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export default function WordSearchGame() {
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundPaths, setFoundPaths] = useState<Record<string, number[]>>({});
  const [restoredSelection, setRestoredSelection] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [hintCell, setHintCell] = useState<number | null>(null);
  const [invalidPath, setInvalidPath] = useState<number[]>([]);
  const [resetToken, setResetToken] = useState(0);
  const [resetArmed, setResetArmed] = useState(false);
  const [audioOn, setAudioOn] = useState(getInitialAudioPreference);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const foundRef = useRef<string[]>([]);
  const foundPathsRef = useRef<Record<string, number[]>>({});
  const hintTimerRef = useRef<number | null>(null);
  const invalidTimerRef = useRef<number | null>(null);
  const boardCardRef = useRef<HTMLElement>(null);
  const { speak, stop, supported: speechSupported } = useSpeech();

  const applyRestore = useCallback((snapshot: Snapshot) => {
    const restoredPaths = Object.fromEntries(snapshot.words.map((word) => [word, snapshot.foundPaths[word] ?? WORD_PATHS[word]?.[0] ?? []]));
    foundRef.current = [...snapshot.words];
    foundPathsRef.current = restoredPaths;
    setFoundWords([...snapshot.words]);
    setFoundPaths(restoredPaths);
    setRestoredSelection([...snapshot.selection]);
    setResetToken((token) => token + 1);
  }, []);
  const attempt = useAttempt(applyRestore);

  const completed = foundWords.length === TOTAL_WORDS;

  useEffect(() => {
    try {
      window.localStorage.setItem(AUDIO_STORAGE_KEY, audioOn ? "on" : "off");
    } catch {
      // Preference storage is optional.
    }
  }, [audioOn]);

  useEffect(() => {
    if (!feedback || (feedback.kind !== "error" && feedback.kind !== "hint")) return;
    const timer = window.setTimeout(() => setFeedback(null), 2900);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2300);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (foundWords.length !== TOTAL_WORDS) return;
    const timer = window.setTimeout(() => setCelebrationOpen(true), 750);
    return () => window.clearTimeout(timer);
  }, [foundWords.length]);

  useEffect(() => {
    return () => {
      if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
      if (invalidTimerRef.current) window.clearTimeout(invalidTimerRef.current);
    };
  }, []);

  const stopHintTimer = useCallback(() => {
    if (hintTimerRef.current) {
      window.clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
  }, []);

  const flashInvalid = useCallback((path: number[]) => {
    setInvalidPath(path);
    if (invalidTimerRef.current) window.clearTimeout(invalidTimerRef.current);
    invalidTimerRef.current = window.setTimeout(() => setInvalidPath([]), 500);
  }, []);

  const handleWordAttempt = useCallback(
    (path: number[]) => {
      const selected = path.map((index) => FLAT_LETTERS[index]).join("");
      const reversed = [...selected].reverse().join("");

      if (selected.length < 3) {
        flashInvalid(path);
        setFeedback({ kind: "error", message: "Try a longer word — keep looking!" });
        return;
      }

      const matchedWord = ALL_WORDS.find((word) => word === selected || word === reversed);

      if (!matchedWord) {
        flashInvalid(path);
        setFeedback({ kind: "error", message: "Not quite — have another look!" });
        return;
      }

      if (foundRef.current.includes(matchedWord)) {
        setFeedback({
          kind: "info",
          message: `You already found ${matchedWord}. Try a new word!`,
        });
        return;
      }

      const nextFound = [...foundRef.current, matchedWord];
      const nextPaths = { ...foundPathsRef.current, [matchedWord]: path };
      foundRef.current = nextFound;
      foundPathsRef.current = nextPaths;
      setFoundWords(nextFound);
      setFoundPaths(nextPaths);
      setRestoredSelection([]);
      attempt.found(nextFound, nextPaths);
      stopHintTimer();
      setHintCell(null);
      setInvalidPath([]);
      setFeedback({ kind: "found", word: matchedWord, message: `Found ${matchedWord}!` });

      if (audioOn) {
        speak(matchedWord.toLowerCase(), { rate: 0.82 });
      }
    },
    [audioOn, flashInvalid, speak, stopHintTimer],
  );

  const handleHint = () => {
    const remaining = ALL_WORDS.filter((word) => !foundRef.current.includes(word));
    if (remaining.length === 0) return;

    const word = remaining[Math.floor(Math.random() * remaining.length)];
    const paths = WORD_PATHS[word];
    if (!paths?.length) return;
    attempt.hint();

    const path = paths[Math.floor(Math.random() * paths.length)];
    const firstLetter = path[0];

    stopHintTimer();
    setHintCell(null);
    setFeedback({
      kind: "hint",
      message: "A first letter is sparkling. Take a good look around it!",
    });

    hintTimerRef.current = window.setTimeout(() => {
      setHintCell(firstLetter);
      hintTimerRef.current = window.setTimeout(() => {
        setHintCell(null);
        hintTimerRef.current = null;
      }, 2700);
    }, 40);
  };

  const resetPuzzle = useCallback(() => {
    attempt.reset();
    stopHintTimer();
    if (invalidTimerRef.current) window.clearTimeout(invalidTimerRef.current);
    foundRef.current = [];
    foundPathsRef.current = {};
    setFoundWords([]);
    setFoundPaths({});
    setRestoredSelection([]);
    setFeedback(null);
    setHintCell(null);
    setInvalidPath([]);
    setResetToken((token) => token + 1);
    setResetArmed(false);
    setCelebrationOpen(false);
    stop();
  }, [attempt, stop, stopHintTimer]);

  const handleReset = () => setResetArmed(true);
  const cancelReset = () => setResetArmed(false);
  const confirmReset = () => {
    resetPuzzle();
    setToast({ id: Date.now(), message: "Fresh puzzle ready — happy hunting!" });
  };

  const handlePlayAgain = () => {
    resetPuzzle();
    setToast({ id: Date.now(), message: "Fresh puzzle ready — happy hunting!" });
    window.setTimeout(() => {
      boardCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleToggleAudio = () => {
    const next = !audioOn;
    setAudioOn(next);
    if (!next) stop();
    setToast({
      id: Date.now(),
      message: next
        ? "Audio on — found words will be read aloud."
        : "Audio off — tap any speaker to hear a word.",
    });
  };

  const handleSpeakWord = (word: string) => {
    if (!speechSupported) {
      setFeedback({
        kind: "info",
        message: "Read-aloud is not available in this browser.",
      });
      return;
    }
    speak(word.toLowerCase(), { rate: 0.8 });
  };

  const handleTapStart = useCallback(() => {
    setFeedback({
      kind: "info",
      message: "Nice start! Now tap the last letter of the word.",
    });
  }, []);

  const closeCelebration = useCallback(() => setCelebrationOpen(false), []);

  const feedbackWordTone = feedback?.word ? WORD_TONE[feedback.word] : undefined;

  const feedbackClasses =
    feedback?.kind === "error"
      ? "border-[#efc9bd] bg-[#fbe8e0] text-[#8a4f3d]"
      : feedback?.kind === "hint"
        ? "border-[#e9d799] bg-[#fbf2cf] text-[#745d22]"
        : feedback?.kind === "info"
          ? "border-[#d8e2e8] bg-[#eff5f7] text-[#4e6875]"
          : feedback?.kind === "found"
            ? "border-[#c3d8ba] bg-[#eff6eb] text-[#4b6745]"
            : "border-[#ebe1d2] bg-[#fffaf1] text-[#807968]";

  return (
    <main
      id="word-search-game"
      className="mx-auto mt-3 w-full max-w-[1120px] scroll-mt-4 px-3 pb-7 sm:mt-4 sm:px-6 lg:px-8"
    >
      <div className="soft-card mb-3 rounded-[18px] p-3 text-sm" aria-live="polite">
        <div className="flex flex-wrap items-center gap-3">
          <strong>Playing time: {formatTime(attempt.seconds)}</strong>
          <span>Hints used: {attempt.hints}</span>
          <button type="button" onClick={attempt.togglePause} disabled={!attempt.ready || !attempt.started || completed} className="rounded-lg border px-3 py-1">{attempt.paused ? "Resume" : "Pause"}</button>
        </div>
        <p className="mt-1 text-xs">{attempt.saveMessage}</p>
        {attempt.saveMessage.includes("try again") && <button type="button" onClick={attempt.retry} className="underline">Try saving again</button>}
      </div>
      <div className="grid items-start gap-3 md:grid-cols-[minmax(0,1fr)_292px] lg:grid-cols-[minmax(0,1fr)_316px] xl:grid-cols-[minmax(0,1fr)_376px] md:gap-3 xl:gap-4">
        <section
          ref={boardCardRef}
          className="soft-card rounded-[24px] p-2.5 sm:p-3"
          aria-labelledby="puzzle-title"
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sage-soft text-[#66815f]">
                <GridIcon className="h-3.5 w-3.5" />
              </span>
              <h2
                id="puzzle-title"
                className="whitespace-nowrap font-display text-[16px] font-bold leading-none text-ink sm:text-[17px]"
              >
                The puzzle
              </h2>
            </div>

            <div className="flex w-full flex-wrap items-center gap-1.5 md:ml-auto md:w-auto">
              <span className="mr-0.5 whitespace-nowrap rounded-full border border-[#eaddc9] bg-[#fbf3e5] px-2 py-1 text-[10px] font-extrabold text-[#776b58] sm:text-[10.5px]">
                Words Found:{" "}
                <span className="text-[#4f7049]" aria-live="polite">
                  {foundWords.length}
                </span>{" "}
                / {TOTAL_WORDS}
              </span>

              <div className="ml-auto flex items-center gap-1 md:ml-0">
                <button
                  type="button"
                  onClick={handleHint}
                  disabled={!attempt.ready || completed || attempt.paused}
                  className="inline-flex h-8 items-center justify-center sm:h-9 gap-1 rounded-[8px] border border-[#e5d291] bg-butter-soft px-2 text-[10px] font-extrabold text-[#725a24] transition hover:bg-[#f8ebac] disabled:cursor-not-allowed disabled:opacity-45 sm:text-[10.5px]"
                  title="Glow the first letter of one unfound word"
                >
                  <LightbulbIcon className="h-3.5 w-3.5" />
                  Hint
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!attempt.ready}
                  className="inline-flex h-8 items-center justify-center sm:h-9 gap-1 rounded-[8px] border border-[#e6dac7] bg-white px-2 text-[10px] font-extrabold text-[#677162] transition hover:bg-[#fcf7ed] disabled:opacity-45 sm:text-[10.5px]"
                  aria-label="Reset the word search"
                  title="Clear the board and start again"
                >
                  <ResetIcon className="h-3.5 w-3.5" />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className={`inline-flex h-8 items-center justify-center sm:h-9 gap-1 rounded-[8px] border px-2 text-[10px] font-extrabold transition sm:text-[10.5px] ${
                    audioOn
                      ? "border-[#bcd0b2] bg-[#ebf3e6] text-[#4d6c47]"
                      : "border-[#e2d6c3] bg-[#f7f1e6] text-[#8b8171]"
                  }`}
                  aria-pressed={audioOn}
                  title="Turn automatic word pronunciation on or off"
                >
                  {audioOn ? (
                    <VolumeIcon className="h-3.5 w-3.5" />
                  ) : (
                    <VolumeOffIcon className="h-3.5 w-3.5" />
                  )}
                  {audioOn ? "Audio on" : "Audio off"}
                </button>
              </div>
            </div>
          </div>

          <div className="puzzle-frame mt-2" onPointerDownCapture={attempt.start}>
            <fieldset disabled={!attempt.ready || attempt.paused} style={{ border: 0, padding: 0, margin: 0, position: "relative" }}>
            {!attempt.ready && <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-paper">Restoring your game…</div>}
            {attempt.paused && <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-paper"><button type="button" disabled={false} onClick={attempt.togglePause}>Paused — use Resume above</button></div>}
            <PuzzleBoard
              foundPaths={foundPaths}
              hintCell={hintCell}
              invalidPath={invalidPath}
              resetToken={resetToken}
              restoredSelection={restoredSelection}
              completed={completed}
              onWordAttempt={handleWordAttempt}
              onTapStart={handleTapStart}
              onSelectionChange={attempt.select}
            />
            </fieldset>
          </div>

          <div className="mt-2">
            <div
              className={`flex min-h-[30px] max-w-full items-center gap-1.5 rounded-[9px] border px-2 py-1.5 text-[10px] font-bold leading-tight sm:text-[10.5px] ${feedbackClasses}`}
              role="status"
              aria-live="polite"
            >
              {feedback?.kind === "found" && feedback.word ? (
                <>
                  <span
                    className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-white/80"
                    style={{ color: feedbackWordTone?.ink }}
                    aria-hidden="true"
                  >
                    <CheckIcon className="h-2.5 w-2.5" />
                  </span>
                  <span>{feedback.message}</span>
                  <button
                    type="button"
                    className="speaker-button ml-0.5"
                    onClick={() => handleSpeakWord(feedback.word ?? "")}
                    aria-label={`Hear the word ${feedback.word}`}
                    title={`Hear the word ${feedback.word}`}
                  >
                    <SpeakerIcon className="h-3 w-3" />
                  </button>
                </>
              ) : feedback?.kind === "hint" ? (
                <>
                  <SparkleIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>{feedback.message}</span>
                </>
              ) : feedback?.kind === "error" ? (
                <>
                  <ResetIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>{feedback.message}</span>
                </>
              ) : feedback ? (
                <span>{feedback.message}</span>
              ) : (
                <span>
                  Drag across a word — or tap its first and last letter. Across, down and diagonal
                  all work.
                </span>
              )}
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-2.5 sm:gap-3" aria-label="Progress and word list">
          <ProgressCard found={foundWords.length} />
          <WordList
            foundWords={foundWords}
            speechSupported={speechSupported}
            onSpeak={handleSpeakWord}
          />
        </aside>
      </div>

      <Celebration
        open={celebrationOpen}
        onPlayAgain={handlePlayAgain}
        onClose={closeCelebration}
      />

      {resetArmed && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/35 px-4" role="presentation">
          <div className="soft-card w-full max-w-sm rounded-[20px] p-5" role="dialog" aria-modal="true" aria-labelledby="reset-title">
            <h2 id="reset-title" className="font-display text-xl font-bold text-ink">Reset game?</h2>
            <p className="mt-2 text-sm text-[#6f675b]">This will erase your current progress.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="rounded-lg border px-4 py-2 font-bold" onClick={cancelReset}>Cancel</button>
              <button type="button" className="rounded-lg bg-[#b9664b] px-4 py-2 font-bold text-white" onClick={confirmReset}>Reset</button>
            </div>
          </div>
        </div>
      )}

      {toast ? (
        <div
          key={toast.id}
          className="toast-in fixed bottom-4 left-1/2 z-[70] flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-2 rounded-full border border-[#d8e2cf] bg-[#f7fbf2] px-4 py-2.5 text-[11px] font-extrabold text-[#4f6a48] shadow-[0_16px_40px_-20px_rgba(54,69,49,0.55)]"
          role="status"
          aria-live="polite"
        >
          <SparkleIcon className="h-3.5 w-3.5 shrink-0 text-[#b8963e]" />
          {toast.message}
        </div>
      ) : null}

      <p className="sr-only">
        {foundWords.length === 0
          ? "No words found yet."
          : `Found ${foundWords.length} of ${TOTAL_WORDS} words: ${foundWords.join(", ")}.`}
      </p>
    </main>
  );
}
