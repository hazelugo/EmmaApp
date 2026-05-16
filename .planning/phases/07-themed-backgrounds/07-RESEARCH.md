# Phase 7: Themed Backgrounds - Research

**Researched:** 2026-05-16
**Domain:** CSS gradient animation, Vue 3 computed styling, difficulty-driven UI theming
**Confidence:** HIGH

---

## Summary

Phase 7 adds 4 difficulty-driven background themes that replace the current static `body` gradient in `style.css`. Each theme maps to a `maxOperand` range and transitions over 800ms using pure CSS — no images, no JS animation libraries.

The project already has all necessary infrastructure: `difficulty.maxOperandByOperator` is tracked in `useMathGame.js` and exposed to `App.vue`. The current background is a single `linear-gradient` on `body` in `style.css`. The implementation requires (1) a composable or computed that maps the current difficulty to a theme index, (2) CSS custom properties that change when the theme class changes, and (3) a CSS `transition` on `background` with 800ms timing on the element that carries the background.

The primary technical question is WHERE to attach the dynamic background — `body` (global) vs `#app-root` (the main flex container in `App.vue`). Because `body` already owns the background and pseudo-elements (`::before`/`::after` cloud decorations), the cleanest approach is to move gradient ownership to `#app-root` (or a dedicated `<div>` wrapper) so the body clouds remain independent. Dynamic class binding on the root `<div>` in `App.vue` via `:class` is the established pattern in this codebase (see `streakFlash` binding).

**Primary recommendation:** Expose a `difficultyTheme` computed from `useMathGame`'s `difficulty.maxOperandByOperator`, derive a single theme index (0–3) in `App.vue`, apply it as a CSS class on `#app-root`, and use CSS `transition: background 0.8s ease` on that element. No new library needed.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| THEME-01 | Background changes based on current difficulty/streak (4 themes) | `difficulty.maxOperandByOperator` is already in `useMathGame` and passed to `App.vue`; 4 CSS gradient classes mapped to maxOperand ranges |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 (already installed) | 3.5.32 | Reactive computed for theme index, `:class` binding | Already the app framework |
| Tailwind CSS v4 (already installed) | 4.2.2 | Utility classes; `@theme` tokens already defined | Project standard — no additions needed |
| Pure CSS transitions | n/a | 800ms `background` fade — no JS animation frame needed | Spec requirement: pure CSS, no image assets |

### Supporting

No new packages are needed. [VERIFIED: package.json]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS class swap + transition | Vue `<Transition>` + v-if overlay | Overlay approach adds DOM complexity; class swap on a single element is simpler and avoids z-index issues |
| CSS class swap + transition | GSAP / anime.js | External library; spec says pure CSS; overkill for a background color change |
| Deriving theme from `maxOperandByOperator` | Deriving from `level` alone | `maxOperandByOperator` is the actual adaptive difficulty signal; level is only a gate for operators; spec says "difficulty-driven" |

**Installation:** None required. All dependencies already present.

---

## Architecture Patterns

### How the Current Background Works

The `body` element in `src/style.css` owns the gradient background: [VERIFIED: src/style.css line 80–92]

```css
body {
  background:
    linear-gradient(180deg,
      var(--color-sky-top) 0%,
      var(--color-sky) 40%,
      var(--color-luigi-light) 75%,
      var(--color-ground-brown) 100%
    );
}
```

`body::before` and `body::after` add floating cloud emoji decorations that must remain unchanged. [VERIFIED: src/style.css lines 94–121]

`#app-root` is the main content `<div>` in `App.vue` — it currently has no background of its own. [VERIFIED: App.vue line 404]

### Difficulty Signal Available in App.vue

`useMathGame` exposes `difficulty` (a reactive object with `maxOperandByOperator`). `App.vue` already destructures and uses it. [VERIFIED: App.vue line 29, useMathGame.js lines 70–79]

```javascript
// From useMathGame.js — currently persisted per operator
difficulty.maxOperandByOperator = {
  '+': 10,   // range: 3–20
  '-': 10,   // range: 3–20
  '×': 3,    // range: 3–10
  '÷': 3,    // range: 3–10
}
```

For theming purposes, the most representative single difficulty signal is the addition operand (`+`), which climbs steadily from 3→20 and is always active from the first problem. The other operators' caps serve as secondary signals but using `+` alone is the simplest and most consistent approach.

