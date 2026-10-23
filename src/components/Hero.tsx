import type { CSSProperties, ReactNode } from "react";
import { TONES, type Tone } from "../data/puzzle";
import { GridIcon, SearchIcon, SparkleIcon, SpeakerIcon } from "./Icons";

const TITLE = "Scrabble & Speak";
const TITLE_COLORS = ["#D94F86", "#C3931B", "#4E9457", "#3F8AB5", "#8465BD", "#D97A4F"];
const SEARCH_LETTERS = "SEARCH".split("");
const SEARCH_TONES = [TONES[0], TONES[1], TONES[2], TONES[3], TONES[4], TONES[5]];

function DoodleSun() {
  return (
    <svg
      viewBox="0 0 68 68"
      className="pointer-events-none absolute right-3 top-2 hidden h-12 w-12 sm:block lg:right-[286px] lg:h-14 lg:w-14"
      aria-hidden="true"
    >
      <circle cx="34" cy="34" r="18" fill="#F4D67E" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <rect
          key={angle}
          x="31.5"
          y="5"
          width="5"
          height="9"
          rx="2.5"
          fill="#E9C665"
          transform={`rotate(${angle} 34 34)`}
        />
      ))}
      <circle cx="28" cy="31" r="1.8" fill="#6C6440" />
      <circle cx="40" cy="31" r="1.8" fill="#6C6440" />
      <path d="M28 39c3.5 3.3 8.5 3.3 12 0" stroke="#6C6440" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="24" cy="37" r="2.4" fill="#F0AF94" opacity="0.72" />
      <circle cx="44" cy="37" r="2.4" fill="#F0AF94" opacity="0.72" />
    </svg>
  );
}

function TitleTile({ letter, tone, index }: { letter: string; tone: Tone; index: number }) {
  const style: CSSProperties = {
    backgroundColor: tone.soft,
    borderColor: tone.line,
    color: tone.ink,
    boxShadow: `0 3px 0 ${tone.line}`,
    transform: `rotate(${index % 2 === 0 ? -1.4 : 1.2}deg)`,
  };

  return (
    <span className="title-search-tile" style={style} aria-hidden="true">
      {letter}
    </span>
  );
}

function Step({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-[#6b795f] shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        {icon}
      </span>
      <span className="min-w-0 text-[10px] font-bold leading-tight text-[#63705f]">{children}</span>
    </li>
  );
}

export default function Hero() {
  return (
    <section className="mx-auto mt-3 w-full max-w-[1320px] px-3 sm:mt-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[24px] border border-[#ecdfca] bg-[linear-gradient(112deg,#fff8ed_0%,#fdf1e2_46%,#edf5e8_100%)] px-4 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_20px_48px_-48px_rgba(84,66,40,0.58)] sm:px-5 sm:py-3 lg:px-6">
        <div
          className="pointer-events-none absolute -left-12 bottom-[-78px] h-36 w-36 rounded-full bg-[#f8ddce]/60 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-[28%] top-[-80px] h-36 w-36 rounded-full bg-[#dcebd7]/75 blur-2xl"
          aria-hidden="true"
        />
        <DoodleSun />
        <svg
          viewBox="0 0 32 32"
          className="pointer-events-none absolute bottom-2 right-[44%] hidden h-5 w-5 lg:block"
          aria-hidden="true"
        >
          <path
            d="m16 2 3.5 9.1L29 13.6l-7.2 6.6 2.1 9.6-8.3-4.8-8.3 4.8 2.1-9.6L1.4 13.6l9.5-2.5L16 2Z"
            fill="#F3D480"
            stroke="#D8B75A"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>

        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#7d8779] sm:text-[9.5px]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ead8bf] bg-white/85 px-2 py-0.5 text-[#976b4f]">
                <SparkleIcon className="h-2.5 w-2.5" />
                English with Mel
              </span>
              <span>Word game</span>
              <span className="h-1 w-1 rounded-full bg-[#c9bdab]" aria-hidden="true" />
              <span>30 words</span>
              <span className="hidden h-1 w-1 rounded-full bg-[#c9bdab] sm:block" aria-hidden="true" />
              <span className="hidden sm:inline">6 colour groups</span>
              <span className="hidden h-1 w-1 rounded-full bg-[#c9bdab] md:block" aria-hidden="true" />
              <span className="hidden md:inline">No countdown</span>
            </div>

            <h1 className="mt-1.5" aria-label="Scrabble and Speak — Word Search">
              <span className="sr-only">Scrabble &amp; Speak — Word Search</span>
              <span
                aria-hidden="true"
                className="title-rainbow block font-display font-extrabold leading-[0.95] tracking-[-0.015em]"
              >
                {TITLE.split("").map((letter, index) => {
                  if (letter === " ") return <span key={`space-${index}`}>&nbsp;</span>;
                  return (
                    <span
                      key={`${letter}-${index}`}
                      className={letter === "&" ? "title-ampersand" : undefined}
                      style={{ color: TITLE_COLORS[index % TITLE_COLORS.length] }}
                    >
                      {letter}
                    </span>
                  );
                })}
              </span>
              <span
                aria-hidden="true"
                className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5"
              >
                <span className="flex items-center gap-[3px] sm:gap-1">
                  <span
                    className="mr-0.5 inline-flex items-center justify-center rounded-[6px] border border-[#e8d9c1] bg-[#fffdf8] px-1.5 font-display text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#7e8a76] shadow-[0_2px_0_#eadfcb] sm:text-[11px]"
                    style={{ height: "clamp(23px, 3.1vw, 30px)" }}
                  >
                    Word
                  </span>
                  {SEARCH_LETTERS.map((letter, index) => (
                    <TitleTile
                      key={`search-${letter}-${index}`}
                      letter={letter}
                      tone={SEARCH_TONES[index]}
                      index={index}
                    />
                  ))}
                </span>
                <span className="hand-glow font-hand text-[19px] font-semibold leading-none text-[#805f48] sm:text-[21px]">
                  Find the hidden words!
                </span>
              </span>
            </h1>
          </div>

          <aside className="hidden w-[238px] shrink-0 rounded-[18px] border border-white/90 bg-white/65 px-3 py-2.5 shadow-[0_12px_30px_-30px_rgba(76,64,43,0.7)] backdrop-blur lg:block">
            <div className="flex items-center justify-between">
              <p className="font-display text-[13px] font-bold text-[#3e4f43]">How to play</p>
              <span className="rounded-full bg-peach-soft px-2 py-0.5 text-[7.5px] font-extrabold uppercase tracking-[0.1em] text-[#97654d]">
                3 steps
              </span>
            </div>
            <ol className="mt-1.5 space-y-1">
              <Step icon={<SearchIcon className="h-2.5 w-2.5" />}>Pick a word from the list.</Step>
              <Step icon={<GridIcon className="h-2.5 w-2.5" />}>Drag across its letters.</Step>
              <Step icon={<SpeakerIcon className="h-2.5 w-2.5" />}>Words mark off automatically. Tap to listen.</Step>
            </ol>
          </aside>
        </div>
      </div>
    </section>
  );
}
