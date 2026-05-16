# Phase 11: Personalized Mascot Interactions - Research

**Researched:** 2026-05-16
**Domain:** Vue 3 composables, CSS filter animations, speech bubble state machine
**Confidence:** HIGH

---

## Summary

Phase 11 adds nine reaction states to the mascot system, a randomized speech-bubble line pool
(`useMascotLines.js`), and CSS filter animations that make the character image respond visually
to each state. The work is purely additive — no existing APIs are removed or replaced.

The existing codebase already contains solid infrastructure to build on: `MascotPanel.vue` and
`ChallengeZone.vue` both show speech bubbles with a proven `bubble-fade` Transition and
3-second auto-dismiss. `useCharacterVoice.js` already holds per-character phrase banks for
correct/wrong/streak/idle/levelUp events and follows the `pick(arr)` pattern for random
selection. `useMathGame.js` already tracks `streak`, `stars`, `level`, `feedback`,
`successRate`, `zeroHint`, and `showLevelVictory` — all the raw signals needed to derive the
nine reaction states.

The recommended approach is: (1) add a `mascotReaction` computed ref to `useMathGame.js` that
derives the current state from existing signals; (2) create `useMascotLines.js` as a pure phrase
pool composable that maps states and character IDs to random text (parallel to
`useCharacterVoice.js`); (3) define CSS keyframe animation classes in `style.css` using the
existing `filter:` property patterns already present (`rainbow-shimmer` demonstrates this);
(4) thread `mascotReaction` and a `mascotLine` text prop through App.vue into ChallengeZone.vue;
(5) apply the CSS filter class and bubble display directly in ChallengeZone.vue.

