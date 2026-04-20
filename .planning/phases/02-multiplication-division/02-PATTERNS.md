# Phase 2: Multiplication & Division - Pattern Map

**Mapped:** 2026-04-20
**Files analyzed:** 5 (1 new, 4 modified)
**Analogs found:** 5 / 5

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/composables/useMathGame.js` | composable (extend) | CRUD + event-driven | itself — direct modification | exact |
| `src/components/OperatorTutorialOverlay.vue` | component (new overlay) | event-driven | `src/components/LevelIntroModal.vue` | exact role+pattern |
| `src/components/LevelIntroModal.vue` | component (extend) | request-response | itself — additive prop | exact |
| `src/components/MascotPanel.vue` | component (extend) | request-response | itself — additive prop + speech bubble | exact |
| `src/App.vue` | orchestrator (extend) | request-response | itself — wire new refs + props | exact |

---

## Pattern Assignments

### `src/composables/useMathGame.js` (composable, CRUD + event-driven)

**Analog:** itself (direct modification)

**Imports pattern** (`useMathGame.js` lines 1):
```js
import { ref, computed, reactive } from 'vue'
```
No changes to imports needed for Phase 2 — all required Vue primitives are already imported.

**localStorage helper pattern** (`useMathGame.js` lines 10-25) — reuse verbatim for all new keys:
```js
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
Note: `getStorage` coerces to `Number`. For boolean tutorial flags, add a `getStorageBool` helper that returns `!!localStorage.getItem(key)` (no coercion needed) — follow the same try/catch structure.

**Reactive state pattern** (`useMathGame.js` lines 28-58) — extend `difficulty` reactive object and add new refs:
```js
// EXISTING pattern for reactive state blocks — follow exact spacing/comment style:
/* ── Score & Streak ─────────────────────────────────────────── */
const stars      = ref(getStorage('emma-stars', 0))
const streak     = ref(getStorage('emma-streak', 0))
const level      = ref(getStorage('emma-level', 1))

// BEFORE (lines 55-59):
const difficulty = reactive({
  maxOperand:  getStorage('emma-maxOperand', 5),
  history:     [],
  historySize: 10,
})

// AFTER — replace maxOperand scalar with per-operator object:
const difficulty = reactive({
  maxOperandByOperator: {
    '+': getStorage('emma-maxOperand-add',      10),
    '-': getStorage('emma-maxOperand-subtract', 10),
    '×': getStorage('emma-maxOperand-multiply',  3),
    '÷': getStorage('emma-maxOperand-divide',    3),
  },
  history:     [],
  historySize: 10,
})

// NEW refs — follow the showLevelIntro / pendingLevel naming pattern (lines 41-42):
const showTutorial     = ref(false)
const tutorialOperator = ref(null)   // '×' | '÷' | null
```

**adjustDifficulty pattern** (`useMathGame.js` lines 68-78) — extend to per-operator; follow exact conditional structure:
```js
// EXISTING (lines 68-78):
function adjustDifficulty () {
  if (difficulty.history.length < 5) return

  if (successRate.value >= 0.9 && difficulty.maxOperand < 20) {
    difficulty.maxOperand = Math.min(difficulty.maxOperand + 1, 20)
    setStorage('emma-maxOperand', difficulty.maxOperand)
  } else if (successRate.value < 0.6 && difficulty.maxOperand > 3) {
    difficulty.maxOperand = Math.max(difficulty.maxOperand - 1, 3)
    setStorage('emma-maxOperand', difficulty.maxOperand)
  }
}

// AFTER — same conditional structure, per-operator:
function operatorKey (op) {
  return { '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide' }[op]
}

function adjustDifficulty () {
  if (difficulty.history.length < 5) return
  const op  = currentProblem.operator
  const cap   = (op === '×' || op === '÷') ? 10 : 20
  const floor = 3

  if (successRate.value >= 0.9 && difficulty.maxOperandByOperator[op] < cap) {
    difficulty.maxOperandByOperator[op] = Math.min(difficulty.maxOperandByOperator[op] + 1, cap)
    setStorage(`emma-maxOperand-${operatorKey(op)}`, difficulty.maxOperandByOperator[op])
  } else if (successRate.value < 0.6 && difficulty.maxOperandByOperator[op] > floor) {
    difficulty.maxOperandByOperator[op] = Math.max(difficulty.maxOperandByOperator[op] - 1, floor)
    setStorage(`emma-maxOperand-${operatorKey(op)}`, difficulty.maxOperandByOperator[op])
  }
}
```