### Recommended Pattern: CSS Custom Property Theme Classes

**What:** Define 4 CSS theme classes that each override a `--bg-gradient` custom property. Apply `transition` on the container. Bind the active class reactively in `App.vue`.

**When to use:** Any time you need smooth transitions between a finite set of named states. No JS animation needed.

**Theme ranges (mapping `maxOperandByOperator['+']` → theme index):**

| Theme | Name | maxOperand range | Mood |
|-------|------|-----------------|------|
| 0 | Overworld (default) | 3–7 | Blue sky + green ground (current body gradient) |
| 1 | Underground | 8–12 | Purple dusk + lavender |
| 2 | Desert/Dusk | 13–17 | Orange + gold |
| 3 | Night/Space | 18–20 | Deep navy + dark purple |

These map to the existing level bg tokens already defined in `useLevelTheme.js`, maintaining visual consistency. [VERIFIED: useLevelTheme.js — level 1 overworld, level 2 underground, level 3 desert, level 5 spooky/space]

**Pattern — CSS (in style.css or scoped on App.vue):**

```css
/* Source: CSS specification — custom property inheritance */
#app-root {
  /* Fallback: same as current body gradient */
  background: linear-gradient(180deg, #4A90D9 0%, #87CEEB 40%, #7ADB7E 75%, #8D6E4C 100%);
  transition: background 0.8s ease;
  min-height: 100dvh;
}

#app-root.theme-overworld {
  background: linear-gradient(180deg, #4A90D9 0%, #87CEEB 40%, #7ADB7E 75%, #8D6E4C 100%);
}

#app-root.theme-underground {
  background: linear-gradient(180deg, #a18cd1 0%, #fbc2eb 50%, #c3a3e8 100%);
}

#app-root.theme-desert {
  background: linear-gradient(180deg, #f7971e 0%, #ffd200 50%, #e8a838 100%);
}

#app-root.theme-space {
  background: linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}
```

**IMPORTANT — CSS `transition` on `background` (gradient) behavior:**

CSS `transition: background` animates between two gradients ONLY when both use the same `linear-gradient` function structure (same number of stops, same gradient type). If gradient stop counts differ, the browser will snap rather than interpolate. All 4 themes must therefore use the same number of stops. [ASSUMED — based on CSS specification knowledge; should verify via browser test]

**Workaround for guaranteed smooth fade:** Use `background-color` as the transition target by layering: set the gradient as a `background-image` (which cannot transition) and transition only the `background-color` as a base tint. Alternatively, use `opacity` on overlapping `position: absolute` background layers — but that is more complex.

The simplest reliable 800ms fade between two different gradients is to transition `opacity` on stacked `::before` / `::after` pseudo-elements. However, `body::before` and `body::after` are already used by the cloud decorations. On `#app-root`, `::before`/`::after` are available.

**Recommended reliable approach:** Use a dedicated `<div class="bg-layer">` positioned absolutely inside `#app-root` with `z-index: -1`, and swap its inline `background` via `:style` binding + CSS `transition`. This avoids the gradient-snap problem entirely. [ASSUMED — common pattern; well-established workaround for gradient transitions]

**Pattern — App.vue template:**

```html
<!-- Source: established codebase pattern (streakFlash class binding, App.vue line 396) -->
<div
  id="app-root"
  class="relative z-10 flex flex-col min-h-dvh max-w-lg mx-auto px-3 py-3 gap-3 select-none"
>
  <!-- Difficulty-driven background layer -->
  <div
    class="difficulty-bg"
    :class="difficultyThemeClass"
    aria-hidden="true"
  />
  <!-- ... rest of app content ... -->
</div>
```

**Pattern — composable or computed in App.vue:**

```javascript
// Source: derived from useMathGame.js difficulty.maxOperandByOperator structure
const difficultyThemeClass = computed(() => {
  const max = difficulty.maxOperandByOperator['+']
  if (max <= 7)  return 'theme-overworld'
  if (max <= 12) return 'theme-underground'
  if (max <= 17) return 'theme-desert'
  return 'theme-space'
})
```

### Anti-Patterns to Avoid

