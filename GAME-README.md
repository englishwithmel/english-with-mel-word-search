# English with Mel — Word Search

A 30-word React game for GitHub Pages, embedded in the English with Mel portal.

## Development

Use Node 22.18 or newer. Run `npm ci`, `npm run check`, `npm test`, then `npm run dev`.
Build with `npm run build`. Output is in `dist/`. Asset paths are relative so repository-based GitHub Pages URLs work.

## Publish

In GitHub repository Settings → Pages, select **GitHub Actions** as the source.
The included workflow builds and publishes the game when `main` changes.
The intended repository name is `english-with-mel-word-search` under `englishwithmel`.

## Saved results

Opened on its own, this is practice mode and does not save student records.
When embedded by `https://mel-portal.netlify.app`, it reports attempts to the parent portal.
The portal authenticates the learner and saves results in Supabase. No student names,
account tokens, PINs or database secrets belong in this repository or iframe.

Each attempt records words found, active seconds, hint count and completion status.
Timing starts with interaction and pauses when paused explicitly, hidden or unfocused.
Reset starts a separate attempt after retaining the previous result.
Progress is sent on finds, hints, pauses and every 10 seconds. Check the visible save status
before leaving: unsaved browser state cannot be guaranteed after closing the tab or losing access.
The timer and score are browser-reported learning records, not a tamper-proof examination system.

## Boards and hints

Every genuinely new attempt (first open, Reset, Play Again, a new assignment) gets a new random
21×21 board with the same 30 words. The board is a deterministic function of the attempt id
(`src/data/layout.ts`): new ids are UUIDv8 values `xxxxxxxx-xxxx-8001-…` (`001` = generator version).
The attempt id is already saved by the portal and Supabase, so refresh, remount and restore rebuild
exactly the same board. Older UUIDv4 attempts keep the original fixed board (`src/data/puzzle.ts`).
A board is shown only when all 30 words appear exactly once at their stored paths.
**Never change the output of generator version 1** (pinned by a golden test): saved games would move.
A new algorithm needs a new version number and must keep version 1 working.

Each attempt allows 5 hints ("Hints left: N"); a hint sparkles the first letter of one unfound word.
Hints never reduce the words-found score; hints used are saved for Game Results.

## Assets

Fonts load from Google Fonts, with local fallbacks. Audio uses browser speech synthesis;
voices vary by device. Illustrations and icons are embedded SVG. There are no recorded audio files.
