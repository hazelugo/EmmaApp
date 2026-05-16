# Technology Stack

**Analysis Date:** 2026-04-14

## Runtime & Language

**Primary:**
- JavaScript (ES Modules) — all source files under `src/`
- No TypeScript; plain `.js` and `.vue` files throughout

**Runtime:**
- Node.js v25.9.0 (active environment)
- No explicit engine constraint in `package.json`

## Framework

**Core:**
- Vue 3 (`^3.5.32`) — Composition API with `<script setup>` SFCs
  - Entry: `src/main.js` mounts `App.vue` onto `#app`
  - Component model: Single-File Components (`.vue`)
  - Composables pattern used for shared logic: `src/composables/`
  - No Vue Router, no Vuex/Pinia — single-screen app with local state

## Build System

**Bundler:**
- Vite `^8.0.4` — dev server and production bundler
- Config: `vite.config.js`

**Plugins:**
- `@vitejs/plugin-vue` `^6.0.5` — Vue SFC support
- `@tailwindcss/vite` `^4.2.2` — Tailwind CSS v4 integrated via Vite plugin

**Build Scripts (from `package.json`):**
```bash
npm run dev       # Vite dev server
npm run build     # Production build
npm run preview   # Preview production build locally
```

**Package Manager:**
- npm — lockfile at `package-lock.json` (lockfile version 3, npm 7+)

## Styling

**Approach:** Tailwind CSS v4 (`^4.2.2`) via `@tailwindcss/vite` plugin

**Entry:** `src/style.css` imports Tailwind with `@import "tailwindcss"` and defines the full design system using Tailwind v4's `@theme` block.

**Design Tokens (defined in `src/style.css` `@theme` block):**
- Mario/Nintendo-themed color palette: `--color-peach`, `--color-mario-red`, `--color-luigi`, `--color-star-gold`, `--color-rosalina`, `--color-coin`, etc.
- Custom fonts: `--font-display` and `--font-body` both set to `'Gamtex', 'Outfit', sans-serif`

**Custom Fonts:**
- `Gamtex` — local TTF at `src/assets/fonts/Gamtex.ttf`, loaded via `@font-face`
- `Outfit` (wght 400/600/800/900) — loaded from Google Fonts via `<link>` in `index.html`

**Custom Animation Classes (defined in `src/style.css`):**
- `.star-bounce`, `.animate-float`, `.block-bump`, `.pulse-glow`, `.coin-spin`, `.shake`, `.btn-press`, `.roll-in`, `.pop-in`, `.oneup-pop`, `.rainbow-shimmer`
- Reduced-motion support: `@media (prefers-reduced-motion: reduce)` disables all animations

## State Management

**Pattern:** Vue Composition API composables — no external state library

- `src/composables/useMathGame.js` — core game state (stars, streak, current problem, feedback, adaptive difficulty). Persists `emma-stars` and `emma-streak` to `localStorage`.
- `src/composables/useSound.js` — mute state (`isMuted` ref), Web Audio API context singleton

**Persistence:**
- `localStorage` keys: `emma-stars`, `emma-streak`
- No server-side persistence

## Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `vue` | `^3.5.32` | Core UI framework |
| `canvas-confetti` | `^1.9.4` | Confetti animation on correct answers (`src/App.vue`) |

## Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `vite` | `^8.0.4` | Dev server and bundler |
| `@vitejs/plugin-vue` | `^6.0.5` | Vue SFC compilation |
| `@tailwindcss/vite` | `^4.2.2` | Tailwind CSS v4 Vite integration |
| `tailwindcss` | `^4.2.2` | Utility-first CSS framework |

**No testing framework configured.** No linting or formatting tools (no ESLint, Prettier, Biome, or similar) in `package.json`.

---

*Stack analysis: 2026-04-14*
