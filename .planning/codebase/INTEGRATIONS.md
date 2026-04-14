# External Integrations

**Analysis Date:** 2026-04-14

## APIs & Services

**Google Fonts:**
- Purpose: Loads the `Outfit` typeface (weights 400, 600, 800, 900)
- How it's called: `<link>` tags in `index.html` with `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com`
- Auth: None (public CDN)
- Files: `index.html` lines 9–11

No other external HTTP APIs are called. All game logic is client-side only.

## Environment Variables

No `.env` or `.env.example` files detected in the repository. The app requires no environment variables at runtime — there are no API keys, backend URLs, or service credentials.

## Webhooks / Event Sources

None. The app has no inbound webhooks and makes no outbound HTTP requests beyond the Google Fonts CDN load at page render.

## Third-party SDKs

**canvas-confetti (`^1.9.4`):**
- Purpose: Renders a confetti particle burst on correct answers
- How it's used: Imported directly in `src/App.vue`; called as `confetti({ particleCount, spread, origin, colors, shapes })` inside the `onSubmit` handler when the answer is correct
- Auth: None (open-source npm package, no API key)

**Web Audio API (browser built-in):**
- Purpose: Synthesized Mario-inspired sound effects — no external audio service
- How it's used: `src/composables/useSound.js` creates a singleton `AudioContext` and uses `OscillatorNode` + `GainNode` to produce all sounds programmatically
- A stub `playSuccessMP3()` function exists for a future local MP3 (`/public/sounds/coin.mp3` is present in `public/sounds/`) but is not wired to actual audio playback yet

**localStorage (browser built-in):**
- Purpose: Persists player progress (`emma-stars`, `emma-streak`) across sessions
- How it's used: Read on composable init in `src/composables/useMathGame.js`; written on each correct/incorrect answer

## Assets

All game assets are bundled locally — no external image CDN or asset service:
- Character images: `src/assets/` (castle.png, daisy.png, hero.png, mario-coin.png, mascot.png, question-block.png, rosalina.png, star.png, toad.png)
- Custom font: `src/assets/fonts/Gamtex.ttf`
- Audio placeholder: `public/sounds/coin.mp3` (present but not yet played)
- Icons/favicon: `public/favicon.svg`, `public/icons.svg`

---

*Integration audit: 2026-04-14*