**correctAnswer computed pattern** (`useMathGame.js` lines 81-84) — add two branches:
```js
// EXISTING (lines 81-84):
const correctAnswer = computed(() => {
  if (currentProblem.operator === '+') return currentProblem.a + currentProblem.b
  return currentProblem.a - currentProblem.b
})

// AFTER — add × and ÷ branches before the default fallback:
const correctAnswer = computed(() => {
  if (currentProblem.operator === '+') return currentProblem.a + currentProblem.b
  if (currentProblem.operator === '-') return currentProblem.a - currentProblem.b
  if (currentProblem.operator === '×') return currentProblem.a * currentProblem.b
  if (currentProblem.operator === '÷') return currentProblem.a / currentProblem.b  // integer by construction
  return 0
})
```

**generateProblem pattern** (`useMathGame.js` lines 87-106) — extend the ops array, swap `difficulty.maxOperand` → `difficulty.maxOperandByOperator[op]`, add quotient-first division, add tutorial gate at top:
```js
// EXISTING ops array + max (lines 88-90):
const ops = ['+', '-']
currentProblem.operator = ops[Math.floor(Math.random() * ops.length)]
const max = difficulty.maxOperand

// AFTER — dynamic ops gate + per-operator max + tutorial check:
function generateProblem () {
  // Tutorial gate: must run BEFORE any operands are assigned
  if (checkOperatorUnlock()) return   // early return — overlay now showing

  const ops = ['+', '-']
  if (level.value >= 3) ops.push('×')
  if (level.value >= 5) ops.push('÷')

  currentProblem.operator = ops[Math.floor(Math.random() * ops.length)]
  const max = difficulty.maxOperandByOperator[currentProblem.operator]

  if (currentProblem.operator === '+') {
    currentProblem.a = Math.floor(Math.random() * max) + 1
    currentProblem.b = Math.floor(Math.random() * max) + 1
  } else if (currentProblem.operator === '-') {
    // Constraint: a >= b to avoid negative results
    const a = Math.floor(Math.random() * max) + 1
    const b = Math.floor(Math.random() * (a + 1))
    currentProblem.a = a
    currentProblem.b = b
  } else if (currentProblem.operator === '×') {
    currentProblem.a = Math.floor(Math.random() * (max + 1))  // 0..max (zero allowed)
    currentProblem.b = Math.floor(Math.random() * (max + 1))
  } else if (currentProblem.operator === '÷') {
    // Quotient-first: guarantees clean integer result, no retry loop
    const divisor  = Math.floor(Math.random() * (max - 1)) + 2  // 2..max (min 2)
    const quotient = Math.floor(Math.random() * max) + 1         // 1..max
    currentProblem.a = divisor * quotient  // dividend
    currentProblem.b = divisor             // divisor shown to child
  }

  answer.value   = ''
  feedback.value = ''
  problemKey.value++
}
```

**Tutorial state machine pattern** — follow the `showLevelIntro`/`pendingLevel` pattern (lines 41-42, 148-152):
```js
// NEW helpers following getStorage / setStorage try/catch convention:
function getStorageBool (key) {
  try { return !!localStorage.getItem(key) } catch { return false }
}

function checkOperatorUnlock () {
  if (level.value >= 3 && !getStorageBool('emma-tutorial-multiply-seen')) {
    tutorialOperator.value = '×'
    showTutorial.value     = true
    return true   // caller returns early — no problem generated yet
  }
  if (level.value >= 5 && !getStorageBool('emma-tutorial-divide-seen')) {
    tutorialOperator.value = '÷'
    showTutorial.value     = true
    return true
  }
  return false
}

function dismissTutorial () {
  if (tutorialOperator.value === '×') setStorage('emma-tutorial-multiply-seen', '1')
  else if (tutorialOperator.value === '÷') setStorage('emma-tutorial-divide-seen', '1')
  showTutorial.value     = false
  tutorialOperator.value = null
  generateProblem()
}
```

