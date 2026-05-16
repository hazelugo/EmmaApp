# Phase 2: Multiplication & Division - Research

**Researched:** 2026-04-20
**Domain:** Vue 3 SPA / composable extension / adaptive math game mechanics
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Operator selection is pure random — equal probability among all unlocked operators. No weighting or rotation.
- **D-02:** Unlock thresholds: `×` at level 3, `÷` at level 5. Evaluated at problem-generation time using the current `level` ref.
- **D-03:** Each operator maintains its own `maxOperand` independently via a `maxOperandByOperator` object (e.g., `{ '+': 10, '-': 8, '×': 3, '÷': 2 }`). The shared `difficulty.maxOperand` is replaced by this structure.
- **D-04:** New operator starting `maxOperand` is conservative: 2 or 3 (planner's discretion).
- **D-05:** `×` and `÷` cap at maxOperand 10. `+` and `-` retain their existing cap of 20.
- **D-06:** localStorage keys: `emma-maxOperand-multiply`, `emma-maxOperand-divide`. Written on every difficulty adjustment.
- **D-07:** Division uses quotient-first approach: pick divisor `b` (1–maxOperand) and quotient `c` (1–maxOperand), compute `a = b × c`, present `a ÷ b = ?`.
- **D-08:** Divisor never 0. Quotient never 0 (minimum 1).
- **D-09:** Zero is allowed as operand for all operators.
- **D-10:** When a problem contains a zero operand, mascot displays an operator-specific speech bubble hint.
- **D-11:** Zero hint speech bubble disappears automatically after a few seconds (~3s is reasonable).
- **D-12:** One-time animated step-through tutorial overlay fires the first time each operator becomes available.
- **D-13:** Tutorial fires before the first problem of that operator is served.
- **D-14:** Tutorial shown-state persisted in localStorage: `emma-tutorial-multiply-seen`, `emma-tutorial-divide-seen`.
- **D-15:** New overlay component `OperatorTutorialOverlay.vue`, following the established overlay pattern (fixed inset-0, z-layer, fade Transition from `CharacterSelect.vue`).
- **D-16:** `LevelIntroModal` includes an extra line announcing the new operator when level 3 or level 5 is reached. Additive — no new modal.

### Claude's Discretion
- Exact starting `maxOperand` for new operators (2 or 3)
- Whether to enforce a minimum divisor of 2 to avoid trivial `a ÷ 1` cases
- Animation style for the step-through tutorial (dot arrays, repeated-addition visual, etc.)
- Exact speech bubble duration for zero hints (~3s)
- Exact hint text per operator (wording in D-10 is a guide)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MATH-01 | Multiplication operator unlocks at level 3 | D-02: level ref gate in `generateProblem()`; existing `level` ref already persisted in localStorage |
| MATH-02 | Division operator unlocks at level 5 | D-02: same gate mechanism; D-07/D-08: quotient-first generation avoids zero-division |
| MATH-03 | Per-operator difficulty scaling is independent (separate maxOperand tracking) | D-03: `maxOperandByOperator` object replaces shared `difficulty.maxOperand`; D-06: per-operator localStorage keys |
</phase_requirements>

---

## Summary

Phase 2 extends a single composable (`useMathGame.js`) and adds one new Vue SFC (`OperatorTutorialOverlay.vue`) to unlock multiplication and division operators with independent per-operator difficulty scaling. The codebase is a vanilla Vue 3 Composition API SPA with no TypeScript, no router, no state manager — just composables returning reactive refs and a flat action surface wired through `App.vue`.

The core change is a data-structure refactor: `difficulty.maxOperand` (a single number) becomes `maxOperandByOperator` (an object keyed by operator symbol). The `generateProblem()`, `adjustDifficulty()`, `correctAnswer` computed, and `resetGame()` functions all need coordinated updates. The problem-generation strategy for division is distinct from addition/subtraction: the quotient-first approach guarantees clean integer results without retry loops.

Three UX features accompany the math changes: (1) a zero-operand mascot speech bubble wired into `MascotPanel.vue`, (2) an unlock announcement line added to `LevelIntroModal.vue` at levels 3 and 5, and (3) a new `OperatorTutorialOverlay.vue` that fires once per operator before the first problem of that type is served.

**Primary recommendation:** Treat this phase as three coordinated work streams: (A) `useMathGame.js` math engine changes, (B) `OperatorTutorialOverlay.vue` new component, and (C) `LevelIntroModal.vue` + `MascotPanel.vue` minor extensions — each independently plannable but must integrate through `App.vue`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Operator unlock logic | Composable (`useMathGame.js`) | — | All game logic lives in the composable; `App.vue` only orchestrates |
| Per-operator difficulty scaling | Composable (`useMathGame.js`) | localStorage | Same ZPD algorithm, per-operator maxOperand replaces shared one |
| Division problem generation (quotient-first) | Composable (`useMathGame.js`) | — | Problem generation is fully inside `generateProblem()` |
| `correctAnswer` computed (×, ÷ branches) | Composable (`useMathGame.js`) | — | Computed already exists, needs two new branches |
| Tutorial shown-state persistence | Composable (`useMathGame.js`) | localStorage | State must survive page refresh; composable owns all localStorage |
| Tutorial overlay display | `OperatorTutorialOverlay.vue` | `App.vue` (wires visibility) | Component owns UI; App.vue owns show/hide state refs |
| Zero-hint speech bubble | `MascotPanel.vue` | `App.vue` (passes prop) | MascotPanel is the speech bubble surface; composable detects zero |
| Unlock announcement | `LevelIntroModal.vue` | `App.vue` (passes prop) | Additive — extend existing modal's template with conditional line |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 | 3.5.32 [VERIFIED: package.json] | Reactivity, composables, SFCs | Already installed, entire app is Vue 3 |
| Vite | 8.0.4 [VERIFIED: package.json] | Dev server, HMR, build | Already installed |
| Tailwind CSS v4 | 4.2.2 [VERIFIED: package.json] | Utility classes, animation | Already installed; theme tokens in `src/style.css` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| canvas-confetti | 1.9.4 [VERIFIED: package.json] | Particle effects | Already used on correct answers |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline CSS animation in new overlay | Reuse existing `style.css` keyframes | Reuse preferred — `.pop-in`, `.animate-float`, `.pulse-glow` already defined globally |
| New composable for tutorial state | Extend `useMathGame.js` | Context says no new composable needed; wires into existing return object |

**Installation:** No new packages required. All dependencies are already installed.

---

## Architecture Patterns

### System Architecture Diagram

```
localStorage (emma-maxOperand-multiply, emma-maxOperand-divide,
              emma-tutorial-multiply-seen, emma-tutorial-divide-seen)
        │
        ▼
useMathGame.js  ──────────────────────────────────────────────────────┐
  maxOperandByOperator: { '+': N, '-': N, '×': N, '÷': N }            │
  showTutorial: ref(false)                                             │
  tutorialOperator: ref(null)                                          │
  zerHint: computed (operator + has-zero → hint string | null)         │
  generateProblem() → operator gate → quotient-first for ÷            │
  adjustDifficulty() → per-operator maxOperand update                  │
  correctAnswer computed → +, -, ×, ÷ branches                        │
        │                                                             │
        ▼                                                             │
App.vue (orchestrator)                                                │
  - watches level for operator unlock triggers                         │
  - passes showTutorial / tutorialOperator to OperatorTutorialOverlay  │
  - passes zeroHint to MascotPanel                                     │
  - passes unlockedOperator prop to LevelIntroModal                    │
        │
        ├─► OperatorTutorialOverlay.vue  (NEW — v-if showTutorial)
        │     tap-to-proceed animation → emits @done → App clears
        │
        ├─► LevelIntroModal.vue  (EXTEND — add unlock announcement line)
        │     + conditional "New move: ×!" text at levels 3 & 5
        │
        ├─► MascotPanel.vue  (EXTEND — add speech bubble slot/prop)
        │     + zero-hint text displayed for ~3s then cleared
        │
        └─► ChallengeZone.vue  (no change — receives operator prop already)
```

### Recommended Project Structure

No new directories needed. Changes touch:

```
src/
├── composables/
│   └── useMathGame.js          # Core changes (operator gate, per-op difficulty, division gen)
├── components/
│   ├── OperatorTutorialOverlay.vue   # NEW
│   ├── LevelIntroModal.vue           # EXTEND (unlock announcement)
│   └── MascotPanel.vue               # EXTEND (zero hint speech bubble)
└── App.vue                           # WIRE new overlay + pass new props
```

### Pattern 1: Per-Operator maxOperand Object

**What:** Replace `difficulty.maxOperand` (number) with `maxOperandByOperator` (object keyed by operator symbol).
**When to use:** Everywhere `difficulty.maxOperand` was read; each access must specify the operator.

```js
// Source: codebase analysis of useMathGame.js
// BEFORE
const difficulty = reactive({
  maxOperand: getStorage('emma-maxOperand', 5),
  history: [],
  historySize: 10,
})

// AFTER
const difficulty = reactive({
  maxOperandByOperator: {
    '+': getStorage('emma-maxOperand-add',      10),
    '-': getStorage('emma-maxOperand-subtract', 10),
    '×': getStorage('emma-maxOperand-multiply',  3),
    '÷': getStorage('emma-maxOperand-divide',    3),
  },
  history: [],
  historySize: 10,
})
```

**localStorage key migration note:** The old `emma-maxOperand` key was shared. The new per-operator keys are separate. `resetGame()` must clear all four. On first load after upgrade, `getStorage` will return the fallback values (nothing to migrate — starting fresh is acceptable for a children's game where progress is stars, not difficulty state).

### Pattern 2: Operator Gate in generateProblem()

**What:** Build the ops array dynamically from the current `level` ref before picking an operator.
**When to use:** Every call to `generateProblem()`.

```js
// Source: codebase analysis — level ref already persisted and available
function generateProblem () {
  const ops = ['+', '-']
  if (level.value >= 3) ops.push('×')
  if (level.value >= 5) ops.push('÷')

  currentProblem.operator = ops[Math.floor(Math.random() * ops.length)]
  const max = difficulty.maxOperandByOperator[currentProblem.operator]

  if (currentProblem.operator === '+') { /* ... unchanged ... */ }
  else if (currentProblem.operator === '-') { /* ... unchanged ... */ }
  else if (currentProblem.operator === '×') {
    currentProblem.a = Math.floor(Math.random() * (max + 1))  // 0..max (zero allowed per D-09)
    currentProblem.b = Math.floor(Math.random() * (max + 1))
  }
  else if (currentProblem.operator === '÷') {
    // Quotient-first approach — guarantees clean integer result (D-07)
    const divisor  = Math.floor(Math.random() * (max - 1)) + 2  // 2..max (min 2 — Claude discretion)
    const quotient = Math.floor(Math.random() * max) + 1         // 1..max (never 0 per D-08)
    currentProblem.a = divisor * quotient   // dividend
    currentProblem.b = divisor              // divisor
  }
  // ... reset answer, feedback, bump problemKey
}
```

### Pattern 3: correctAnswer Computed — New Branches

```js
// Source: codebase analysis
const correctAnswer = computed(() => {
  if (currentProblem.operator === '+') return currentProblem.a + currentProblem.b
  if (currentProblem.operator === '-') return currentProblem.a - currentProblem.b
  if (currentProblem.operator === '×') return currentProblem.a * currentProblem.b
  if (currentProblem.operator === '÷') return currentProblem.a / currentProblem.b  // always integer by construction
  return 0
})
```

### Pattern 4: Per-Operator adjustDifficulty()

**What:** The ZPD algorithm runs independently per operator. History and maxOperand are now scoped per operator.
**Key concern:** The existing `difficulty.history` is a single rolling window. With multiple operators, a history of the last 10 answers may mix operators, diluting per-operator signal. Two approaches:

- **Simple (recommended):** Keep one shared history window. Difficulty adjusts the *current operator's* `maxOperandByOperator` entry. Works because difficulty is adjusted after each answer — the current operator is always known.
- **Complex (not recommended):** Separate history per operator. Over-engineered for a child's game.

```js
// Source: codebase analysis — adapt existing adjustDifficulty()
function adjustDifficulty () {
  if (difficulty.history.length < 5) return
  const op  = currentProblem.operator
  const cap = (op === '×' || op === '÷') ? 10 : 20
  const floor = 3

  if (successRate.value >= 0.9 && difficulty.maxOperandByOperator[op] < cap) {
    difficulty.maxOperandByOperator[op] = Math.min(difficulty.maxOperandByOperator[op] + 1, cap)
    setStorage(`emma-maxOperand-${operatorKey(op)}`, difficulty.maxOperandByOperator[op])
  } else if (successRate.value < 0.6 && difficulty.maxOperandByOperator[op] > floor) {
    difficulty.maxOperandByOperator[op] = Math.max(difficulty.maxOperandByOperator[op] - 1, floor)
    setStorage(`emma-maxOperand-${operatorKey(op)}`, difficulty.maxOperandByOperator[op])
  }
}

function operatorKey (op) {
  return { '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide' }[op]
}
```

### Pattern 5: Tutorial State Machine in useMathGame.js

**What:** Expose `showTutorial` and `tutorialOperator` refs from the composable. Set them when level gate is crossed during `generateProblem()` and the operator has not been seen before.

```js
// Source: codebase analysis — follows existing showLevelIntro / pendingLevel pattern
const showTutorial    = ref(false)
const tutorialOperator = ref(null)  // '×' | '÷' | null

function checkOperatorUnlock () {
  if (level.value >= 3 && !getStorageBool('emma-tutorial-multiply-seen')) {
    tutorialOperator.value = '×'
    showTutorial.value     = true
    return true  // caller should NOT generate problem yet
  }
  if (level.value >= 5 && !getStorageBool('emma-tutorial-divide-seen')) {
    tutorialOperator.value = '÷'
    showTutorial.value     = true
    return true
  }
  return false
}

function dismissTutorial () {
  if (tutorialOperator.value === '×') {
    setStorage('emma-tutorial-multiply-seen', '1')
  } else if (tutorialOperator.value === '÷') {
    setStorage('emma-tutorial-divide-seen', '1')
  }
  showTutorial.value     = false
  tutorialOperator.value = null
  generateProblem()
}

// getStorageBool is a helper that returns true if localStorage key exists and is truthy
function getStorageBool (key) {
  try { return !!localStorage.getItem(key) } catch { return false }
}
```

`checkOperatorUnlock()` is called at the top of `generateProblem()` — if it returns `true`, `generateProblem()` returns early without setting a problem. `App.vue` wires `showTutorial` → `OperatorTutorialOverlay`, and `@done` → calls `dismissTutorial()`.

### Pattern 6: OperatorTutorialOverlay.vue Structure

**What:** Full-screen overlay following the `CharacterSelect.vue` pattern (fixed, inset-0, z-[200], `<Transition name="fade">`).

```vue
<!-- Source: CharacterSelect.vue overlay pattern -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[200] bg-dark/90 flex flex-col items-center justify-center p-6">
      <!-- Animation area: dot-array or repeated-addition visual -->
      <!-- Step indicator: "Step 1 of 3" -->
      <!-- Operator explanation text -->
      <!-- TAP TO CONTINUE button -->
    </div>
  </Transition>
</template>
```

Props: `show` (Boolean), `operator` (String: '×' or '÷').
Emits: `done`.

The overlay manages its own internal `step` ref to sequence through animation frames. Child taps advance to the next step; on final step tap, emits `done`.

**Animation strategy (Claude's discretion — repeated-addition recommended for ×):**
- `×` step 1: "3 groups of 4 dots" rendered as a grid with CSS
- `×` step 2: Arrow → `3 × 4 = 12`
- `÷` step 1: "12 dots split into 3 groups"
- `÷` step 2: Arrow → `12 ÷ 3 = 4`

Dots rendered as inline `<span>` circles via Tailwind (`w-4 h-4 rounded-full bg-star-gold`). No external library needed.

### Pattern 7: Zero Hint in MascotPanel.vue

**What:** When a problem contains a zero operand, the composable exposes a computed `zeroHint` string; `MascotPanel` receives it as a prop and shows it in a speech bubble for ~3s.

```js
// Source: codebase analysis — useMathGame.js, extend
const zeroHint = computed(() => {
  const { a, b, operator } = currentProblem
  if (a !== 0 && b !== 0) return ''
  if (operator === '×') return 'Anything times zero is zero!'
  if (operator === '+') return 'Adding zero doesn\'t change a number!'
  if (operator === '-') return 'Subtracting zero leaves it the same!'
  if (operator === '÷' && a === 0) return 'Zero divided by anything is zero!'
  return ''
})
```

Auto-dismiss: use a `watch` in `MascotPanel.vue` (or in `App.vue`) on `zeroHint` — when it becomes non-empty, start a 3000ms `setTimeout` to clear a local `showZeroHint` ref. The speech bubble uses absolute positioning above the character sprite — same bubble style as feedback.

### Pattern 8: LevelIntroModal Unlock Announcement

**What:** Add a prop `unlockedOperator` (String | null) to `LevelIntroModal.vue`. When non-null, render an extra line in the text block.

```js
// Source: LevelIntroModal.vue — extend defineProps
defineProps({
  show:             { type: Boolean, default: false },
  level:            { type: Number,  default: 1 },
  theme:            { type: Object,  default: () => ({}) },
  isMuted:          { type: Boolean, default: false },
  unlockedOperator: { type: String,  default: null },  // NEW
})
```

In template, inside `.text-block`:
```html
<p v-if="unlockedOperator" class="unlock-announce">
  New move unlocked: {{ unlockedOperator }}!
</p>
```

`App.vue` computes `unlockedOperator` as a computed that returns `'×'` if `pendingLevel === 3`, `'÷'` if `pendingLevel === 5`, else `null`, and passes it to `LevelIntroModal`.

### Anti-Patterns to Avoid

- **Using `difficulty.maxOperand` after refactor:** After changing to `maxOperandByOperator`, any stale reference to `difficulty.maxOperand` becomes `undefined`. Search for all usages before shipping.
- **Retry loops for division:** Do not generate `a` and `b` randomly and retry if `a % b !== 0`. The quotient-first approach eliminates this entirely.
- **Checking tutorial after problem is generated:** The tutorial check must happen *before* operands are assigned, not after. Otherwise a problem flashes before the overlay appears.
- **Zero as divisor:** `generateProblem()` already excludes zero divisors by design (minimum divisor 2 per Claude's discretion recommendation), but the guard must be explicit.
- **Touching `checkAnswer()` for zero hint logic:** Zero hint is display-only, derived from the problem state via `computed`. It must not affect answer evaluation.
- **Mixing per-operator and shared history windows:** Keep one shared history for simplicity. Only `maxOperandByOperator[currentOperator]` is updated per difficulty cycle.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Integer division guarantee | Retry-loop (random a, b, check a%b===0) | Quotient-first generation | No loops, no infinite retry risk, deterministic |
| Tutorial animation sequencing | Custom animation library | CSS transitions + step ref | App already uses `setTimeout` chains (LevelUpModal pattern); same approach is idiomatic here |
| Speech bubble UI | Custom floating component | Extend MascotPanel with conditional text + Tailwind | Speech bubble is just positioned text; the character panel already exists |
| localStorage read/write | Custom wrapper | Existing `getStorage`/`setStorage` in `useMathGame.js` | Already handles try/catch, type coercion |
| Overlay fade transition | Custom CSS | Vue `<Transition name="fade">` | Already defined in `App.vue` — `.fade-enter-active`, `.fade-leave-active` classes exist |

**Key insight:** The codebase uses no abstraction layers beyond Vue's own reactivity. Every "feature" is a ref + a function + a watcher — follow that pattern exactly.

---

## Common Pitfalls

### Pitfall 1: Old emma-maxOperand Key Conflicts

**What goes wrong:** If `resetGame()` still writes `emma-maxOperand` after the refactor, or if old localStorage data from before phase 2 is present, `getStorage('emma-maxOperand', 5)` will succeed and shadow the new per-operator keys on re-initialization.
**Why it happens:** The old key persists in the user's browser storage after the code change.
**How to avoid:** Remove all reads/writes of `emma-maxOperand` in the refactored code. In `resetGame()`, explicitly clear all four per-operator keys. Do not attempt to migrate the old value — reset to defaults is safe for a children's game.
**Warning signs:** Difficulty for `+` and `-` appears frozen at 5 after a session that had an old `emma-maxOperand` value.

### Pitfall 2: Tutorial Fires at Wrong Time

**What goes wrong:** Tutorial overlay appears mid-game (after a problem is already shown), or fails to appear on the very first level-3 problem.
**Why it happens:** The tutorial check is placed after operands are assigned in `generateProblem()`, or is checked in `checkAnswer()` instead of `generateProblem()`.
**How to avoid:** `checkOperatorUnlock()` is the first thing called in `generateProblem()`. If it returns `true`, return immediately without assigning operands. Problem is generated only after `dismissTutorial()` is called.
**Warning signs:** ChallengeZone briefly shows numbers before the tutorial overlay renders.

### Pitfall 3: showTutorial Blocks generateProblem After Every Level-Up

**What goes wrong:** Every time the player passes level 3 (e.g., after a resetGame that lands them at level 3 again), the tutorial fires again even though it was already seen.
**Why it happens:** Tutorial gate checks `level.value >= 3` but forgets to check `emma-tutorial-multiply-seen`.
**How to avoid:** The `getStorageBool()` check is always paired with the level check. The localStorage flag is the primary guard; the level is just the trigger context.
**Warning signs:** Tutorial overlay appears every time level 3 is reached, not once per install.

### Pitfall 4: Division Answer Overflow for 6-Year-Old

**What goes wrong:** `maxOperandByOperator['÷']` grows (ZPD), and a problem like `90 ÷ 9 = 10` appears — the answer `10` is 2 digits, which the NumberPad handles, but `81 ÷ 9 = 9` is fine and easy. The real concern is the dividend becoming very large (e.g., `10 × 10 = 100` means a 3-digit number in the display).
**Why it happens:** At max divisor=10 and quotient=10, `a = 100`. ChallengeZone must display `100`.
**How to avoid:** `ChallengeZone` already receives `num1` as a prop and renders it — 3-digit numbers display fine. `appendDigit()` already caps at 3 digits. This is not a bug but should be confirmed as acceptable UX.
**Warning signs:** No warning signs — this is by design and within accepted constraints (D-05: max 10×10=100).

### Pitfall 5: Zero Hint for Division with a=0

**What goes wrong:** The problem `0 ÷ b = ?` (dividend is 0, quotient is 0) violates D-08 (quotient never 0). But D-09 says zero *is* allowed as an operand.
**Why it happens:** If `×` uses `Math.random() * (max + 1)` starting from 0, the product can be 0. But for `÷`, the quotient-first approach ensures quotient >= 1, so dividend = divisor × quotient >= 1. Zero in the dividend position is structurally impossible in the quotient-first approach.
**How to avoid:** Quotient-first generation already prevents this. The `zeroHint` computed for `÷` with `a === 0` is dead code if division generation is correct — add it anyway as documentation but it will never fire.
**Warning signs:** If `a === 0` ever appears for `÷`, the generation logic has a bug.

### Pitfall 6: App.vue Overlay Priority / z-layer Conflicts

**What goes wrong:** `OperatorTutorialOverlay` renders at the same time as `LevelIntroModal` or `LevelVictoryModal`, causing two overlays to stack.
**Why it happens:** Tutorial fires when level threshold is crossed, which is also when level intro fires.
**How to avoid:** The tutorial fires after the level intro is dismissed (not simultaneously). In `onLevelIntroStart()` in `App.vue`, after hiding the level intro, check if an operator tutorial is pending before calling `generateProblem()`. The tutorial check inside `generateProblem()` handles this naturally — it returns early without generating a problem, showing the tutorial instead. The sequencing is: LevelVictory → LevelIntro → (dismiss) → generateProblem() → tutorial check → tutorial overlay → (dismiss) → problem served.
**Warning signs:** Both overlays visible at once.

---

## Code Examples

Verified patterns from codebase analysis:

### Existing getStorage / setStorage Pattern (reuse verbatim)

```js
// Source: src/composables/useMathGame.js lines 10-25
function getStorage (key, fallback) {
  try {
    const val = localStorage.getItem(key)
    return val !== null ? Number(val) : fallback
  } catch {
    return fallback
  }
}

function setStorage (key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage unavailable (private browsing, quota exceeded)
  }
}
```

### Existing Vue Transition Fade Pattern (reuse in OperatorTutorialOverlay)

```vue
<!-- Source: src/App.vue — fade transition already defined -->
<Transition name="fade">
  <OperatorTutorialOverlay
    v-if="showTutorial"
    :operator="tutorialOperator"
    @done="dismissTutorial"
  />
</Transition>
```

The `.fade-enter-active / .fade-leave-active` classes are already globally defined via Vue's Transition convention used throughout `App.vue`.

### Existing Overlay Structure (template for OperatorTutorialOverlay)

```vue
<!-- Source: src/components/CharacterSelect.vue line 65 -->
<div class="fixed inset-0 z-[200] bg-sky flex justify-center items-center p-4">
  <!-- content -->
</div>
```

For `OperatorTutorialOverlay`, use `bg-dark/90` instead of `bg-sky` for a darker modal feel.

### Existing setTimeout Chain Pattern (template for tutorial step sequencing)

```js
// Source: src/components/LevelIntroModal.vue lines 54-57
timers.push(setTimeout(() => { ready.value     = true  }, 80))
timers.push(setTimeout(() => { showEnemy.value = true  }, 300))
timers.push(setTimeout(() => { showText.value  = true  }, 700))
timers.push(setTimeout(() => { showBtn.value   = true  }, 1300))
```

Use this same `timers` + `clearTimers()` pattern for tutorial step auto-advance (if any steps auto-advance) or for the zero-hint auto-dismiss timer.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Shared `difficulty.maxOperand` (one number) | `maxOperandByOperator` (object per operator) | Phase 2 | All references to `difficulty.maxOperand` must be updated |
| `ops = ['+', '-']` (hardcoded) | Dynamic ops array based on `level.value` | Phase 2 | Operator set is runtime-determined |
| `correctAnswer` handles `+` and `-` only | `+`, `-`, `×`, `÷` all handled | Phase 2 | No division-by-zero risk because quotient-first ensures b >= 2 |
| `localStorage` has single `emma-maxOperand` | Four per-operator keys: `emma-maxOperand-add/subtract/multiply/divide` | Phase 2 | Old key becomes orphaned; new keys initialized on first load |

**Deprecated/outdated after Phase 2:**
- `difficulty.maxOperand` (the scalar property): removed, replaced by `difficulty.maxOperandByOperator`
- localStorage key `emma-maxOperand`: no longer written or read (orphaned in existing browsers, harmless)

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The `level` ref in `useMathGame.js` already reflects the correct current level at `generateProblem()` call time | Architecture Patterns / Pattern 2 | If level updates asynchronously after problem generation, newly unlocked operators won't appear until the next call |
| A2 | `MascotPanel.vue` can be extended with a speech bubble prop without restructuring the component | Pattern 7 | If MascotPanel's layout constrains the bubble position, the zero-hint may need an alternative mount point |
| A3 | The existing `.fade-enter-active` / `.fade-leave-active` CSS is defined globally (not scoped) and applies to all `<Transition name="fade">` | Code Examples | If it's only locally scoped, `OperatorTutorialOverlay` needs its own transition styles |

**A1 verification:** The `level` ref is initialized from localStorage at composable init and updated synchronously in `checkAnswer()` (lines 144–148 of useMathGame.js). Since `generateProblem()` is called *after* `checkAnswer()` completes (via `setTimeout` in `App.vue`), `level.value` is always current. [VERIFIED: useMathGame.js code inspection]

**A2 verification:** MascotPanel.vue is a simple `<aside>` with an image and an emoji fallback. No complex layout that would block a speech bubble overlay. [VERIFIED: MascotPanel.vue code inspection]

**A3 verification:** The fade transition is used in `App.vue` template wrapping `<CharacterSelect>` and `<ShopOverlay>`. Vue `<Transition name="fade">` generates `.fade-enter-active` etc. classes that are injected onto the child element — they work regardless of where the CSS rule lives, as long as the class is defined somewhere in the global stylesheet. However, no explicit `.fade-enter-active` rule was found in `style.css` during inspection — it may be relying on Vue's default (which has no CSS, only class toggling). [ASSUMED] — confirm the fade transition has visible CSS defined, or add it to `style.css`.

---

## Open Questions (RESOLVED)

1. **Does the existing `fade` Transition have CSS rules defined?**
   - What we know: `<Transition name="fade">` is used in `App.vue` for `CharacterSelect` and `ShopOverlay`.
   - What's unclear: No `.fade-enter-active` rule was found in `style.css` during inspection. The transition may rely on implicit Vue behavior (adding/removing classes without CSS, making it instant) or the rule may be inline in a component's `<style>` block.
   - Recommendation: Add explicit `.fade-enter-active { transition: opacity 0.3s ease; }` and `.fade-leave-active { transition: opacity 0.2s ease; }` to `style.css` in Wave 0 to ensure the overlay fades visibly for `OperatorTutorialOverlay`.
   - RESOLVED: No global `.fade-enter-active` CSS rule exists. `OperatorTutorialOverlay.vue` uses `name="tutorial-fade"` with a `<style scoped>` block defining its own transition rules. Plans implement this correctly.

2. **Should `adjustDifficulty()` use a per-operator history window?**
   - What we know: Currently one shared 10-answer history. With 2–4 operators unlocked, the history mixes operators, so signal for any single operator arrives slowly.
   - What's unclear: Whether this matters for a 6-year-old's session (sessions may be short enough that per-operator history is an over-optimization).
   - Recommendation: Keep the shared history window for Phase 2. If the child experiences stagnant difficulty on one operator, revisit in a later phase.
   - RESOLVED: Shared history window retained. Plans implement one shared `difficulty.history` window; only `maxOperandByOperator[currentOperator]` is updated per difficulty cycle.

3. **What is the visual appearance of the zero-hint speech bubble?**
   - What we know: MascotPanel.vue has no existing speech bubble — the feedback state (`'correct'`/`'wrong'`) only animates the character image (scale up, shake).
   - What's unclear: Whether the speech bubble should appear inside MascotPanel's `<aside>` or be positioned relative to the character from a different parent element.
   - Recommendation: Add a `zeroHint` prop to MascotPanel; render a `<div>` with absolute positioning above the character sprite, using Tailwind classes. The `<aside>` has `relative` positioning available via adding it as a class.
   - RESOLVED: Speech bubble implemented directly in `ChallengeZone.vue` (MascotPanel is not in the render tree). Absolute-positioned `<div>` with Tailwind classes above the character sprite; 3s `setTimeout` auto-dismiss via `watch` on `zeroHint`.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 2 is purely in-app code changes to an existing Vue 3 SPA. No CLI tools, external services, databases, or runtimes beyond what is already installed are needed.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed [VERIFIED: package.json has no vitest/jest] |
| Config file | None — see Wave 0 |
| Quick run command | `npx vitest run --reporter=verbose` (after Wave 0 install) |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MATH-01 | Multiplication appears only at level >= 3 | unit | `npx vitest run tests/useMathGame.test.js` | Wave 0 |
| MATH-02 | Division appears only at level >= 5 | unit | `npx vitest run tests/useMathGame.test.js` | Wave 0 |
| MATH-02 | Division always produces whole-number answer | unit | `npx vitest run tests/useMathGame.test.js` | Wave 0 |
| MATH-03 | Per-operator maxOperand adjusts independently | unit | `npx vitest run tests/useMathGame.test.js` | Wave 0 |
| MATH-03 | × maxOperand caps at 10; + caps at 20 | unit | `npx vitest run tests/useMathGame.test.js` | Wave 0 |
| D-08 | Divisor never 0; quotient never 0 | unit | `npx vitest run tests/useMathGame.test.js` | Wave 0 |
| D-14 | Tutorial localStorage flag prevents re-firing | unit | `npx vitest run tests/useMathGame.test.js` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/useMathGame.test.js`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `tests/useMathGame.test.js` — covers all MATH-01, MATH-02, MATH-03, D-08, D-14
- [ ] Framework install: `npm install --save-dev vitest @vue/test-utils jsdom`
- [ ] `vite.config.js` — add `test: { environment: 'jsdom' }` to Vite config (Vitest reads from same file)

---

## Security Domain

### Applicable ASVS Categories (Level 1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes (minor) | Answer is parsed via `Number(answer.value)` — non-numeric input coerces to `NaN`, which never equals `correctAnswer`, so wrong-answer branch fires safely |
| V6 Cryptography | no | — |

### Known Threat Patterns for this Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| localStorage tampering (stars/level manipulation) | Tampering | Out of scope — this is a single-player children's game with no server; localStorage manipulation is a non-threat in this context |
| XSS via hint text | Tampering | Hint text is hardcoded string literals in composable, not user input — no risk |

**Security assessment:** No new security surface introduced by Phase 2. All changes are internal composable logic and UI components. No network calls, no user-supplied strings rendered as HTML.

---

## Sources

### Primary (HIGH confidence)
- `src/composables/useMathGame.js` — full code inspection, all function signatures and data structures verified
- `src/App.vue` — full code inspection, all composable wiring and overlay patterns verified
- `src/components/CharacterSelect.vue` — overlay pattern verified (fixed inset-0, z-[200])
- `src/components/LevelIntroModal.vue` — setTimeout chain pattern, `defineProps` extension point verified
- `src/components/MascotPanel.vue` — layout and props verified, speech bubble extension point identified
- `package.json` — all dependency versions verified

### Secondary (MEDIUM confidence)
- `.planning/codebase/ARCHITECTURE.md` — codebase analysis from 2026-04-14, consistent with code inspection
- `.planning/codebase/CONVENTIONS.md` — naming and style conventions, consistent with code inspection
- `.planning/codebase/STRUCTURE.md` — file placement conventions, consistent with code inspection

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies verified from package.json and direct code inspection
- Architecture: HIGH — full source code of all files-to-modify was inspected; data flow is unambiguous
- Pitfalls: HIGH — derived from direct code reading, not web search; specific line numbers cited
- Test strategy: MEDIUM — Vitest is not yet installed; test patterns are standard for Vue 3 composables but not verified against this specific codebase

**Research date:** 2026-04-20
**Valid until:** 2026-05-20 (stable SPA codebase; no fast-moving external dependencies)
