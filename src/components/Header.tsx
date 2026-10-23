import { EMBEDDED, PORTAL_ORIGIN } from "../lib/attempt";
import { BookIcon, FlowerMark, HomeIcon } from "./Icons";

export default function Header() {
  if (EMBEDDED) return null;
  return (
    <header className="mx-auto w-full max-w-[1320px] px-3 pt-3 sm:px-6 sm:pt-5 lg:px-8">
      <div className="flex items-center justify-between gap-3 rounded-[22px] border border-line bg-paper/85 px-3 py-2.5 shadow-[0_18px_45px_-42px_rgba(84,66,40,0.75)] backdrop-blur sm:px-5">
        <a
          href={PORTAL_ORIGIN} onClick={(event) => { if (EMBEDDED) event.preventDefault(); }}
          className="group flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9c7f4a]"
          aria-label="English with Mel home"
        >
          <FlowerMark className="h-9 w-9 shrink-0 transition-transform duration-300 group-hover:-rotate-6 sm:h-10 sm:w-10" />
          <span className="min-w-0">
            <span className="block truncate font-display text-[17px] font-bold leading-none text-ink sm:text-[19px]">
              English <span className="text-[#c67d5e]">with Mel</span>
            </span>
            <span className="mt-1 block text-[9px] font-extrabold uppercase tracking-[0.18em] text-muted sm:text-[10px]">
              Student portal
            </span>
          </span>
        </a>

        <nav
          aria-label="Portal breadcrumb"
          className="hidden items-center gap-2.5 text-[13px] font-bold text-[#859080] md:flex"
        >
          <span className="inline-flex items-center gap-1.5">
            <BookIcon className="h-4 w-4" />
            Word games
          </span>
          <span className="h-1 w-1 rounded-full bg-[#c4baa8]" aria-hidden="true" />
          <span className="rounded-full bg-sage-soft px-3 py-1.5 text-[#4d6b4b]">Word search</span>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-[#eadcc6] bg-[#faf3e5] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#7d6a50] sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" aria-hidden="true" />
            Play &amp; learn
          </span>
          <a
            href={PORTAL_ORIGIN} onClick={(event) => { if (EMBEDDED) event.preventDefault(); }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e4d7c1] bg-white px-2.5 py-2 text-[11px] font-extrabold text-[#506053] shadow-sm transition hover:border-[#cdbfa8] hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9c7f4a] sm:px-3 sm:text-xs"
          >
            <HomeIcon className="h-3.5 w-3.5" />
            Home
          </a>
        </div>
      </div>
    </header>
  );
}
