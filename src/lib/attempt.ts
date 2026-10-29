export type Snapshot = {
  attemptId: string; words: string[]; activeSeconds: number; hints: number;
  status: "in_progress" | "completed" | "stopped";
  puzzleVersion: "word-search-v1";
  foundPaths: Record<string, number[]>;
  selection: number[];
};

export class ActiveClock {
  private total = 0;
  private since: number | null = null;
  private now: () => number;
  constructor(now: () => number = () => performance.now(), initialSeconds = 0) {
    this.now = now;
    this.total = Math.max(0, initialSeconds) * 1000;
  }
  setRunning(running: boolean) {
    if (this.since !== null) this.total += Math.max(0, this.now() - this.since);
    this.since = running ? this.now() : null;
  }
  seconds() {
    return Math.floor((this.total + (this.since === null ? 0 : Math.max(0, this.now() - this.since))) / 1000);
  }
}

export function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseSnapshot(value: unknown): Snapshot | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Partial<Snapshot>;
  if (!data.attemptId || !UUID.test(data.attemptId) || data.puzzleVersion !== "word-search-v1") return null;
  if (!Array.isArray(data.words) || data.words.length > 30 || data.words.some((word) => typeof word !== "string" || !/^[A-Z]{3,20}$/.test(word))) return null;
  if (new Set(data.words).size !== data.words.length) return null;
  if (!Number.isInteger(data.activeSeconds) || data.activeSeconds! < 0 || data.activeSeconds! > 86400) return null;
  if (!Number.isInteger(data.hints) || data.hints! < 0 || data.hints! > 10000) return null;
  if (!data.status || !["in_progress", "completed", "stopped"].includes(data.status)) return null;
  if (!data.foundPaths || typeof data.foundPaths !== "object" || Array.isArray(data.foundPaths)) return null;
  const foundPaths: Record<string, number[]> = {};
  for (const [word, path] of Object.entries(data.foundPaths)) {
    if (!data.words.includes(word) || !validCells(path, 30)) return null;
    foundPaths[word] = [...path];
  }
  if (!Array.isArray(data.selection) || !validCells(data.selection, 30)) return null;
  if (data.status === "completed" && data.words.length !== 30) return null;
  return { ...data, words: [...data.words], foundPaths, selection: [...data.selection] } as Snapshot;
}

function validCells(value: unknown, maxLength: number): value is number[] {
  return Array.isArray(value) && value.length <= maxLength
    && value.every((cell) => Number.isInteger(cell) && cell >= 0 && cell < 441)
    && new Set(value).size === value.length;
}

// The public game never receives an account token, a PIN, or student identity.
export const PORTAL_ORIGIN = "https://mel-portal.netlify.app";
export const EMBEDDED = typeof window !== "undefined" && window.parent !== window;
export function sendToPortal(type: string, payload: unknown) {
  if (EMBEDDED) window.parent.postMessage({ channel: "ewm-word-search-v1", type, payload }, PORTAL_ORIGIN);
}