**zeroHint computed pattern** — follows `correctAnswer` computed style (lines 81-84):
```js
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

**resetGame pattern** (`useMathGame.js` lines 190-210) — remove old key, clear all four per-operator keys:
```js
// EXISTING sets (lines 200-208):
difficulty.maxOperand = 5
setStorage('emma-maxOperand', 5)

// AFTER — replace with per-operator resets:
difficulty.maxOperandByOperator['+'] = 10
difficulty.maxOperandByOperator['-'] = 10
difficulty.maxOperandByOperator['×'] = 3
difficulty.maxOperandByOperator['÷'] = 3
difficulty.history = []
setStorage('emma-maxOperand-add',      10)
setStorage('emma-maxOperand-subtract', 10)
setStorage('emma-maxOperand-multiply', 3)
setStorage('emma-maxOperand-divide',   3)
// Also reset tutorial flags on full reset:
setStorage('emma-tutorial-multiply-seen', '')
setStorage('emma-tutorial-divide-seen',   '')
```

**return object pattern** (`useMathGame.js` lines 217-245) — add new refs and function following the flat return structure:
```js
// Append to existing return object — follow exact indentation/grouping:
return {
  // ... all existing exports ...

  // New Phase 2 exports:
  showTutorial,
  tutorialOperator,
  zeroHint,
  dismissTutorial,
}
```

---

### `src/components/OperatorTutorialOverlay.vue` (component, event-driven) — NEW FILE

**Analog:** `src/components/LevelIntroModal.vue`

**Script setup / defineProps / defineEmits pattern** (`LevelIntroModal.vue` lines 1-33) — copy structure exactly:
```vue
<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  show:     { type: Boolean, default: false },
  operator: { type: String,  default: null  },   // '×' | '÷'
})

const emit = defineEmits(['done'])
</script>
```

**Animation timer pattern** (`LevelIntroModal.vue` lines 36-57) — copy `timers` + `clearTimers()` + `startAnimation()` pattern verbatim; adapt phase names:
```js
const step       = ref(0)    // which tutorial step is active (0-indexed)
const showDots   = ref(false)
const showEquation = ref(false)
let timers = []

function clearTimers () {
  timers.forEach(clearTimeout)
  timers = []
}

function startTutorial () {
  step.value         = 0
  showDots.value     = false
  showEquation.value = false
  clearTimers()

  timers.push(setTimeout(() => { showDots.value     = true }, 300))
  timers.push(setTimeout(() => { showEquation.value = true }, 900))
}

// Tap-to-proceed: advance step; emit 'done' on final step
function onTap () {
  if (step.value < maxStep) {
    step.value++
  } else {
    emit('done')
  }
}
```

**watch / onMounted / onUnmounted pattern** (`LevelIntroModal.vue` lines 64-77) — copy exactly:
```js
watch(() => props.show, (val) => {
  if (val) startTutorial()
  else clearTimers()
})

onMounted(() => {
  if (props.show) startTutorial()
})

onUnmounted(() => {
  clearTimers()
})
```

**Overlay template pattern** (`CharacterSelect.vue` line 65, `LevelIntroModal.vue` lines 98-128) — use fixed inset-0 z-[200] with scoped transition; note: use a scoped transition name (not `fade`) since no global `.fade-enter-active` CSS exists:
```vue
<template>
  <Transition name="tutorial-fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[200] bg-dark/90 flex flex-col items-center justify-center p-6"
      @click="onTap"
    >
      <!-- Step content area -->
      <!-- TAP TO CONTINUE hint -->
    </div>
  </Transition>
</template>

<style scoped>
.tutorial-fade-enter-active { transition: opacity 0.35s ease; }
.tutorial-fade-leave-active { transition: opacity 0.25s ease; }
.tutorial-fade-enter-from,
.tutorial-fade-leave-to     { opacity: 0; }
</style>
```
**Critical note:** No global `.fade-enter-active` rule exists in `src/style.css` — each overlay must define its own scoped transition CSS, as `LevelIntroModal` does with `.intro-fade-*` and `LevelUpModal` does with `.scene-fade-*`. Do NOT use `name="fade"` without adding global CSS first (see Shared Patterns section).

**Dot-grid rendering pattern** — use inline `<span>` circles; follow Tailwind utility-class convention throughout the codebase:
```vue
<!-- Repeated-addition visual for × : groups of dots -->
<div class="flex flex-col gap-2">
  <div
    v-for="group in groups"
    :key="group"
    class="flex gap-1"
  >
    <span
      v-for="dot in dotsPerGroup"
      :key="dot"
      class="w-4 h-4 rounded-full bg-star-gold border border-dark/30"
    />
  </div>