**Primary recommendation:** Derive all nine reaction states as a single `computed` ref in
`useMathGame.js`, keep phrase data in a separate `useMascotLines.js`, and drive visual output
with CSS `filter:` keyframes — zero new runtime dependencies required.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REACT-01 | Dynamic mascot reactions based on performance (9 reaction states) | mascotReaction computed + useMascotLines.js + CSS filter classes covers all three sub-goals |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 (already installed) | ^3.5.32 | `computed`, `watch`, `ref` for reactive state | Project baseline [VERIFIED: package.json] |
| Vitest (already installed) | ^3.2.4 | Unit tests for useMathGame + useMascotLines | Project baseline [VERIFIED: package.json] |
| @vitest/coverage-v8 (already installed) | ^3.2.4 | Coverage reporting | Project baseline [VERIFIED: package.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CSS `filter:` (browser native) | — | brightness/saturate/hue-rotate animations | All mascot visual states |
| Web Speech API (browser native) | — | Voice lines (already wired via useCharacterVoice) | Optional TTS per state |

No new npm packages are required. [VERIFIED: codebase inspection]

**Installation:** none needed.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── composables/
│   ├── useMathGame.js          # add mascotReaction computed ref
│   └── useMascotLines.js       # NEW — phrase pool keyed by (state, characterId)
├── components/
│   └── ChallengeZone.vue       # apply mascot-* CSS class + bubble
└── style.css                   # add 9 CSS filter keyframe classes
```

### Pattern 1: mascotReaction Computed Ref in useMathGame.js

**What:** A single `computed` that returns one of the nine state string tokens based on priority
ordering of existing reactive refs.

**When to use:** Any time you need a single authoritative "what is the mascot feeling right now"
value downstream.

Priority order (highest to lowest):
```
'levelVictory'   → showLevelVictory.value === true
'levelIntro'     → showLevelIntro.value === true (new level starting)
'correct'        → feedback.value === 'correct' AND streak.value < 3
'streak3'        → feedback.value === 'correct' AND streak.value === 3
'streak5'        → feedback.value === 'correct' AND streak.value === 5
'streakHigh'     → feedback.value === 'correct' AND streak.value >= 10
'wrong'          → feedback.value === 'wrong'
'zeroHint'       → zeroHint.value !== ''
'idle'           → all others (default/waiting state)
```

**Example:**
```js
// Source: [ASSUMED] — follows existing pattern in useMathGame.js
const mascotReaction = computed(() => {
  if (showLevelVictory.value) return 'levelVictory'
  if (showLevelIntro.value)   return 'levelIntro'
  if (feedback.value === 'correct') {
    if (streak.value >= 10) return 'streakHigh'
    if (streak.value >= 5)  return 'streak5'
    if (streak.value >= 3)  return 'streak3'
    return 'correct'
  }
  if (feedback.value === 'wrong') return 'wrong'
  if (zeroHint.value)             return 'zeroHint'
  return 'idle'
})
```

### Pattern 2: useMascotLines.js — Phrase Pool Composable

**What:** A pure composable (no Vue reactive state needed internally — just functions + data)
that accepts `(state, characterId)` and returns a random line from the appropriate pool.

**When to use:** Whenever ChallengeZone.vue (or App.vue) needs a text string to display in the
mascot's speech bubble for the current reaction state.

```js
// Source: [ASSUMED] — mirrors useCharacterVoice.js structure already in codebase
const LINES = {
  peach: {
    correct:      ['Wonderful!', 'You got it!', 'Brilliant!'],
    wrong:        ['Oh my! Try again!', 'You can do it!'],
    streak3:      ['Three in a row! Amazing!'],
    streak5:      ['Five! You are incredible!'],
    streakHigh:   ['TEN IN A ROW! Math superstar!'],
    levelVictory: ['You saved the kingdom!', 'Hooray!'],
    levelIntro:   ['Ready for a new world?', 'Here we go!'],
    zeroHint:     ['Zero is special!', 'Remember: anything times zero is zero!'],
    idle:         ['You can do it!', 'Take your time!'],
  },
  daisy:    { /* same keys */ },
  rosalina: { /* same keys */ },
  toad:     { /* same keys */ },
}

export function useMascotLines () {
  function getLine(state, characterId) {
    const charLines = LINES[characterId] ?? LINES['peach']
    const pool = charLines[state] ?? charLines['idle']
    return pool[Math.floor(Math.random() * pool.length)]
  }
  return { getLine }
}
```

### Pattern 3: CSS Filter Animation Classes

**What:** One `@keyframes` rule per state, applied as a class on the mascot `<img>` element.
Uses `filter:` property only — no JS animation, no external library.

**When to use:** Every state that needs a visual expression beyond the existing `scale-110`
(correct) and `shake` (wrong) classes.

Nine states and their proposed filter effects:
```
.mascot-idle         → filter: none  (or base float, already handled by animate-float)
.mascot-correct      → brightness(1.3) saturate(1.5) — brief warm glow
.mascot-wrong        → brightness(0.85) saturate(0.5) grayscale(0.3)
.mascot-streak3      → hue-rotate(10deg) brightness(1.2) saturate(1.8)
.mascot-streak5      → hue-rotate(20deg) brightness(1.35) saturate(2.0)
.mascot-streak-high  → rainbow-shimmer (already exists in style.css as .rainbow-shimmer)
.mascot-zero-hint    → brightness(1.1) saturate(0.9) — subtle calm
.mascot-level-intro  → brightness(1.15) saturate(1.3) — expectant
.mascot-level-victory → brightness(1.5) saturate(2.0) hue-rotate(30deg) — triumphant
```

streakHigh can simply compose the existing `.rainbow-shimmer` class to avoid duplication.

**Example CSS (scoped or global in style.css):**
```css
/* Source: [ASSUMED] — follows rainbow-shimmer pattern already in style.css */
@keyframes mascot-correct-glow {
  0%, 100% { filter: brightness(1) saturate(1); }
  40%      { filter: brightness(1.35) saturate(1.6); }
}
.mascot-correct { animation: mascot-correct-glow 0.6s ease-out forwards; }

@keyframes mascot-wrong-dim {
  0%, 100% { filter: brightness(1) saturate(1) grayscale(0); }
  50%      { filter: brightness(0.8) saturate(0.4) grayscale(0.4); }
}
.mascot-wrong { animation: mascot-wrong-dim 0.7s ease-out forwards; }
```

### Pattern 4: Prop Threading via App.vue

**What:** App.vue receives `mascotReaction` from `useMathGame()` and a `mascotLine` string
(produced by `useMascotLines().getLine(reaction, charId)` inside a watcher) and passes both to
`ChallengeZone.vue` as props.

**Integration point:** ChallengeZone already accepts `zeroHint`, `idleMessage`, `feedback`,
`character`, `variantSrc` — the new `mascotReaction` and `mascotLine` props follow the same
pattern.

**Bubble priority (extends existing logic):**
```
zeroHint > mascotLine (for non-idle states) > idleMessage
```

The existing bubble priority in ChallengeZone.vue uses `v-if="showBubble && zeroHint"` then
`v-if="idleMessage && !zeroHint"`. Phase 11 inserts mascotLine at priority 2:
```
zeroHint (D-10) > mascotLine (new reaction) > idleMessage (idle nudge)
```

### Anti-Patterns to Avoid

- **Storing mascotReaction in localStorage:** It is transient display state derived from game
  signals. Never persist it. [ASSUMED]
- **Re-duplicating phrases from useCharacterVoice.js:** useMascotLines is for _bubble text_;
  useCharacterVoice is for _speech synthesis_. They can share content by coincidence but should
  not import each other. [ASSUMED]
- **Toggling CSS classes from a setTimeout in the composable:** Use Vue's `watch` with flush:
  'post' in the component instead. Composables should not own DOM concerns. [ASSUMED]
- **Blocking bubble overlap with a single showBubble boolean:** Each bubble source (zeroHint,
  mascotLine, idleMessage) already has its own guard in ChallengeZone; keep them separate.
  [VERIFIED: ChallengeZone.vue inspection]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS filter transitions | JS-driven GSAP or inline style mutations | CSS `@keyframes` + class toggle | Zero deps, GPU-composited, reduced-motion already handled in style.css |
| Random phrase selection | Complex weighted shuffle | `arr[Math.floor(Math.random() * arr.length)]` | Already the project pattern in useCharacterVoice.js; correct for a children's game [VERIFIED: useCharacterVoice.js] |
| Reaction state machine | External XState library | Single `computed` priority cascade | Overkill for 9 linear states with no async transitions |
| Animation library | Vue-use motion, Animate.css | Native CSS keyframes in style.css | Project already uses only native CSS animations (float, shake, pulse-glow, rainbow-shimmer) [VERIFIED: style.css] |

---

## Common Pitfalls

### Pitfall 1: CSS `filter:` on `.animate-float` Interaction
**What goes wrong:** Adding `filter:` to the mascot `<img>` element that already has
`.animate-float` (which uses `transform`) can cause a stacking context conflict on some mobile
browsers — filter creates a new stacking context, which can clip `z-index` children.
**Why it happens:** `filter: non-none` always creates a new stacking context.
**How to avoid:** Apply the filter animation class to a wrapper `<div>` _around_ the `<img>`,
not to the `<img>` itself. The `<img>` keeps `.animate-float`. [ASSUMED — known CSS behavior]
**Warning signs:** Speech bubble (z-30) disappears behind the mascot image during filter states.

### Pitfall 2: Stale Bubble Text on Fast Consecutive Answers
**What goes wrong:** Player answers two problems quickly; mascotLine from problem 1 still shows
when problem 2 generates a new state.
**Why it happens:** The bubble auto-dismiss timer from the old state is still running.
**How to avoid:** Mirror the existing pattern: in the watcher for `mascotReaction` (or
`mascotLine`), always `clearTimeout(bubbleTimer)` before setting the new text.
[VERIFIED: ChallengeZone.vue — identical pattern used for zeroHint and idleMessage]

### Pitfall 3: mascotReaction Priority Ordering
**What goes wrong:** `streak5` fires during a `levelVictory` overlay, triggering a conflicting
animation while the victory modal is visible.
**Why it happens:** If `feedback` is evaluated before `showLevelVictory` in the computed.
**How to avoid:** Always check `showLevelVictory` and `showLevelIntro` first in the priority
cascade. [ASSUMED — follows modal priority already established in App.vue]

### Pitfall 4: `streak` Reads Stale After `checkAnswer`
**What goes wrong:** `mascotReaction` reads `streak.value` immediately after `checkAnswer()` and
sees the pre-update value because `computed` may not have flushed yet.
**Why it happens:** In Vitest/jsdom `computed` is synchronously reactive, but in
test environments calling composable functions directly can expose ordering assumptions.
**How to avoid:** `mascotReaction` should be a `computed` (lazy) not a function called in
`checkAnswer` — Vue's scheduler ensures computed refs see up-to-date reactive values after the
setter completes. [VERIFIED: useMathGame.js shows correct computed pattern for zeroHint]

### Pitfall 5: Vitest — No DOM, `speechSynthesis` Unavailable
**What goes wrong:** Tests for `useMascotLines.js` fail because `Math.random()` returns 0 every
time in test and always picks index 0.
**Why it happens:** Deterministic behavior is fine for unit tests; the phrase pool just needs
to verify the correct pool is selected, not which random phrase within it.
**How to avoid:** In tests, assert `pool.includes(result)` rather than `result === specificPhrase`.
[ASSUMED — follows test pattern in useMathGame.test.js]

---

## Code Examples

### Existing bubble auto-dismiss pattern to mirror (ChallengeZone.vue)
```js
// Source: [VERIFIED: ChallengeZone.vue lines 21-29]
watch(() => props.zeroHint, (hint) => {
  clearTimeout(bubbleTimer)
  if (hint) {
    showBubble.value = true
    bubbleTimer = setTimeout(() => { showBubble.value = false }, 3000)
  } else {
    showBubble.value = false
  }
}, { immediate: true })
```

### Existing pick() pattern (useCharacterVoice.js)
```js
// Source: [VERIFIED: useCharacterVoice.js line 61-63]
function pick (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
```

### Existing rainbow-shimmer filter animation (style.css)
```css
/* Source: [VERIFIED: style.css lines 300-305] */
@keyframes rainbow-shimmer {
  0%   { filter: hue-rotate(0deg) brightness(1); }
  50%  { filter: hue-rotate(60deg) brightness(1.2); }
  100% { filter: hue-rotate(0deg) brightness(1); }
}
.rainbow-shimmer {
  animation: rainbow-shimmer 2s ease-in-out infinite;
}
```

### Existing reduced-motion guard (style.css)
```css
/* Source: [VERIFIED: style.css lines 311-323] */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
All new CSS keyframes added to style.css are automatically covered by this existing guard.

### Existing feedback class binding on mascot image (ChallengeZone.vue)
```html
<!-- Source: [VERIFIED: ChallengeZone.vue lines 88-95] -->
<img
  :class="{
    'scale-110 transition-transform duration-300': feedback === 'correct',
    'shake': feedback === 'wrong',
  }"
/>
```
Phase 11 extends this `:class` binding with the new `.mascot-*` filter classes.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JS-driven CSS via inline `style` mutations | CSS `@keyframes` + class toggle | CSS3 era | No rAF loops, better GPU compositing |
| Global animation libraries (Animate.css) | Native keyframes scoped per project | Project convention (established in style.css) | Smaller bundle, no version conflicts |

**Deprecated/outdated:**
- Vue 2 `$nextTick` for animation timing: Vue 3 uses `watch({ flush: 'post' })` instead. [ASSUMED]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | mascotReaction priority order (levelVictory → idle) | Architecture Patterns | Wrong order could fire streak animation over victory modal — reorder cascade |
| A2 | Filter class applied to wrapper div to avoid float stacking context | Common Pitfalls | If wrapper div is already a stacking context, extra nesting may not help — test on Safari/iOS |
| A3 | useMascotLines phrase content (9 states × 4 characters) | Architecture Patterns | Content is a UX decision; planner should confirm or defer to user for phrase copy |
| A4 | mascotLine display duration (3000ms matching zeroHint) | Architecture Patterns | May need to be shorter for 'correct' (which transitions quickly) |
| A5 | Bubble priority: zeroHint > mascotLine > idleMessage | Architecture Patterns | If idle message should be suppressed differently, adjust v-if guards |

---

## Open Questions

1. **Phrase copy for all 9 states × 4 characters (36 pools)**
   - What we know: useCharacterVoice.js shows the pattern and existing voice personalities
   - What's unclear: Whether all 36 pools need unique phrases or shared fallbacks are acceptable
   - Recommendation: Use character-specific pools for the 5 emotionally distinct states
     (correct, wrong, streak, victory, idle); shared fallbacks for zeroHint/levelIntro

2. **Should mascotLine TTS fire in addition to the bubble text?**
   - What we know: useCharacterVoice.js already handles TTS for correct/wrong/streak
   - What's unclear: Would triggering TTS from useMascotLines too cause double-speech?
   - Recommendation: useMascotLines is bubble-text only; TTS stays in useCharacterVoice

3. **Bubble dismiss duration for transient states**
   - What we know: zeroHint uses 3000ms; idleMessage uses 4500ms
   - What's unclear: 'correct' state resolves in ~1400ms before generateProblem fires
   - Recommendation: Use 1200ms for correct/streak states, 3000ms for wrong/idle/hint states

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — pure composable + CSS additions, no new CLI tools
or services required)

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 + jsdom |
| Config file | vite.config.js (`test:` block) |
| Quick run command | `npm run test` |
| Full suite command | `npm run test -- --coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REACT-01a | mascotReaction returns correct state for all 9 inputs | unit | `npm run test -- --reporter=verbose` | ❌ Wave 0 |
| REACT-01b | useMascotLines.getLine returns a string from correct pool | unit | `npm run test -- --reporter=verbose` | ❌ Wave 0 |
| REACT-01c | CSS filter classes are defined (visual — not auto-testable) | manual | n/a — human verify | — |

### Sampling Rate
- **Per task commit:** `npm run test`
- **Per wave merge:** `npm run test -- --coverage`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/composables/__tests__/useMascotLines.test.js` — covers REACT-01b (getLine pool selection per state and character)
- [ ] Extend `src/composables/__tests__/useMathGame.test.js` — covers REACT-01a (mascotReaction computed values for all 9 states)

*(Existing test setup.js and jsdom environment already cover new composable tests with no changes needed)*

---

## Security Domain

### Applicable ASVS Categories (Level 1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | no | Mascot lines are static string arrays, not user input |
| V6 Cryptography | no | — |

No security controls apply to this phase. The feature is entirely client-side display logic
using static phrase strings with no user input, external calls, or data storage beyond what
already exists. [ASSUMED — review if future phases add user-supplied mascot text]

---

## Sources

### Primary (HIGH confidence)
- `src/composables/useMathGame.js` — existing reactive state (streak, stars, level, feedback, zeroHint, showLevelVictory, showLevelIntro) [VERIFIED: codebase]
- `src/composables/useCharacterVoice.js` — phrase pool structure, pick() pattern, 4-character config [VERIFIED: codebase]
- `src/components/ChallengeZone.vue` — bubble auto-dismiss pattern, feedback class binding, bubble priority logic [VERIFIED: codebase]
- `src/components/MascotPanel.vue` — existing speech bubble implementation with 3s dismiss [VERIFIED: codebase]
- `src/style.css` — existing CSS animation patterns (rainbow-shimmer, shake, animate-float, pulse-glow, reduced-motion guard) [VERIFIED: codebase]
- `package.json` — dependency versions [VERIFIED: codebase]
- `vite.config.js` — test environment (jsdom), test include globs [VERIFIED: codebase]

### Secondary (MEDIUM confidence)
- None — all claims derivable from direct codebase inspection

### Tertiary (LOW confidence)
- CSS filter stacking context behavior on iOS Safari — general CSS knowledge [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from package.json, no new deps needed
- Architecture: HIGH — all patterns verified from existing codebase files
- Pitfalls: MEDIUM — filter stacking context pitfall is CSS-general knowledge, not tested on this codebase
- Phrase content: LOW — creative/UX content; marked as assumption

**Research date:** 2026-05-16
**Valid until:** 2026-06-16 (stable stack, no fast-moving dependencies)
