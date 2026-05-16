# Technical Concerns

**Analysis Date:** 2026-04-14

---

## Critical Issues

**`playSuccessMP3` is a stub that fires a `console.log` on every correct answer:**
- Issue: `playSuccessMP3()` in `src/composables/useSound.js` (line 111–120) only executes `console.log('--- SUCCESS MP3 PLACEHOLDER ---')` — no audio plays. It is called unconditionally on every correct answer in `src/App.vue` (line 59).
- Files: `src/composables/useSound.js`, `src/App.vue`
- Impact: `console.log` spam in production. The `public/sounds/coin.mp3` asset exists but is never played. Feature is silently broken.
- Fix approach: Replace the stub body with `new Audio('/sounds/coin.mp3').play().catch(...)` or remove the call entirely; delete the `console.log`.

**`ConfettiBurst` component is never used:**
- Issue: `src/components/ConfettiBurst.vue` defines a full confetti particle system but is not imported or rendered anywhere in the application. `App.vue` uses `canvas-confetti` directly instead.
- Files: `src/components/ConfettiBurst.vue`
- Impact: Dead code; misleading to future contributors; bundle-time cost is zero (tree-shaken) but maintenance burden remains.
- Fix approach: Delete the file or wire it into the app if the canvas-confetti approach is to be replaced.

---

## Technical Debt

**`ScoreHeader` accepts props it never uses in its template:**
- Issue: `src/components/ScoreHeader.vue` declares `maxOperand` (line 9) and `character` (line 10) as props, but neither is referenced anywhere in the template or script. `App.vue` passes `:max-operand="difficulty.maxOperand"` (line 114) — the data travels nowhere.
- Files: `src/components/ScoreHeader.vue`, `src/App.vue`
- Impact: Confusion about what the header is supposed to display; difficulty indicator is computed but invisible to the user.
- Fix approach: Either render the difficulty level visually in the header, or remove the unused props and the corresponding bindings in `App.vue`.

**`difficulty` state is internal-only with no user-facing display:**
- Issue: `useMathGame.js` exposes `difficulty.maxOperand` and `successRate`, which are tracked and adjusted, but nothing in the UI communicates the current level to the child. The `ScoreHeader` receives it but discards it (see above).
- Files: `src/composables/useMathGame.js`, `src/App.vue`
- Impact: Good pedagogical data exists but the child gets no feedback on progress within the adaptive range (only the LevelUpModal fires at 10-star milestones).

**`lastMilestone` is not persisted to `localStorage`:**
- Issue: `useMathGame.js` initialises `lastMilestone` as `Math.floor(stars.value / 10) * 10` on load (line 16). However, on page refresh after e.g. 15 stars, `stars` restores to 15 from localStorage, `lastMilestone` restores correctly, but the milestone guard relies on `stars.value % 10 === 0` which means a refresh at exactly a milestone boundary could re-trigger the level-up modal.
- Files: `src/composables/useMathGame.js`
- Impact: Edge-case UX bug — level-up modal may re-appear after refresh at exact multiples of 10.
- Fix approach: Persist `lastMilestone` to localStorage alongside stars and streak, or simply store the highest milestone reached.

**`difficulty.history` is not persisted:**
- Issue: The rolling history array used for adaptive difficulty is reset to `[]` on every page load. The child always restarts at `maxOperand: 5` (easy) regardless of prior performance.
- Files: `src/composables/useMathGame.js`
- Impact: Progress in difficulty resets on refresh; a child who has reached harder problems is dropped back to the easiest level.
- Fix approach: Persist `maxOperand` (and optionally history) to localStorage alongside stars and streak.

**Inline `import { watch }` mid-script in `App.vue`:**
- Issue: `App.vue` line 82 contains `import { watch } from 'vue'` in the middle of the `<script setup>` block, after other logic has already been written. All imports should appear at the top of the file.
- Files: `src/App.vue`
- Impact: Cosmetic/style issue, but signals the file was edited incrementally without cleanup.

**Streak milestone logic has an off-by-one edge:**
- Issue: In `App.vue` (line 62), the streak fanfare fires at `streak.value === 5 || streak.value === 10 || streak.value % 10 === 0`. A streak of 10 satisfies both the `=== 10` condition and the `% 10 === 0` condition — they are redundant. More importantly, streak of 20, 30 etc. fire only via `% 10 === 0`, which is correct, but streak of 0 (after a wrong answer resets it) would also satisfy `% 10 === 0` if called in wrong-answer path — this does not happen currently only because the condition is in the `correct` branch, but is fragile.
- Files: `src/App.vue`

