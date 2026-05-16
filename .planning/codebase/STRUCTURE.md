# Directory Structure

**Analysis Date:** 2026-04-14

## Root Layout

```
EmmaApp/
├── index.html              # HTML entry point, mounts #app div
├── vite.config.js          # Vite build config (vue plugin + tailwindcss plugin)
├── package.json            # Dependencies and npm scripts
├── package-lock.json       # Lockfile
├── roadmap.md              # Feature roadmap notes
├── README.md               # Project README
├── .gitignore
├── .vscode/                # Editor settings
├── .planning/              # GSD planning documents (not shipped)
│   └── codebase/           # Codebase analysis documents
├── docs/                   # Design specs and research documents (not shipped)
│   ├── feature-specs.md
│   ├── character-themes-spec.md
│   ├── implementation-plan.md
│   ├── research.md
│   └── walkthrough.md
├── public/                 # Static assets served at root URL
│   ├── favicon.svg
│   ├── icons.svg
│   └── sounds/
│       └── coin.mp3        # Reserved for future sound integration
└── src/                    # All application source code
```

## Source Layout

```
src/
├── main.js                 # App entry — createApp + mount
├── App.vue                 # Root component — owns all state, orchestrates flow
├── style.css               # Global styles: Tailwind import, @theme tokens, animation keyframes
├── assets/                 # Static assets imported by components
│   ├── fonts/
│   │   └── Gamtex.ttf      # Pixel/game display font (used as --font-display)
│   ├── mascot.png          # Princess Peach character sprite
│   ├── daisy.png           # Princess Daisy character sprite
│   ├── rosalina.png        # Rosalina character sprite
│   ├── toad.png            # Toad character sprite
│   ├── castle.png          # Mario castle (LevelUpModal scene)
│   ├── star.png            # Mario Super Star PNG
│   ├── mario-coin.png      # Coin icon (ScoreHeader + LevelUpModal)
│   ├── question-block.png  # ? block asset
│   ├── hero.png            # Unused/legacy hero image
│   ├── vite.svg            # Default Vite scaffold asset
│   └── vue.svg             # Default Vite scaffold asset
├── components/             # Presentational Vue SFCs
│   ├── ScoreHeader.vue     # Top bar: coin count, title, streak badge, mute button
│   ├── MascotPanel.vue     # Left panel: character image + feedback speech bubble
│   ├── ChallengeZone.vue   # Center: math problem display + answer box
│   ├── NumberPad.vue       # Bottom: digit grid + backspace + submit
│   ├── CharacterSelect.vue # Full-screen overlay: character picker (shown on first load)
│   ├── LevelUpModal.vue    # Full-screen overlay: Mario flagpole scene (every 10 stars)
│   └── ConfettiBurst.vue   # Standalone confetti component (defined but not used in App.vue)
└── composables/            # Vue 3 Composition API logic modules
    ├── useMathGame.js      # Core game logic: scoring, problem generation, adaptive difficulty
    └── useSound.js         # Web Audio API wrapper: synthesized Mario sound effects
```

## Key Files

| File | Role |
|------|------|
| `src/main.js` | App bootstrap — single line `createApp(App).mount('#app')` |
| `src/App.vue` | Root orchestrator — all state lives here, all component wiring |
| `src/style.css` | Design system — Tailwind import, Mario color tokens in `@theme {}`, all shared animations |
| `src/composables/useMathGame.js` | All game logic — problem generation, answer checking, streak, adaptive difficulty, localStorage |
| `src/composables/useSound.js` | All audio — Web Audio API context, Mario-themed synthesized SFX |
| `vite.config.js` | Build config — Vue SFC support + Tailwind CSS v4 Vite plugin |
| `index.html` | HTML shell — viewport meta, Google Fonts preconnect, Outfit font, theme-color |

## Naming Conventions

**Files:**
- Vue components: `PascalCase.vue` — e.g., `ScoreHeader.vue`, `LevelUpModal.vue`, `CharacterSelect.vue`
- Composables: `camelCase.js` prefixed with `use` — e.g., `useMathGame.js`, `useSound.js`
- Config/tooling: `kebab-case.js` — e.g., `vite.config.js`
- Assets: `kebab-case.ext` — e.g., `mario-coin.png`, `question-block.png`

**Composable exports:**
- Named function export matching filename: `export function useMathGame()`, `export function useSound()`

**CSS class conventions:**
- Tailwind utilities used inline in templates
- Custom global animation classes use `kebab-case` matching keyframe names: `.pulse-glow`, `.block-bump`, `.pop-in`, `.roll-in`, `.animate-float`, `.rainbow-shimmer`, `.btn-press`
- Scoped component styles used only in `ScoreHeader.vue` and `LevelUpModal.vue` (via `<style scoped>`)

**Component props:**
- `camelCase` in `defineProps`, converted to `kebab-case` in template usage per Vue convention

## Where to Add New Code

**New game component (e.g., a hint button, timer display):**
- Implementation: `src/components/ComponentName.vue`
- Wire into: `src/App.vue` — import and add to template

**New game feature/logic (e.g., multiplication mode, high scores):**
- Extend: `src/composables/useMathGame.js`
- Or add: `src/composables/useNewFeature.js` following the same `export function useX()` pattern

**New sound effect:**
- Extend: `src/composables/useSound.js` — add a `playXxx()` function using `playTone()`

**New character:**
- Add sprite PNG to: `src/assets/`
- Add to `characters` array in: `src/components/CharacterSelect.vue`

**New color token:**
- Add `--color-xxx` to the `@theme {}` block in: `src/style.css`

**New animation:**
- Add `@keyframes xxx` and `.xxx` utility class to: `src/style.css`

**New static asset (fonts, sounds):**
- Fonts: `src/assets/fonts/` (imported via `@font-face` in `style.css`)
- Public sounds: `public/sounds/` (referenced as `/sounds/filename.mp3`)
- Images used by components: `src/assets/` (imported via JS `import` in component `<script setup>`)

## Special Directories

**`public/`:**
- Purpose: Static files served directly at root URL, not processed by Vite
- Generated: No
- Committed: Yes

**`public/sounds/`:**
- Contains `coin.mp3`, referenced by the stub `playSuccessMP3()` in `useSound.js` but not yet wired up

**`.planning/`:**
- Purpose: GSD planning and codebase analysis documents
- Generated: By GSD tooling
- Committed: Yes (tracked in git)

**`docs/`:**
- Purpose: Human-authored feature specs, research, and design docs
- Generated: No
- Committed: Yes

**`node_modules/`:**
- Generated: Yes (`npm install`)
- Committed: No (in `.gitignore`)

---

*Structure analysis: 2026-04-14*
