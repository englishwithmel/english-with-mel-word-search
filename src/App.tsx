import Header from "./components/Header";
import Hero from "./components/Hero";
import WordSearchGame from "./components/WordSearchGame";
import { FlowerMark } from "./components/Icons";

export default function App() {
  return (
    <div className="page-background min-h-screen font-sans text-ink">
      <a
        href="#word-search-game"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-extrabold focus:text-ink focus:shadow-lg"
      >
        Skip to the word search
      </a>

      <Header />
      <Hero />
      <WordSearchGame />

      <footer className="mx-auto w-full max-w-[1320px] px-3 pb-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-2.5 border-t border-[#e9dcc8]/90 pt-4 text-center sm:flex-row sm:text-left">
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10.5px] font-extrabold text-[#899184]">
            <FlowerMark className="h-5 w-5" />
            <span>English with Mel</span>
            <span className="h-1 w-1 rounded-full bg-[#c8bca9]" aria-hidden="true" />
            <span>Word games</span>
            <span className="h-1 w-1 rounded-full bg-[#c8bca9]" aria-hidden="true" />
            <span>Word search</span>
          </p>
          <p className="text-[10px] font-semibold text-[#9b9f93]">
            Find a little joy in every word. No countdown — take your time.
          </p>
        </div>
      </footer>
    </div>
  );
}