- **Transitioning `background` gradient with mismatched stop counts:** Results in an instant snap rather than 800ms fade. Use identical stop structure across all themes OR use a different transition strategy (opacity layer / inline style).
- **Attaching dynamic class to `body`:** Makes the binding hard to scope and interacts with the cloud pseudo-elements; use `#app-root` or a child layer instead.
- **Creating a new composable just for theme mapping:** The logic is 4 lines. A `computed` in `App.vue` is sufficient; avoid composable proliferation for trivial derivations.
- **Deriving theme from `level` instead of `difficulty`:** Level only changes every 10 stars; `maxOperandByOperator` changes continuously as the player improves. Using level would mean the background never changes mid-level, defeating the "difficulty-driven" intent.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS gradient transitions | Custom JS animation loop or GSAP | CSS `transition` + class swap | Browser-native; respects `prefers-reduced-motion`; zero dependencies |
| Theme state management | Vuex store / Pinia | `computed` from existing `difficulty` reactive object | State already exists in `useMathGame`; no new store needed |
| Theme persistence | localStorage key | None needed | Theme is derived from `difficulty.maxOperandByOperator` which is already persisted per operator |

---

## Runtime State Inventory

Step 2.5 SKIPPED — this is a greenfield visual feature, not a rename/refactor/migration phase. No stored strings, collections, or OS registrations are involved.

---

## Environment Availability

Step 2.6 — Phase 7 has no external dependencies beyond the existing project stack. All required tools are confirmed present:

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Vite | Build / dev server | Yes | 8.0.4 | — |
| Vue 3 | Reactive computed, template | Yes | 3.5.32 | — |
| Tailwind CSS v4 | Utility classes | Yes | 4.2.2 | — |
| Vitest | Test suite | Yes | 3.2.4 | — |

[VERIFIED: package.json]

**Missing dependencies with no fallback:** None.

---

## Common Pitfalls

### Pitfall 1: CSS Gradient Transition Snapping
**What goes wrong:** The background snaps instantly between two gradient values instead of fading over 800ms.
**Why it happens:** CSS can only interpolate between gradients if both have the exact same type (linear), same number of color stops, and same angular direction. If any of these differ, the browser treats it as a discrete swap.
**How to avoid:** Either (a) ensure all 4 theme gradients use the exact same number of stops and same direction, or (b) use an opacity-based approach on a stacked layer. Test in Chrome and Safari.
**Warning signs:** Visual snap on theme change with no transition animation visible.

### Pitfall 2: `body` Background Override Conflict
**What goes wrong:** The new dynamic background is hidden behind or conflicts with the `body` gradient in `style.css`.
**Why it happens:** `body` already owns the page background. If the new themed layer is on a child element without `min-height: 100dvh`, it won't fill the full viewport.
**How to avoid:** Either clear the `body` gradient (set `body { background: none }`) and replace with the themed element, or ensure the themed element is `position: fixed` / `position: absolute` behind all content. The body gradient must be neutralized or the themed layer placed correctly.
**Warning signs:** Themed background only appears in the content area; body gradient bleeds through at viewport edges.

### Pitfall 3: `prefers-reduced-motion` Not Respected
**What goes wrong:** Children with motion sensitivities see the background changing abruptly or animating.
**Why it happens:** The global `prefers-reduced-motion` rule in `style.css` sets `transition-duration: 0.01ms` for all elements — this WILL catch the background transition automatically. [VERIFIED: style.css lines 310–323]
**How to avoid:** No extra action needed — the existing reduced-motion rule covers it. Just confirm the background-carrying element is under `*` selector scope.
**Warning signs:** None — existing rule handles it.

### Pitfall 4: Theme Jumping on First Load
**What goes wrong:** On mount, the background instantly jumps to the loaded difficulty level instead of starting from Overworld.
**Why it happens:** `difficulty.maxOperandByOperator` is restored from localStorage on composable creation. The background renders immediately at the stored value.
**How to avoid:** This behavior is likely correct — the player resumes where they left off. Only a problem if the design intent is always-start-from-Overworld. Clarify intent before implementing.
**Warning signs:** Users report "jarring" background on app open.