---

## Performance Concerns

**`Math.random()` calls in `LevelUpModal` template on every render:**
- Issue: The `<span v-for="i in 12">` sky star loop in `LevelUpModal.vue` (lines 91–96) calls `Math.random()` inside the `:style` binding directly in the template. In Vue 3, these expressions are re-evaluated on every re-render of that scope.
- Files: `src/components/LevelUpModal.vue`
- Impact: Minor; the modal renders infrequently and the loop is only 12 iterations. Not a practical bottleneck but is an anti-pattern.
- Fix approach: Pre-compute the star positions in `setup()` or `onMounted()` into a reactive array.

**`canvas-confetti` fires on every correct answer:**
- Issue: `App.vue` triggers a `confetti()` burst (100 particles) on every single correct answer (line 51–57). This runs canvas operations on the main thread at high frequency during normal play.
- Files: `src/App.vue`
- Impact: On low-end devices or during rapid correct answers, this could cause frame drops.
- Fix approach: Throttle confetti to milestones or streak moments rather than every answer; or reduce `particleCount`.

---

## Security Concerns

**No meaningful security surface — this is a fully client-side app with no server, authentication, or user data transmission.** The points below are hygiene rather than vulnerabilities.

**`localStorage` stores game progress in plain text:**
- Issue: `emma-stars` and `emma-streak` are stored as plain integers in localStorage with no validation on read.
- Files: `src/composables/useMathGame.js`
- Impact: A child (or parent) can open DevTools and set `localStorage.setItem('emma-stars', 9999)`, bypassing all progression. Not a security issue per se, but worth noting for a children's educational app where honest progress matters.
- Fix approach: Not critical; could add a simple checksum or just accept it as a single-player local app.

**Google Fonts loaded from external CDN:**
- Issue: `index.html` loads the Outfit font from `fonts.googleapis.com`. This is a third-party network request on every page load.
- Files: `index.html`
- Impact: Minor privacy/CSP concern; not a vulnerability but worth noting if self-hosting is ever required.

---

## Scalability Concerns

**Single-file composable handles all game logic:**
- Issue: `src/composables/useMathGame.js` owns scoring, persistence, difficulty adaptation, problem generation, answer checking, and input helpers — all in one 168-line file.
- Files: `src/composables/useMathGame.js`
- Impact: As features grow (multiplication, division, timed mode, multi-player) this file will become a bottleneck. Refactoring later will require untangling reactive state.
- Fix approach: Split into focused composables: `useProblemGenerator`, `useScoring`, `useDifficulty`, `usePersistence`.

**Only addition and subtraction are implemented:**
- Issue: `generateProblem()` only handles `'+'` and `'-'` operators. The `correctAnswer` computed also only handles these two cases (falls through to subtraction for any non-`+` operator).
- Files: `src/composables/useMathGame.js`
- Impact: Multiplication/division would require changes in multiple places (generator, answer computation, difficulty scaling). The implicit `else` for the operator is fragile — adding `'*'` without updating `correctAnswer` would silently return a wrong subtraction result.
- Fix approach: Use an explicit `switch` or operator map rather than an `if/else` fallback.

**Character selection state is not persisted:**
- Issue: `selectedCharacter` in `App.vue` is a local `ref(null)`. Every page refresh re-shows the character selection screen.
- Files: `src/App.vue`
- Impact: Mildly annoying UX for returning players; likely intentional for a per-session experience but not documented as such.

---

## Missing Infrastructure

**Zero tests:**
- Issue: No test files exist anywhere in the project. No test runner is configured (`jest`, `vitest`, etc.).
- Files: All of `src/`
- Impact: Core game logic (`checkAnswer`, `generateProblem`, `adjustDifficulty`) is completely untested. Regressions in scoring or difficulty adaptation will not be caught automatically.
- Priority: High. `useMathGame.js` is pure logic and would be straightforward to unit-test with Vitest.