</div>
```

---

### `src/components/LevelIntroModal.vue` (component, request-response) — EXTEND

**Analog:** itself

**defineProps extension pattern** (`LevelIntroModal.vue` lines 26-31) — add one new optional prop following existing style (aligned spacing, explicit type and default):
```js
// EXISTING:
const props = defineProps({
  show:    { type: Boolean, default: false },
  level:   { type: Number,  default: 1     },
  theme:   { type: Object,  default: () => ({}) },
  isMuted: { type: Boolean, default: false  },
})

// AFTER — append new prop:
const props = defineProps({
  show:             { type: Boolean, default: false      },
  level:            { type: Number,  default: 1          },
  theme:            { type: Object,  default: () => ({}) },
  isMuted:          { type: Boolean, default: false      },
  unlockedOperator: { type: String,  default: null       },  // NEW: '×' | '÷' | null
})
```

**Template extension pattern** (`LevelIntroModal.vue` lines 114-125) — add conditional `<p>` inside the content overlay div, after the "LET'S GO!" button area; use `v-if` on the new prop:
```vue
<!-- Inside the content overlay div, after showBtn button -->
<p
  v-if="unlockedOperator && showText"
  class="unlock-announce text-center font-black text-star-gold text-xl mt-4 pop-in"
>
  New move unlocked: {{ unlockedOperator }}!
</p>
```
The `.pop-in` animation class is globally defined in `src/style.css` line 284 — no new CSS needed.

---

### `src/components/MascotPanel.vue` (component, request-response) — EXTEND

**Analog:** itself

**defineProps extension pattern** (`MascotPanel.vue` lines 2-6) — add `zeroHint` prop:
```js
// EXISTING:
defineProps({
  feedback:   { type: String, default: '' },
  character:  { type: Object, required: true },
  variantSrc: { type: String, default: null },
})

// AFTER:
defineProps({
  feedback:   { type: String, default: '' },
  character:  { type: Object, required: true },
  variantSrc: { type: String, default: null },
  zeroHint:   { type: String, default: ''   },  // NEW: hint text or empty string
})
```

**Speech bubble pattern** — the `<aside>` already has a `relative` wrapping `<div>` at line 15. Add the bubble as a sibling to the character image div, using absolute positioning above the sprite. Follow Tailwind-only styling convention (no new scoped CSS needed for the bubble itself):
```vue
<!-- Add inside <aside>, after the character image wrapper div -->
<Transition name="bubble-fade">
  <div
    v-if="showBubble && zeroHint"
    class="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full
           bg-mushroom-white border-2 border-dark/30 rounded-2xl rounded-bl-sm
           px-3 py-2 text-xs font-bold text-dark text-center w-32 shadow-md z-30"
  >
    {{ zeroHint }}
    <!-- Bubble tail -->
    <span class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full
                 border-8 border-transparent border-t-mushroom-white" />
  </div>
</Transition>
```

**watch-based auto-dismiss pattern** — follow the `watch(() => props.show, ...)` pattern from `LevelIntroModal.vue` line 64; use a local `showBubble` ref and a single `setTimeout`:
```js
import { ref, watch } from 'vue'

const props = defineProps({ /* ... */ })

const showBubble = ref(false)
let bubbleTimer = null