### Pitfall 5: Reactive Dependency on Wrong Difficulty Signal
**What goes wrong:** Background only changes when the addition operand increases, but a player who only does multiplication never sees it progress.
**Why it happens:** Using only `maxOperandByOperator['+']` as the signal ignores the other operators.
**How to avoid:** Use `Math.max(...Object.values(difficulty.maxOperandByOperator))` to capture the highest difficulty across all active operators. This is a one-line change and more representative of overall player skill.
**Warning signs:** Background stays at Overworld for advanced players who play multiplication-heavy sessions.

---

## Code Examples

### Derived Theme Class (App.vue `<script setup>`)

```javascript
// Source: [ASSUMED — derived from useMathGame.js difficulty object structure, App.vue patterns]
// Uses max across all operators for fairness
const difficultyThemeClass = computed(() => {
  const max = Math.max(
    difficulty.maxOperandByOperator['+'],
    difficulty.maxOperandByOperator['-'],
    difficulty.maxOperandByOperator['×'],
    difficulty.maxOperandByOperator['÷'],
  )
  if (max <= 7)  return 'theme-overworld'
  if (max <= 12) return 'theme-underground'
  if (max <= 17) return 'theme-desert'
  return 'theme-space'
})
```

### CSS Theme Definitions (style.css or App.vue `<style>`)

```css
/* Source: [ASSUMED — CSS specification; color values derived from useLevelTheme.js existing bg tokens] */

/* Background layer sits below all content */
.difficulty-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  transition: background 0.8s ease;
  /* Reduced motion: global rule in style.css handles this automatically */
}

.difficulty-bg.theme-overworld {
  background: linear-gradient(180deg, #4A90D9 0%, #87CEEB 40%, #7ADB7E 75%, #8D6E4C 100%);
}

.difficulty-bg.theme-underground {
  background: linear-gradient(180deg, #a18cd1 0%, #fbc2eb 40%, #c3a3e8 75%, #7a5ea8 100%);
}

.difficulty-bg.theme-desert {
  background: linear-gradient(180deg, #f7971e 0%, #ffd200 40%, #e8a838 75%, #b5651d 100%);
}

.difficulty-bg.theme-space {
  background: linear-gradient(180deg, #0f0c29 0%, #302b63 40%, #24243e 75%, #0d0b1a 100%);
}
```

Note: All 4 themes use identical gradient structure (4 stops, same direction). This satisfies the CSS interpolation requirement and allows the 800ms transition to work reliably. [ASSUMED — needs browser verification in dev]

### Template Binding (App.vue)

```html
<!-- Source: [VERIFIED pattern: App.vue line 396 — existing :class="streakFlash" binding] -->
<div
  class="difficulty-bg"
  :class="difficultyThemeClass"
  aria-hidden="true"
/>
```

