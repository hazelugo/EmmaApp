# Code Conventions

**Analysis Date:** 2026-04-14

## Language Patterns

- **Language:** JavaScript (not TypeScript) — all source files use `.js` and `.vue` with no TypeScript.
- No `tsconfig.json` is present. The project is plain ES2022+ JavaScript using ES modules (`"type": "module"` in `package.json`).
- Vue 3 Composition API with `<script setup>` SFCs throughout.
- Destructured reactive primitives (`ref`, `reactive`, `computed`, `watch`) imported explicitly from `vue`.
- JSDoc-style type annotations appear in composables (e.g., `@param {number}`, `@returns {'correct'|'wrong'|null}`) as a lightweight substitute for TypeScript types.

## Component Patterns

- All components use **Vue 3 `<script setup>`** single-file component syntax — no Options API, no class components.
- Props are defined with `defineProps()` using the object syntax with explicit `type` and `default`/`required` per prop:

  ```js
  defineProps({
    num1:     { type: Number, required: true },
    feedback: { type: String, default: '' },
  })
  ```

- Emits are declared with `defineEmits(['event-name'])` at the top of `<script setup>`.
- Component logic that spans multiple components is extracted into **composables** in `src/composables/` (e.g., `useMathGame.js`, `useSound.js`).
- Composables follow the `use*` naming convention and return a flat object of reactive state and action functions.
- Module-level singletons (e.g., `audioCtx`, `isMuted`) are used in `useSound.js` — state is shared across all composable instances, not scoped per call.
- Lifecycle hooks (`onMounted`, `onUnmounted`) and `watch` are used within composables and components where needed.
- Asset imports (images) are done inline at the top of `<script setup>` using static `import` statements:

  ```js
  import mascotUrl from '../assets/mascot.png'
  ```

## Import Style

- **Relative paths only** — no path aliases (no `@/`, no `~`). All imports use `./` or `../` relative paths.
- No barrel files (`index.js`) in `src/components/` or `src/composables/` — components and composables are imported directly by file path.
- Import order in `<script setup>`: Vue framework imports → composable imports → asset imports (images/fonts). No enforced linter ordering.
- External library imports (`canvas-confetti`, `vue`) are ES module named imports.
- In `App.vue`, `import { watch } from 'vue'` appears mid-file (after composable usage), indicating no enforced import-at-top rule.

## Naming Conventions

**Files:**
- Vue SFCs: `PascalCase.vue` (e.g., `ChallengeZone.vue`, `LevelUpModal.vue`, `CharacterSelect.vue`)
- Composables: `camelCase.js` prefixed with `use` (e.g., `useMathGame.js`, `useSound.js`)
- Entry point: `main.js`
- Global styles: `style.css`

**Variables and refs:**
- `camelCase` for all variables, refs, reactive properties (e.g., `currentProblem`, `showLevelUp`, `isMuted`)
- Boolean refs/state use descriptive names (e.g., `sceneReady`, `flagDown`, `showButton`)
- Computed values use noun/adjective form (e.g., `correctAnswer`, `successRate`)

**Functions:**
- `camelCase` for all functions (e.g., `generateProblem`, `checkAnswer`, `clearFeedback`, `appendDigit`)
- Event handler functions in components prefixed with `on` (e.g., `onDigit`, `onBackspace`, `onSubmit`, `onSelectCharacter`)
- Internal helpers without prefix (e.g., `startScene`, `fireFireworks`, `clearTimers`)

**Components:**
- `PascalCase` in both filename and usage in templates (e.g., `<ChallengeZone>`, `<LevelUpModal>`)

**CSS classes:**
- Utility-first Tailwind classes inline on elements
- Custom CSS classes use `kebab-case` (e.g., `.block-border`, `.btn-press`, `.star-bounce`, `.pop-in`, `.roll-in`)
- Animation keyframes use `kebab-case` matching their class (e.g., `@keyframes pop-in`, `@keyframes coin-spin`)

**CSS custom properties (design tokens):**
- Defined in `@theme {}` block in `src/style.css` using `--color-*` and `--font-*` naming following a Mario universe theme
- Token names are semantic and descriptive (e.g., `--color-mario-red`, `--color-star-gold`, `--color-pipe`)

## Error Handling

- No structured error handling pattern is present in the codebase.
- `localStorage` reads use `|| 0` fallbacks to handle missing values; no try/catch around storage access.
- Audio context creation has no error handling; the Web Audio API is used with assume-it-works approach.
- `playSuccessMP3` stubs out a `console.error` inside a comment block showing intent but no active error handling.
- No Vue error boundaries (`onErrorCaptured`) or global error handler (`app.config.errorHandler`) configured.
- `checkAnswer` returns `null` as a sentinel value for "no action" — callers check for falsy return:

  ```js
  const result = checkAnswer()
  if (!result) return
  ```

## Code Style

- **No ESLint or Prettier config files present** — no `.eslintrc`, `.prettierrc`, `eslint.config.*`, or `biome.json` in the project root.
- **No linting or formatting scripts** in `package.json` (only `dev`, `build`, `preview`).
- Style is enforced by convention, not tooling.

**Observed style patterns:**
- 2-space indentation throughout `.vue` and `.js` files.
- Single quotes for strings in JavaScript (`'correct'`, `'emma-stars'`).
- Spaces inside object destructuring braces and function parameter lists.
- Trailing commas used in multi-line arrays and objects.
- Section dividers using `/* ── Section Name ─── */` comment style in both `.js` composables and `<style scoped>` blocks.
- Template attributes in `defineProps` are aligned vertically with padding for readability.
- Arrow functions used for array methods; regular `function` declarations for named composable functions.
- `<style scoped>` sections use CSS section headers with `/* ═══ Section ═══ */` delimiters in `LevelUpModal.vue`.

## Comments and Documentation

- **JSDoc comments** on composable functions (e.g., `useMathGame.js`, `useSound.js`) describe purpose, parameters, and return types:

  ```js
  /**
   * Check the user's answer against the correct answer.
   * @returns {'correct'|'wrong'|null} — null if input is empty or locked
   */
  function checkAnswer () { ... }
  ```

- File-level JSDoc at the top of composables summarizes their purpose:

  ```js
  /**
   * Core math game composable.
   * Manages problem generation, answer checking, scoring,
   * streak tracking, and adaptive difficulty.
   */
  ```

- **Inline comments** are used liberally to explain intent, particularly for non-obvious logic:
  - Constraint explanations (e.g., `// Constraint: a >= b to avoid negative results`)
  - Algorithm notes (e.g., `// Vygotsky ZPD`)
  - Audio frequency notes with musical reference (e.g., `// Classic coin: B5 → E6`)
- Template comments use standard HTML `<!-- ... -->` syntax to label regions (e.g., `<!-- ★ Score Header -->`, `<!-- Middle: Mascot + Challenge -->`).
- Placeholder/stub code is documented with clear comments indicating what to replace (e.g., `playSuccessMP3` explains how to swap in a real MP3).
- No auto-generated documentation tooling (no JSDoc build, no Storybook).
