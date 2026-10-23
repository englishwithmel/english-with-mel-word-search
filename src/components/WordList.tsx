import { SpeakerIcon } from "./Icons";
import { TOTAL_WORDS, WORD_GROUPS } from "../data/puzzle";

type WordListProps = {
  foundWords: string[];
  speechSupported: boolean;
  onSpeak: (word: string) => void;
};

export default function WordList({
  foundWords,
  speechSupported,
  onSpeak,
}: WordListProps) {
  const foundSet = new Set(foundWords);

  return (
    <section
      className="soft-card rounded-[24px] p-3 sm:p-3.5"
      aria-labelledby="word-list-title"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h2 id="word-list-title" className="font-display text-[19px] font-bold leading-none text-ink">
            Word list
          </h2>
          <span className="whitespace-nowrap rounded-full border border-[#eadbc4] bg-[#fbf3e5] px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-[0.08em] text-[#867357]">
            6 × 5 words
          </span>
        </div>
        <span
          className="shrink-0 font-display text-[13px] font-bold text-[#4d6d48]"
          aria-label={`${foundWords.length} of ${TOTAL_WORDS} words found`}
        >
          {foundWords.length}
          <span className="text-[10px] text-[#81937b]"> / {TOTAL_WORDS}</span>
        </span>
      </div>
      <p className="mt-1 text-[10px] font-semibold leading-tight text-muted sm:text-[10.5px]">
        Six groups of five. Tap a speaker to listen.
      </p>

      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:gap-2 xl:grid-cols-3">
        {WORD_GROUPS.map((group, groupIndex) => {
          const groupFound = group.words.filter((word) => foundSet.has(word)).length;

          return (
            <div
              key={group.id}
              className="rounded-[11px] border-[1.5px] px-1.5 pb-1 pt-0.5"
              style={{ backgroundColor: group.tone.soft, borderColor: group.tone.line }}
              aria-label={`Colour group ${groupIndex + 1} of 6, ${groupFound} of 5 words found`}
            >
              <div className="mb-[3px] flex items-center justify-between gap-1 px-0.5">
                <span className="flex items-center gap-[2px]" aria-hidden="true">
                  {group.words.map((word, wordIndex) => (
                    <span
                      key={`${group.id}-dot-${wordIndex}`}
                      className="h-[5px] w-[5px] rounded-[1.5px] transition-colors"
                      style={{
                        backgroundColor: foundSet.has(word) ? group.tone.deep : "rgba(255,253,248,0.9)",
                        boxShadow: foundSet.has(word) ? "none" : `inset 0 0 0 1px ${group.tone.line}`,
                      }}
                    />
                  ))}
                </span>
                <span
                  className="font-display text-[9px] font-bold leading-none tabular-nums"
                  style={{ color: group.tone.ink, opacity: 0.72 }}
                >
                  {groupFound}/5
                </span>
              </div>

              <ul>
                {group.words.map((word) => {
                  const isFound = foundSet.has(word);

                  return (
                    <li
                      key={word}
                      className={`flex min-h-[16px] items-center justify-between gap-0.5 rounded-[5px] py-0 pl-[4px] pr-[2px] transition-colors ${
                        isFound ? "chip-pop" : ""
                      }`}
                      style={{
                        backgroundColor: isFound ? group.tone.solid : "rgba(255, 253, 248, 0.56)",
                      }}
                    >
                      <span
                        className="min-w-0 flex-1 truncate text-[10px] font-extrabold tracking-[0.015em] sm:text-[10.5px] xl:text-[10px]"
                        style={{
                          color: group.tone.ink,
                          textDecoration: isFound ? "line-through" : "none",
                          textDecorationThickness: "1px",
                          textDecorationColor: group.tone.deep,
                        }}
                      >
                        {word}
                        {isFound ? <span className="sr-only"> found</span> : null}
                      </span>

                      {isFound ? (
                        <button
                          type="button"
                          className="speaker-button speaker-button--compact"
                          style={{ color: group.tone.ink }}
                          onClick={() => onSpeak(word)}
                          disabled={!speechSupported}
                          title={
                            speechSupported
                              ? `Hear the word ${word}`
                              : "Speech is not available in this browser"
                          }
                          aria-label={`Hear the word ${word}`}
                        >
                          <SpeakerIcon className="h-[9px] w-[9px]" />
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