watch(() => props.zeroHint, (hint) => {
  if (hint) {
    showBubble.value = true
    clearTimeout(bubbleTimer)
    bubbleTimer = setTimeout(() => { showBubble.value = false }, 3000)
  } else {
    showBubble.value = false
  }
})
```

**Scoped transition for bubble** — add to `<style scoped>` block (MascotPanel currently has no style block; add one):
```vue
<style scoped>
.bubble-fade-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.bubble-fade-leave-active { transition: opacity 0.2s ease, transform 0.15s ease; }
.bubble-fade-enter-from,
.bubble-fade-leave-to     { opacity: 0; transform: translateX(-50%) translateY(calc(-100% - 4px)) scale(0.9); }
</style>
```

---

### `src/App.vue` (orchestrator, request-response) — EXTEND

**Analog:** itself

**Composable destructuring pattern** (`App.vue` lines 20-28) — add new exports from `useMathGame`:
```js
// EXISTING destructure (lines 20-28):
const {
  stars, problemKey,
  currentProblem, answer, feedback,
  difficulty, showLevelUp,
  showLevelVictory, completedLevel,
  showLevelIntro, pendingLevel,
  generateProblem, checkAnswer, clearFeedback,
  appendDigit, backspace, resetGame,
} = useMathGame()

// AFTER — append new exports:
const {
  stars, problemKey,
  currentProblem, answer, feedback,
  difficulty, showLevelUp,
  showLevelVictory, completedLevel,
  showLevelIntro, pendingLevel,
  showTutorial, tutorialOperator,   // NEW
  zeroHint,                         // NEW
  generateProblem, checkAnswer, clearFeedback,
  appendDigit, backspace, resetGame,
  dismissTutorial,                  // NEW
} = useMathGame()
```

**Component import pattern** (`App.vue` lines 1-9) — add new import following PascalCase file naming and relative path convention:
```js
import OperatorTutorialOverlay from './components/OperatorTutorialOverlay.vue'
```

**unlockedOperator computed pattern** — follow `currentTheme` computed style (`App.vue` lines 74-76); place near other level-derived computeds:
```js
// NEW — follows same computed pattern as currentTheme / victoryTheme:
const unlockedOperator = computed(() => {
  if (pendingLevel.value === 3) return '×'
  if (pendingLevel.value === 5) return '÷'
  return null
})
```

**Overlay wiring pattern** (`App.vue` lines 169-217) — insert `OperatorTutorialOverlay` following the `LevelIntroModal` pattern; place it after `LevelIntroModal` in template order (z-layer stacking is safe because they never show simultaneously):
```vue
<!-- After the LevelIntroModal block in template: -->
<OperatorTutorialOverlay
  v-if="selectedCharacter"
  :show="showTutorial"
  :operator="tutorialOperator"
  @done="dismissTutorial"
/>
```
Note: No `<Transition name="fade">` wrapper — the overlay handles its own scoped transition internally.

**Prop-passing pattern for extended components** — follow the existing `:is-muted="isMuted"` kebab-case prop binding style:
```vue
<!-- LevelIntroModal — add unlocked-operator prop: -->
<LevelIntroModal
  v-if="selectedCharacter"
  :show="showLevelIntro"
  :level="pendingLevel"
  :theme="currentTheme"
  :is-muted="isMuted"
  :unlocked-operator="unlockedOperator"
  @start="onLevelIntroStart"
/>

<!-- ChallengeZone already receives character and variant-src — no change needed -->
<!-- MascotPanel is rendered inside ChallengeZone, not directly in App.vue -->
```

**MascotPanel wiring note:** `MascotPanel` is a child of `ChallengeZone`, not a direct child of `App.vue`. Check `ChallengeZone.vue` to confirm the prop threading path: `App.vue` → `ChallengeZone` `:zero-hint="zeroHint"` → `MascotPanel` `:zero-hint="zeroHint"`. Read `ChallengeZone.vue` before implementing to confirm the exact prop pass-through required.

---

## Shared Patterns

### Timer/setTimeout Chain (all animated components)
**Source:** `src/components/LevelIntroModal.vue` lines 36-57 and `src/components/LevelUpModal.vue` lines 31-52
**Apply to:** `OperatorTutorialOverlay.vue` (tutorial step sequencing), `MascotPanel.vue` (zero hint auto-dismiss)
```js
let timers = []

function clearTimers () {
  timers.forEach(clearTimeout)
  timers = []
}

// Usage — stagger reveal phases:
timers.push(setTimeout(() => { phase1.value = true }, 80))
timers.push(setTimeout(() => { phase2.value = true }, 300))

