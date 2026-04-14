# Architecture

**Analysis Date:** 2026-04-14

## Overview

Emma's Star World is a single-page, client-rendered Vue 3 math game for children. There is no backend, no routing system, and no server component. The entire application runs in the browser as a static SPA bundled by Vite. State is ephemeral (reactive refs) with lightweight persistence via `localStorage` for score and streak.

## Application Type

- **SPA (Single-Page Application)** — single `index.html` entry, no routing
- **Client-only rendering** — no SSR, no API layer
- **Static build** — output is deployable to any static host (Vercel, Netlify, etc.)

## Data Flow

```
localStorage (stars, streak)
       │
       ▼
useMathGame composable  ◄──────────────────────────────────┐
  - stars (ref)                                             │
  - streak (ref)                                            │
  - currentProblem (reactive)                               │
  - answer (ref)                                            │
  - feedback (ref)                                          │
  - difficulty (reactive, adaptive ZPD algorithm)           │
       │                                                    │
       ▼                                                    │
App.vue (root orchestrator)                                 │
  - receives all game state via destructuring               │
  - handles submit logic (correct/wrong branches)           │
  - calls generateProblem() after answer cycle              │
       │                                                    │
       ├─► ScoreHeader.vue  (displays stars, streak, mute)  │
       ├─► MascotPanel.vue  (displays character + feedback) │
       ├─► ChallengeZone.vue (displays problem + answer box)│
       ├─► NumberPad.vue    (emits digit/backspace/submit)  │
       └─► LevelUpModal.vue (triggers at every 10 stars)    │
                                                            │
useSound composable ────────────────────────────────────────┘
  (Web Audio API — synthesized Mario-inspired sounds)
```

**Answer cycle:**
1. User taps digit → `NumberPad` emits `digit` → `App.vue` calls `appendDigit()` → `answer` ref updates → `ChallengeZone` re-renders
2. User taps GO → `App.vue` calls `checkAnswer()` → `feedback` ref set to `'correct'` or `'wrong'`
3. Correct: confetti fires, `playCorrect()` / `playSuccessMP3()` called, `stars++`, `streak++`, saved to `localStorage`, after 1400ms `generateProblem()` called
4. Wrong: `playWrong()` called, `streak` resets to 0, after 900ms `clearFeedback()` called
5. Every 10 stars: `showLevelUp` set `true`, `LevelUpModal` shows, blocks next problem until dismissed

**Character selection flow:**
- On mount, `selectedCharacter` ref is `null`
- `CharacterSelect` renders as a fixed overlay (z-200)
- Once a character is chosen, overlay fades out via `<Transition name="fade">`
- Selected character object is passed as props to `MascotPanel`

## Routing

No router. The app has a single view. Navigation between "screens" is handled by conditional rendering:
- `v-if="!selectedCharacter"` — shows `CharacterSelect` overlay on first load
- `:show="showLevelUp"` — shows `LevelUpModal` overlay at every 10-star milestone

## Component Architecture

All components are presentational (props-in, events-out) except `App.vue`, which owns all state and logic.

```
App.vue (stateful root — owns all composable state)
├── CharacterSelect.vue   — full-screen overlay, emits @select with character object
├── LevelUpModal.vue      — full-screen overlay, self-contained animation sequencer
├── ScoreHeader.vue       — displays stars, streak, mute toggle; emits @toggle-mute
├── MascotPanel.vue       — shows selected character image + speech bubble feedback
├── ChallengeZone.vue     — renders math problem display and answer box
└── NumberPad.vue         — digit grid; emits @digit, @backspace, @submit
```

**Prop/emit contracts:**
- All props use `defineProps` with explicit types and defaults
- All events use `defineEmits` with named event strings
- No component reaches outside its own scope — no direct store access, no global mutation
- `LevelUpModal` manages its own internal animation state (timers, scene phases) entirely within the component

**Character object shape** (defined in `CharacterSelect.vue`, passed via `@select`):
```js
{ id, name, src, bg, border, icon }
```

## Key Patterns

**Composables (Vue 3 Composition API):**
- `src/composables/useMathGame.js` — all game logic, scoring, difficulty, problem generation
- `src/composables/useSound.js` — Web Audio API wrapper, module-level singleton `audioCtx`

**Adaptive difficulty (ZPD algorithm):**
- Rolling 10-answer history window in `difficulty.history`
- If success rate ≥ 90% → increment `maxOperand` (up to 20)
- If success rate < 60% → decrement `maxOperand` (floor 3)
- Targets ~80% success rate (Vygotsky Zone of Proximal Development)

**localStorage persistence:**
- Keys: `emma-stars`, `emma-streak`
- Read on composable initialization, written on every correct/wrong answer

**Animation patterns:**
- CSS `@keyframes` defined globally in `src/style.css`, applied via utility classes (`.shake`, `.pulse-glow`, `.pop-in`, `.roll-in`, `.animate-float`, `.rainbow-shimmer`, etc.)
- `canvas-confetti` library for particle effects on correct answers and level-up
- Vue `<Transition>` for overlay enter/leave
- `LevelUpModal` uses imperative `setTimeout` chains to orchestrate a multi-phase Mario flagpole scene

**Sound pattern:**
- `useSound` composable creates a single module-level `AudioContext` (lazy init on first use)
- All sounds are synthesized via Web Audio API oscillators — no audio file dependencies except `playSuccessMP3()` which is a placeholder stub referencing `/public/sounds/coin.mp3`

**Tailwind CSS v4:**
- Theme tokens defined in `@theme {}` block in `src/style.css` (not `tailwind.config.js`)
- Mario/Nintendo color palette as CSS custom properties: `--color-mario-red`, `--color-star-gold`, `--color-pipe`, etc.
- Used inline via Tailwind utility classes throughout all `.vue` templates

**`prefers-reduced-motion` support:**
- Global CSS block in `src/style.css` disables all animations for users with motion sensitivity settings

## Entry Points

**`index.html`:**
- Root HTML document
- Mounts `<div id="app">` for Vue
- Loads Google Fonts (Outfit) via `<link>` preconnect
- Sets `viewport` with `user-scalable=no` for mobile game feel
- Sets `theme-color` meta for mobile browser chrome

**`src/main.js`:**
- Creates Vue app, mounts to `#app`
- Imports global stylesheet `./style.css`
- No plugins, no router, no Pinia

**`src/App.vue`:**
- Root component, owns all reactive state
- Destructures both composables at setup time
- Orchestrates the answer cycle with `onSubmit()`, `onDigit()`, `onBackspace()`
- Watches `showLevelUp` to trigger level-up fanfare sound

---

*Architecture analysis: 2026-04-14*