**No error boundaries or error handling:**
- Issue: No Vue `errorCaptured` hooks, no try/catch around localStorage access, no handling of Web Audio API failures.
- Files: `src/composables/useSound.js`, `src/composables/useMathGame.js`
- Impact: If localStorage is unavailable (private browsing with storage blocked, quota exceeded) the app will throw uncaught exceptions. `AudioContext` creation can also fail silently or with an exception in some environments.
- Fix approach: Wrap `localStorage` calls in try/catch; handle `AudioContext` creation failure gracefully.

**No loading state for image assets:**
- Issue: Character images (`mascot.png`, `daisy.png`, etc.) are imported as static assets but there is no `loading` or error state if they fail to load.
- Files: `src/components/CharacterSelect.vue`, `src/components/MascotPanel.vue`, `src/components/LevelUpModal.vue`
- Impact: Broken image icons would appear silently if assets are missing from the build.

**No CI/CD pipeline:**
- Issue: No `.github/workflows`, no build verification on commits.
- Impact: Breaking changes to the build are not caught automatically.

**No linting or formatting configuration:**
- Issue: No `.eslintrc`, `eslint.config.*`, `.prettierrc`, or `biome.json` is present.
- Impact: Code style is maintained by convention only; no automated enforcement. New contributors have no enforced baseline.

---

## Dependencies at Risk

**`vite` is at a very new major version (^8.0.4):**
- Issue: `package.json` requires `vite@^8.0.4`. Vite 8 was released very recently and the ecosystem (plugins, docs, community support) may lag behind.
- Impact: `@vitejs/plugin-vue@^6.0.5` and `@tailwindcss/vite@^4.2.2` are pinned to versions designed for Vite 8, so compatibility is likely fine, but edge-case bugs in a brand-new major version are higher probability.

**`@tailwindcss/vite@^4.2.2` uses Tailwind v4 (new major):**
- Issue: Tailwind CSS v4 is a ground-up rewrite with a new `@theme` CSS-native approach (as used in `src/style.css`). v4 is still maturing; the JIT class-detection and configuration API differ significantly from v3.
- Impact: Community resources (Stack Overflow answers, third-party plugins) are predominantly for v3. Custom classes that are not statically detectable by the scanner could be silently dropped from the build.

**No pinned versions — all dependencies use `^` (caret) ranges:**
- Issue: All four dependencies in `package.json` use `^` semver ranges, meaning minor/patch updates are installed automatically on `npm install`.
- Impact: A semver-breaking change shipped as a minor version by a dependency author (which happens) would silently break a fresh install.
- Fix approach: Pin exact versions or use `npm ci` with a committed `package-lock.json` (lock file is present and committed, which mitigates this partially).

**`canvas-confetti` is a runtime production dependency:**
- Issue: `canvas-confetti@^1.9.4` is listed under `dependencies` (not `devDependencies`). For a Vite-bundled SPA this distinction doesn't matter for final bundle size, but it signals the package was added without thought about the dependency category.

---

## Recommendations

Priority order for addressing concerns:

1. **Fix the `playSuccessMP3` stub** — Remove the `console.log` and either wire up the existing `public/sounds/coin.mp3` or remove the dead function entirely. This is a one-line fix that eliminates production console spam. (`src/composables/useSound.js`)

2. **Delete or wire up `ConfettiBurst.vue`** — Dead component should either be removed or used. (`src/components/ConfettiBurst.vue`)

3. **Persist `difficulty.maxOperand` to localStorage** — Children who have earned harder problems lose that progress on refresh. This is a one-line addition alongside the existing star/streak persistence. (`src/composables/useMathGame.js`)

4. **Add Vitest and unit-test `useMathGame.js`** — The adaptive difficulty logic and answer checking are the core of the app and have no test coverage. Adding Vitest is a `npm install --save-dev vitest` away and `useMathGame.js` is straightforward to test in isolation.

5. **Add ESLint** — Enforce code quality automatically; the mid-script `import` in `App.vue` (line 82) is the kind of issue a linter catches immediately.

6. **Remove/resolve unused props in `ScoreHeader`** — Either display `maxOperand` as a level indicator, or remove the props and the bindings. (`src/components/ScoreHeader.vue`, `src/App.vue`)

7. **Wrap `localStorage` calls in try/catch** — Prevents uncaught exceptions in private browsing mode. (`src/composables/useMathGame.js`)

8. **Refactor `useMathGame.js` as feature scope grows** — Not urgent now, but plan to split into focused composables before adding multiplication/division or multiplayer support.

---

*Concerns audit: 2026-04-14*