// Always clear in onUnmounted:
onUnmounted(() => { clearTimers() })
```

### Scoped Overlay Transition (all full-screen overlays)
**Source:** `src/components/LevelIntroModal.vue` lines 131-135 and `src/components/LevelUpModal.vue` lines 177-179
**Apply to:** `OperatorTutorialOverlay.vue`
**Critical context:** No global `.fade-enter-active` CSS rule exists in `src/style.css`. Every overlay in this codebase defines its OWN named scoped transition. Do not use `name="fade"` — use a unique name (e.g., `name="tutorial-fade"`) and define the CSS in `<style scoped>`.
```vue
<Transition name="tutorial-fade">
  <div v-if="show" class="fixed inset-0 z-[200] ...">...</div>
</Transition>

<style scoped>
.tutorial-fade-enter-active { transition: opacity 0.35s ease; }
.tutorial-fade-leave-active { transition: opacity 0.25s ease; }
.tutorial-fade-enter-from,
.tutorial-fade-leave-to     { opacity: 0; }
</style>
```

### defineProps Object Syntax (all components)
**Source:** `src/components/LevelIntroModal.vue` lines 26-31, `src/components/MascotPanel.vue` lines 2-6
**Apply to:** All components being extended and `OperatorTutorialOverlay.vue`
```js
// Always use object syntax with explicit type and default/required — never shorthand array syntax:
defineProps({
  propName: { type: Type, default: defaultValue },
  required: { type: Type, required: true },
})
```

### localStorage Persistence (composable only)
**Source:** `src/composables/useMathGame.js` lines 10-25
**Apply to:** All new localStorage keys in `useMathGame.js` (`emma-maxOperand-*`, `emma-tutorial-*-seen`)
- All reads use `getStorage(key, fallback)` — coerces to Number. For boolean flags, add `getStorageBool` with try/catch but no coercion.
- All writes use `setStorage(key, value)` — wrapped in try/catch.
- Key prefix: always `emma-` (established project convention, decision D-06).

### Global Animation Classes (no new keyframes needed)
**Source:** `src/style.css` lines 283-286 (`.pop-in`), 265-267 (`.roll-in`), 157-165 (`.animate-float`), 201-208 (`.shake`)
**Apply to:** `OperatorTutorialOverlay.vue` (dot animations), `LevelIntroModal.vue` (unlock announcement text)
```css
/* Available globally — use directly as class names in templates: */
.pop-in        /* scale from 0.6→1.08→1, good for appearing elements */
.roll-in       /* translateY from -100%→0, good for number reveals */
.animate-float /* gentle 3s bob, good for character sprites */
.shake         /* horizontal shake, used for wrong answers */
.pulse-glow    /* gold glow pulse */
.rainbow-shimmer /* hue-rotate shimmer */
```

### Tailwind Color Tokens (dot grids and new UI)
**Source:** `src/style.css` lines 11-62 (`@theme` block)
**Apply to:** `OperatorTutorialOverlay.vue` dot grid, speech bubble in `MascotPanel.vue`
```
bg-star-gold        → #FFD700  (dot fill color)
bg-mushroom-white   → #FFF8F0  (speech bubble background)
bg-dark             → #2C2C2C  (overlay dark background base)
text-dark           → #2C2C2C
border-dark         → #2C2C2C
```

---

## No Analog Found

All files have close analogs in the codebase. No files require falling back to RESEARCH.md patterns exclusively.

---

## ChallengeZone.vue — Verification Required Before Planning

`MascotPanel.vue` is rendered as a child of `ChallengeZone.vue` (not directly in `App.vue`). Before the planner writes tasks for passing `zeroHint` to `MascotPanel`, the planner must read `src/components/ChallengeZone.vue` to confirm:
1. Whether `MascotPanel` is rendered inside `ChallengeZone`
2. What props `ChallengeZone` currently accepts and passes through
3. Whether a new `zeroHint` prop needs to be added to `ChallengeZone`'s `defineProps` as a pass-through

This is a read task, not a pattern task — flagged here so the planner does not overlook it.

---

## Metadata

**Analog search scope:** `src/composables/`, `src/components/`, `src/App.vue`, `src/style.css`
**Files read:** 9 source files + 3 planning docs
**Pattern extraction date:** 2026-04-20
