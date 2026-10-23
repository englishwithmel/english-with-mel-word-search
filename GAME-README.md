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

## Assets

Fonts load from Google Fonts, with local fallbacks. Audio uses browser speech synthesis;
voices vary by device. Illustrations and icons are embedded SVG. There are no recorded audio files.