This element is placed as the first child of the outermost `<div>` in `App.vue` (before `#app-root`'s content), positioned `fixed` so it fills the viewport regardless of scroll.

### Body Cleanup (style.css)

```css
/* BEFORE (current state — lines 80–92 of style.css) */
body {
  background: linear-gradient(180deg, /* ... */ );
}

/* AFTER — neutralize body gradient; let .difficulty-bg own it */
body {
  background: none; /* Themed background handled by .difficulty-bg in App.vue */
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| JS-driven background animation (GSAP, requestAnimationFrame) | CSS `transition` on class swap | Zero dependency; motion respects OS preference; 60fps without JS |
| Tailwind `bg-gradient-to-b` dynamic class | Scoped CSS classes with full gradient definition | Tailwind v4 cannot generate arbitrary gradient stop colors at runtime without JIT config; named CSS classes are cleaner here |

**Deprecated/outdated:**
- Using `body` inline style for dynamic backgrounds: not idiomatic in Vue SPA — class binding on a child element is the correct approach.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | CSS `transition: background` works on gradients with matching stop counts | Architecture Patterns, Code Examples | If snap still occurs, must use opacity-layer workaround — adds DOM complexity |
| A2 | Using `Math.max` across all operators is the right difficulty signal | Code Examples | Could choose `+` only or level-based; different signals = different UX feel |
| A3 | Background snap on first load (localStorage restore) is acceptable behavior | Common Pitfalls #4 | If design requires always-start-Overworld, need `ref` to track mounted state |
| A4 | 4 stop counts with same gradient direction are sufficient for browser interpolation | Code Examples | If browsers still snap, fallback to stacked pseudo-element opacity approach |

---

## Open Questions

1. **Gradient transition compatibility across browsers (Chrome, Safari, Firefox mobile)**
   - What we know: CSS can interpolate same-structure gradients. All 4 themes are designed with 4 stops.
   - What's unclear: Whether Safari 16+ on iOS reliably interpolates `background` gradients or still snaps.
   - Recommendation: Test in dev with Safari on iOS. If it snaps, switch to the `opacity` layer approach (two `.difficulty-bg` divs, one fades out while the other fades in).

2. **Which difficulty signal to use: `+` operator only, or `Math.max` across all operators?**
   - What we know: `+` is always active; `×` and `÷` are gated by level.
   - What's unclear: User intent — should a player who primarily hits multiplication problems see theme progression?
   - Recommendation: Use `Math.max` across all operators for the most responsive experience. If it feels too jumpy, fall back to `+` only.

3. **Body background conflict: remove body gradient entirely or keep as fallback?**
   - What we know: `body` currently owns the only background; the new `.difficulty-bg` will be `position: fixed; z-index: -1`.
   - What's unclear: Whether removing the body gradient breaks anything (overlays, modals, etc.).
   - Recommendation: Set `body { background: none }` and move full gradient responsibility to `.difficulty-bg`. This is clean and avoids stacking issues.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | vite.config.js (`test` block) |
| Quick run command | `npm run test` |
| Full suite command | `npm run test -- --coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| THEME-01 | `difficultyThemeClass` returns correct class for each maxOperand range | unit | `npm run test -- --reporter=verbose` | No — Wave 0 gap |
| THEME-01 | Background changes on difficulty threshold crossing | manual smoke | Visual inspection in browser | N/A |
| THEME-01 | 800ms transition is smooth | manual smoke | Visual inspection (DevTools slow network) | N/A |
| THEME-01 | 4 themes are visually distinct | manual smoke | Visual inspection | N/A |

Note: The theme class computation logic is pure JavaScript (a computed with 4 comparisons) and is unit-testable. The visual rendering and 800ms timing are manual-only.

### Sampling Rate
- **Per task commit:** `npm run test`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green (all 27 existing + new theme unit tests passing) before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/composables/__tests__/useDifficultyTheme.test.js` — or inline tests for the `difficultyThemeClass` computed logic — covers THEME-01 threshold mapping

*(If theme logic lives in App.vue as a simple computed rather than a composable, the unit test can directly call a pure function extracted from that computed — extract to `src/utils/difficultyTheme.js` to make it testable.)*

---

## Security Domain

### Applicable ASVS Categories (Level 1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | n/a — no auth involved |
| V3 Session Management | No | n/a |
| V4 Access Control | No | n/a |
| V5 Input Validation | No | Theme is derived from internal reactive state, not user input |
| V6 Cryptography | No | n/a |

Phase 7 is purely presentational CSS. No user input, no network calls, no authentication, no storage of new sensitive data. No ASVS controls apply. [VERIFIED: phase description — "pure CSS, no image assets"]

---

## Sources

### Primary (HIGH confidence)
- `src/composables/useMathGame.js` — verified `difficulty.maxOperandByOperator` structure, ranges (3–20 for +/-, 3–10 for ×/÷)
- `src/style.css` — verified current `body` gradient, cloud pseudo-elements, existing reduced-motion rule
- `src/App.vue` — verified `difficulty` destructuring, `streakFlash` class binding pattern, `#app-root` div structure
- `src/composables/useLevelTheme.js` — verified existing bg color tokens per level (used as palette reference)
- `package.json` — verified all dependency versions

### Secondary (MEDIUM confidence)
- CSS specification knowledge — gradient interpolation behavior with matching stop counts

### Tertiary (LOW confidence — marked ASSUMED)
- A1: CSS gradient transition reliability across all target browsers
- A2: `Math.max` as best difficulty aggregation signal
- A3: First-load snap acceptability
- A4: 4-stop same-direction gradient sufficient for interpolation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all verified from package.json; no new packages needed
- Architecture: HIGH for signal derivation and class binding pattern; MEDIUM for CSS gradient transition reliability (browser-dependent)
- Pitfalls: HIGH — derived from verified codebase knowledge and CSS specification

**Research date:** 2026-05-16
**Valid until:** 2026-08-16 (CSS specifications and Vue 3 APIs are stable)
