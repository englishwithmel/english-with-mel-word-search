import { TOTAL_WORDS } from "../data/puzzle";
import { StarIcon } from "./Icons";

type ProgressCardProps = {
  found: number;
};

function ProgressRing({ percentage }: { percentage: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative h-[44px] w-[44px] shrink-0" aria-hidden="true">
      <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="#f0e6d5" strokeWidth="5.5" />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="#95b48a"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-[10.5px] font-extrabold text-[#4f6d4a]">
        {percentage}%
      </span>
    </div>
  );
}

export default function ProgressCard({ found }: ProgressCardProps) {
  const remaining = TOTAL_WORDS - found;
  const percentage = Math.round((found / TOTAL_WORDS) * 100);

  return (
    <section
      className="soft-card rounded-[22px] px-3 py-2 sm:px-3.5"
      aria-labelledby="progress-title"
    >
      <div className="flex items-center gap-2.5">
        <ProgressRing percentage={percentage} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex min-w-0 items-center gap-1">
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-butter-soft text-[#93742d]">
                <StarIcon className="h-2.5 w-2.5" />
              </span>
              <h2
                id="progress-title"
                className="whitespace-nowrap font-display text-[16px] font-bold leading-none text-ink"
              >
                Your progress
              </h2>
            </div>
            <span className="whitespace-nowrap text-[10px] font-extrabold uppercase tracking-[0.06em] text-[#9a927f] md:hidden xl:inline">
              {remaining === 0 ? "Complete" : `${remaining} to go`}
            </span>
          </div>
          <p className="mt-1 flex items-baseline gap-1.5 leading-none">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8b9285]">
              Words Found:
            </span>
            <span
              className="font-display text-[19px] font-extrabold leading-none text-[#4e7048]"
              aria-live="polite"
            >
              {found}
              <span className="text-[13px] font-bold text-[#9ba391]"> / {TOTAL_WORDS}</span>
            </span>
          </p>
        </div>
      </div>

      <div
        className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-[#f1e7d6]"
        role="progressbar"
        aria-label="Words found"
        aria-valuemin={0}
        aria-valuemax={TOTAL_WORDS}
        aria-valuenow={found}
      >
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#f0b7c8,#f2d993,#b5d3a6,#a9cbe0,#c5b6e1,#f1bba1)] transition-[width] duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </section>
  );
}
