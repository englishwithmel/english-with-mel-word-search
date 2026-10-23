import { EMBEDDED, PORTAL_ORIGIN } from "../lib/attempt";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { TONES } from "../data/puzzle";
import { CloseIcon, HomeIcon, ResetIcon, SparkleIcon, TrophyIcon } from "./Icons";

type CelebrationProps = {
  open: boolean;
  onPlayAgain: () => void;
  onClose: () => void;
};

type ConfettiStyle = CSSProperties & {
  "--drift": string;
  "--rotation": string;
  "--delay": string;
};

const CONFETTI = Array.from({ length: 34 }, (_, index) => {
  const tone = TONES[index % TONES.length];
  return {
    id: index,
    left: `${(index * 37 + 7) % 100}%`,
    background: index % 4 === 0 ? "#f6d989" : tone.solid,
    delay: `${(index % 10) * 0.11}s`,
    drift: `${(index % 2 === 0 ? 1 : -1) * (24 + ((index * 13) % 90))}px`,
    rotation: `${(index % 2 === 0 ? 1 : -1) * (180 + ((index * 41) % 540))}deg`,
    width: index % 3 === 0 ? "7px" : "9px",
    height: index % 3 === 0 ? "16px" : "12px",
    rounded: index % 5 === 0,
  };
});

export default function Celebration({ open, onPlayAgain, onClose }: CelebrationProps) {
  const playAgainRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => playAgainRef.current?.focus(), 120);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-[#34423a]/40 p-4 backdrop-blur-[3px]"
      role="presentation"
    >
      <div className="celebration-confetti" aria-hidden="true">
        {CONFETTI.map((piece) => {
          const style: ConfettiStyle = {
            left: piece.left,
            backgroundColor: piece.background,
            width: piece.width,
            height: piece.height,
            borderRadius: piece.rounded ? "999px" : "2px",
            "--drift": piece.drift,
            "--rotation": piece.rotation,
            "--delay": piece.delay,
          };
          return <span key={piece.id} className="confetti-piece" style={style} />;
        })}
      </div>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
        aria-describedby="celebration-description"
        className="modal-in relative w-full max-w-[430px] overflow-hidden rounded-[30px] border border-[#ecddc6] bg-[#fffbf2] px-5 pb-6 pt-7 text-center shadow-[0_35px_90px_-30px_rgba(49,59,48,0.55)] sm:px-8 sm:pb-8"
      >
        <div
          className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-[#f9e2d4]/70 blur-xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-12 top-10 h-32 w-32 rounded-full bg-[#e3efdd]/80 blur-xl"
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close celebration and view the finished puzzle"
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border border-[#e8dbc7] bg-white/80 text-[#807966] transition hover:bg-white hover:text-ink"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>

        <div className="relative mx-auto w-fit">
          <span className="absolute -left-9 top-2 text-[#ddac52]">
            <SparkleIcon className="h-5 w-5" />
          </span>
          <span className="absolute -right-9 top-1 text-[#93ac84]">
            <SparkleIcon className="h-4 w-4" />
          </span>
          <span className="grid h-[76px] w-[76px] place-items-center rounded-full border border-[#ead8b8] bg-[#faf0d8] shadow-[0_8px_0_#f1e3c8]">
            <TrophyIcon className="h-11 w-11" />
          </span>
        </div>

        <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#9b8a6d]">
          30 out of 30 words
        </p>
        <h2
          id="celebration-title"
          className="mt-1 font-display text-[40px] font-extrabold leading-none tracking-[-0.015em] text-[#3e5441] sm:text-[46px]"
        >
          Great job!
        </h2>
        <p
          id="celebration-description"
          className="mt-2 font-display text-[19px] font-bold text-[#7d5a45]"
        >
          You found all 30 words!
        </p>
        <p className="mx-auto mt-1.5 max-w-[300px] text-[12px] font-semibold leading-relaxed text-[#7c8173]">
          You followed every trail and marked off the whole list. Word-search star!
        </p>

        <div className="mx-auto mt-4 flex w-fit items-center gap-1.5 rounded-full border border-[#e9dcc8] bg-white/70 px-3 py-1.5">
          {TONES.map((tone) => (
            <span
              key={tone.id}
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: tone.solid }}
              aria-hidden="true"
            />
          ))}
          <span className="ml-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#7f8a76]">
            6 sets complete
          </span>
        </div>

        <div className="relative mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            ref={playAgainRef}
            type="button"
            onClick={onPlayAgain}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#5e7f57] px-4 py-3 text-[13px] font-extrabold text-white shadow-[0_4px_0_#46653f] transition hover:bg-[#54754d] active:translate-y-0.5 active:shadow-[0_2px_0_#46653f]"
          >
            <ResetIcon className="h-4 w-4" />
            Play Again
          </button>
          <a
            hidden={EMBEDDED}
            href={PORTAL_ORIGIN} onClick={(event) => { if (EMBEDDED) event.preventDefault(); }}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#e2d4bf] bg-white px-4 py-3 text-[13px] font-extrabold text-[#556152] shadow-[0_4px_0_#ece1d1] transition hover:bg-[#fffaf0] active:translate-y-0.5 active:shadow-[0_2px_0_#ece1d1]"
          >
            <HomeIcon className="h-4 w-4" />
            Home
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}
