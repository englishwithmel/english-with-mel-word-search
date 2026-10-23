export type Snapshot = {
  attemptId: string; words: string[]; activeSeconds: number; hints: number;
  status: "in_progress" | "completed" | "stopped";
};

export class ActiveClock {
  private total = 0;
  private since: number | null = null;
  private now: () => number;
  constructor(now: () => number = () => performance.now()) { this.now = now; }
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

// The public game never receives an account token, a PIN, or student identity.
export const PORTAL_ORIGIN = "https://mel-portal.netlify.app";
export const EMBEDDED = typeof window !== "undefined" && window.parent !== window;
export function sendToPortal(type: string, payload: unknown) {
  if (EMBEDDED) window.parent.postMessage({ channel: "ewm-word-search-v1", type, payload }, PORTAL_ORIGIN);
}
