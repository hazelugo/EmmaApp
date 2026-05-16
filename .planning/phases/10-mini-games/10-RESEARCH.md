# Phase 10: Mini-Games - Research

**Researched:** 2026-05-16
**Domain:** Vue 3 composable design, mini-game loop architecture, overlay sequencing, streak-triggered interrupts
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MINI-01 | Mini-games appear between problem sets every 5–7 correct answers | useMiniGame.js composable (streak watcher + random threshold), three mini-game overlay components, result callback wired in App.vue |
</phase_requirements>

---

## Summary

Phase 10 inserts a mini-game interrupt into the normal math problem flow. After 5–7 consecutive correct answers (randomized per activation to prevent rhythm exploitation), the game pauses normal play, shows a full-screen mini-game overlay, runs its game loop, then returns a win/lose/score result back to `App.vue` which resumes normal play.

The codebase already handles a very similar pattern with Timer Mode: a full-screen overlay (`TimerResultsOverlay`) takes over the UI, runs a contained game loop (`useTimer.js`), and feeds the result back through `App.vue` into `useMathGame`. Mini-games follow this exact shape, extended with a composable wrapper (`useMiniGame.js`) that manages which mini-game to show, when to trigger it, and what to do with the result. No external game libraries — all three mini-games are pure Vue 3 + CSS, consistent with the no-library rule in the project context.

The three mini-games are: **Math Dash** (answer rapid-fire math problems in a countdown), **Shape Match** (tap the matching shape), and **Jump Sequence** (tap a sequence in order). Each is a self-contained SFC (single-file component) that emits a `result` event when it finishes. `useMiniGame.js` orchestrates which component to show; the components contain their own game loops.

**Primary recommendation:** Build `useMiniGame.js` as a thin orchestrator composable (mirrors `useTimer.js` in style), create three focused mini-game SFCs that each emit `@result`, wire everything through `App.vue` using the established `v-if + <Transition>` overlay pattern. Streak trigger logic lives in `useMiniGame.js`; App.vue calls `checkMiniGameTrigger(streak)` after each correct answer.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 `ref` / `computed` / `watch` | ^3.5.32 [VERIFIED: package.json] | Reactive state in composable and SFCs | Already used throughout |
| Vue `<Transition>` | Built-in | Overlay fade-in/out | Established pattern — every overlay uses this |
| CSS (Tailwind utility classes) | ^4.x [VERIFIED: package.json] | Styling mini-game UI | No new CSS framework — use existing token system |
| `localStorage` | Browser native | No persistence needed for mini-games — results are ephemeral | Consistent with other non-persisted state (timer session data) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `canvas-confetti` | ^1.9.3 [VERIFIED: package.json — already installed] | Win celebration on mini-game completion | Same trigger used in streak milestones |
| `setTimeout` / `setInterval` | Browser native | Game timers inside Math Dash, Jump Sequence | Same approach as `useTimer.js` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pure CSS + Vue transitions | Phaser.js / Pixi.js | External game engines add 1–2 MB bundle weight, require learning new API; pure Vue is sufficient for simple mini-games |
| Inline game logic in SFC | Separate composable per mini-game | Separate composables add files without benefit at this complexity level; self-contained SFCs are simpler |

**Installation:** No new packages needed. All dependencies already installed.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── composables/
│   └── useMiniGame.js          # Orchestrator: trigger logic, active game tracking, result handling
├── components/
│   ├── MiniGameOverlay.vue     # Outer shell: z-index, fade transition, routes to correct game SFC
│   ├── MiniGameMathDash.vue    # Game 1: rapid-fire math countdown
│   ├── MiniGameShapeMatch.vue  # Game 2: shape matching tap game
│   └── MiniGameJumpSequence.vue # Game 3: sequence memorization tap game
```

### Pattern 1: Composable Orchestrator (useMiniGame.js)

**What:** A composable that tracks the trigger threshold, selected game, and result state. Keeps mini-game logic out of App.vue.

**When to use:** Any time multiple overlays share trigger/result lifecycle — mirrors `useTimer.js` exactly.

**Example:**
```javascript
// Source: modeled on src/composables/useTimer.js [VERIFIED: codebase]
import { ref } from 'vue'

const MINI_GAME_TYPES = ['math-dash', 'shape-match', 'jump-sequence']

export function useMiniGame() {
  const showMiniGame    = ref(false)
  const activeGame      = ref(null)      // 'math-dash' | 'shape-match' | 'jump-sequence'
  const miniGameResult  = ref(null)      // { won: Boolean, bonus: Number } | null
  let   _nextThreshold  = _randomThreshold()

  function _randomThreshold() {
    // 5–7 inclusive — random each time to prevent rhythm exploitation
    return 5 + Math.floor(Math.random() * 3)
  }

  /** Call after every correct answer. Returns true if mini-game was triggered. */
  function checkMiniGameTrigger(streak) {
    if (streak > 0 && streak % _nextThreshold === 0) {
      activeGame.value   = MINI_GAME_TYPES[Math.floor(Math.random() * MINI_GAME_TYPES.length)]
      showMiniGame.value = true
      miniGameResult.value = null
      _nextThreshold     = _randomThreshold()
      return true
    }
    return false
  }

  /** Called by App.vue when MiniGameOverlay emits @result */
  function onMiniGameResult(result) {
    miniGameResult.value   = result   // { won, bonus }
    showMiniGame.value     = false
    activeGame.value       = null
  }

  /** Reset state (e.g., on character change / game reset) */
  function resetMiniGame() {
    showMiniGame.value     = false
    activeGame.value       = null
    miniGameResult.value   = null
    _nextThreshold         = _randomThreshold()
  }

  return {
    showMiniGame,
    activeGame,
    miniGameResult,
    checkMiniGameTrigger,
    onMiniGameResult,
    resetMiniGame,
  }
}
```

### Pattern 2: Mini-Game Overlay Shell (MiniGameOverlay.vue)

**What:** A single outer overlay shell that accepts `activeGame` prop and conditionally renders the correct mini-game SFC. Keeps App.vue clean.

**When to use:** Multiple game variants under one modal shell — same approach as how `OperatorTutorialOverlay` handles multiple operators.

**Example:**
```html
<!-- Source: modeled on src/components/OperatorTutorialOverlay.vue [VERIFIED: codebase] -->
<Transition name="minigame-fade">
  <div
    v-if="show"
    class="fixed inset-0 z-[250] bg-dark/95 flex flex-col items-center justify-center"
  >
    <MiniGameMathDash
      v-if="activeGame === 'math-dash'"
      @result="$emit('result', $event)"
    />
    <MiniGameShapeMatch
      v-else-if="activeGame === 'shape-match'"
      @result="$emit('result', $event)"
    />
    <MiniGameJumpSequence
      v-else-if="activeGame === 'jump-sequence'"
      @result="$emit('result', $event)"
    />
  </div>
</Transition>
```

### Pattern 3: App.vue Wiring — streak check after correct answer

**What:** After `checkAnswer()` returns `'correct'`, call `checkMiniGameTrigger(streak.value)` before scheduling `generateProblem`. If a mini-game was triggered, skip `generateProblem` — it fires after the mini-game result.

**When to use:** Same guard pattern used for tutorial overlay (`showTutorial`) and level victory (`showLevelVictory`).

**Example:**
```javascript
// Source: pattern from App.vue onSubmit() [VERIFIED: codebase]
if (result === 'correct') {
  // ... confetti / sounds ...

  const miniTriggered = checkMiniGameTrigger(streak.value)
  if (!miniTriggered) {
    setTimeout(() => {
      if (!showLevelVictory.value && !showLevelUp.value
          && !showLevelIntro.value && !showTutorial.value) {
        generateProblem()
      }
    }, 1400)
  }
}

// When mini-game overlay emits @result:
function onMiniGameResult(result) {
  miniGame.onMiniGameResult(result)
  if (result.won && result.bonus > 0) {
    creditTimerCoins(result.bonus)   // reuse existing coin-credit path
  }
  generateProblem()
}
```

### Pattern 4: Self-Contained Mini-Game SFC Loop

**What:** Each mini-game SFC manages its own game state, timer, and win/lose condition internally. It emits `@result` with `{ won: Boolean, bonus: Number }` when done.

**When to use:** All three mini-games follow this contract. The shell doesn't care about internals.

**Example (Math Dash structure):**
```javascript
// MiniGameMathDash.vue — Source: design based on useTimer.js pattern [VERIFIED: codebase]
const emit = defineEmits(['result'])

const timeLeft    = ref(15)      // 15-second burst
const score       = ref(0)
const problem     = ref({})
let   _interval   = null

function startGame() {
  score.value   = 0
  timeLeft.value = 15
  nextProblem()
  _interval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) endGame()
  }, 1000)
}

function endGame() {
  clearInterval(_interval)
  emit('result', { won: score.value >= 5, bonus: Math.floor(score.value / 2) })
}

onMounted(startGame)
onUnmounted(() => clearInterval(_interval))
```

### Pattern 5: z-index Layering

**What:** Mini-game overlay must sit above the main game (z-[200] for tutorial, z-[225] from Phase 9 story) but below the streak flash (z-[500]).

**Recommended z-index:** `z-[250]` — consistent with the established z-index stack.

**Verified z-index stack in codebase [VERIFIED: codebase grep]:**
- `z-[500]` — streak flash (flash-fade div in App.vue)
- `z-[300]` — TimerResultsOverlay
- `z-[250]` — available for MiniGameOverlay
- `z-[225]` — DialogueCutsceneOverlay (Phase 9)
- `z-[200]` — OperatorTutorialOverlay
- `z-[150]` — ShopOverlay (implied from overlay stacking)

### Anti-Patterns to Avoid

- **Putting game loop timers in the composable:** Game timers (`setInterval` for countdown) belong inside the SFC that owns the visual state. The composable only handles trigger/result lifecycle.
- **Persisting mini-game state to localStorage:** Mini-game results are ephemeral — they don't need persistence. Only bonus coins (credited through `creditTimerCoins`) persist.
- **Blocking `generateProblem` without a guard:** If the mini-game emits `@result` during a level victory sequence, `generateProblem` would fire before the victory modal closes. Reuse the existing guard: `if (!showLevelVictory.value && !showLevelIntro.value && ...)`.
- **Using `streak.value % 5 === 0` as the trigger:** This fires on streak milestones that already trigger confetti explosions (streak 5, 10, 15...). Use a random threshold stored in `_nextThreshold` and reset after each trigger.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Coin/bonus crediting | Custom stars += N in App.vue | `creditTimerCoins(bonus)` from `useMathGame` | Already handles milestone check and localStorage persistence |
| Win celebration | Custom confetti in mini-game SFC | `canvas-confetti` (already installed) | Already used for streaks; consistent UX |
| Transition animations | CSS keyframes from scratch | Tailwind `animate-bounce`, `animate-pulse` + existing `.pop-in` class | Already defined in `style.css` and used in `OperatorTutorialOverlay` |
| Shape rendering | SVG library / canvas | Plain `div` with Tailwind border-radius + bg colors | Shapes can be circles, squares, triangles via CSS; no library needed |

**Key insight:** The existing `creditTimerCoins()` function is the correct hook for awarding mini-game bonuses — it handles the milestone/level progression edge cases that a naive `stars.value += N` would skip.

---

## Mini-Game Designs (Implementation Guide)

### Math Dash
- **Loop:** Generate simple + or - problem (fixed max operand 10). Player types answer via NumberPad or on-screen buttons. 15-second timer. Score = correct answers.
- **Win condition:** >= 5 correct in 15 seconds.
- **Bonus:** `Math.floor(score / 2)` coins.
- **UI pattern:** Reuse `NumberPad.vue` emit events (`@digit`, `@backspace`, `@submit`) — or inline a simpler tap-number row to avoid prop threading complexity. Inline row is simpler for a contained SFC.

### Shape Match
- **Loop:** Show a target shape (top). Show 4 options (grid 2x2). Tap the matching shape. No timer — 6 rounds, tap-to-advance.
- **Win condition:** >= 4 of 6 correct.
- **Bonus:** `correct` coins (1 per correct match).
- **UI pattern:** CSS shapes via div + Tailwind (`rounded-full` = circle, `rotate-45` square = diamond, clip-path for triangle). Colors from existing theme tokens (`star-gold`, `mario-red`, `luigi`, `rosalina`).
- **Shape data:** Defined as plain JS object array inside the SFC — no external data file needed.

### Jump Sequence
- **Loop:** Show a sequence of colored squares lighting up one at a time (500ms each). Then player taps them back in order. 3 rounds, sequence grows by 1 each round (start: 3, max: 5).
- **Win condition:** Complete all 3 rounds without error.
- **Bonus:** 3 coins on win.
- **UI pattern:** 4 colored buttons in a 2x2 grid. "Active" state = Tailwind `scale-110` + ring. Pure `setTimeout` chain for playback sequence. Same interaction pattern as `OperatorTutorialOverlay`'s step-based progression.

---

## Common Pitfalls

### Pitfall 1: Streak Modulo Collision With Existing Milestones
**What goes wrong:** Using `streak % 5 === 0` as trigger fires on the same beat as the confetti explosion streak milestone (streak 5, 10, 15...), causing two simultaneous visual interrupts.
**Why it happens:** The existing `isStreakMilestone` check in `onSubmit` fires at streak 3, 5, and every 5 thereafter. A modulo-5 mini-game trigger would collide with streak 5, 10, 15.
**How to avoid:** Use a random threshold (5, 6, or 7) stored in a local variable that resets after each mini-game trigger. The trigger fires at `streak === _nextThreshold`, not `streak % N`.
**Warning signs:** Mini-game overlay and confetti explosion appear simultaneously.

### Pitfall 2: Timer Cleanup on Unmount
**What goes wrong:** If the player somehow dismisses the mini-game while an interval is running (e.g., character select reset), the interval leaks and continues firing after the component is gone.
**Why it happens:** Vue SFCs using `setInterval` must always call `clearInterval` in `onUnmounted`.
**How to avoid:** Every mini-game SFC that uses a timer must have `onUnmounted(() => clearInterval(_interval))`. Mirror the pattern from `useTimer.js` line 101. [VERIFIED: codebase]
**Warning signs:** Console errors about setting state on unmounted component.

### Pitfall 3: generateProblem Firing During Mini-Game
**What goes wrong:** The 1400ms `setTimeout` scheduled after a correct answer fires while the mini-game is still showing, generating a new math problem behind the overlay — which then appears when the overlay closes.
**Why it happens:** The `setTimeout(() => { generateProblem() }, 1400)` in `onSubmit` runs unconditionally once scheduled.
**How to avoid:** When mini-game trigger fires, skip the `setTimeout` entirely (the `miniTriggered` guard shown in Pattern 3). Generate a new problem only in the `onMiniGameResult` handler.
**Warning signs:** After mini-game closes, the problem shown is "stale" (it appeared during the mini-game animation).

### Pitfall 4: Bonus Coins Bypassing Milestone Check
**What goes wrong:** Directly setting `stars.value += bonus` skips the every-10-stars level progression check, causing the player to skip level transitions.
**Why it happens:** The milestone check is inside `checkAnswer()` and `creditTimerCoins()` — it does not automatically apply to external mutations of `stars`.
**How to avoid:** Always use `creditTimerCoins(bonus)` for mini-game bonus awards. [VERIFIED: useMathGame.js line 254–271]

### Pitfall 5: Showing Mini-Game During Level Transition
**What goes wrong:** `checkMiniGameTrigger` fires at the same time as a level victory (both triggered by the correct answer that hits a milestone), causing both `showLevelVictory` and `showMiniGame` to be true simultaneously.
**Why it happens:** `checkAnswer()` sets `showLevelVictory` when stars hits a 10-multiple. The mini-game trigger fires after `checkAnswer()` returns.
**How to avoid:** In `checkMiniGameTrigger`, gate on `!showLevelVictory.value` — if a level just completed, skip the mini-game trigger for this answer. The mini-game threshold resets regardless (so it's not lost, just delayed).

---

## Code Examples

### Streak-based trigger (non-modulo approach)
```javascript
// Source: design pattern [ASSUMED] — avoids collision with streak milestones
let _nextThreshold = 5 + Math.floor(Math.random() * 3)  // 5, 6, or 7

function checkMiniGameTrigger(streak, showLevelVictory) {
  if (showLevelVictory) return false   // don't interrupt level transition
  if (streak >= _nextThreshold) {
    _nextThreshold = streak + 5 + Math.floor(Math.random() * 3)  // set next absolute threshold
    // trigger mini-game...
    return true
  }
  return false
}
```

Note: Using an absolute threshold (`streak >= _nextThreshold`) rather than modulo is more robust — it fires once at the threshold and then resets to `streak + random(5,7)` so subsequent games also space out correctly.

### CSS shape helpers (no SVG library needed)
```css
/* Source: CSS pattern [ASSUMED] — achievable with Tailwind utilities */
/* Circle: rounded-full w-16 h-16 */
/* Square: rounded-md w-16 h-16 */
/* Triangle: border-l-[2rem] border-r-[2rem] border-b-[3.5rem] border-transparent */
/* Diamond: rotate-45 w-12 h-12 rounded-sm */
```

### Jump Sequence playback with setTimeout chain
```javascript
// Source: pattern modeled on useTimer.js [VERIFIED: codebase]
function playSequence(seq) {
  seq.forEach((colorIdx, i) => {
    setTimeout(() => {
      activeLight.value = colorIdx
      setTimeout(() => { activeLight.value = null }, 400)
    }, i * 600)
  })
}
```

---

## Runtime State Inventory

> This is a greenfield composable phase with no rename/refactor scope.

**Not applicable** — Phase 10 adds new state; it does not rename or migrate existing state.

---

## Environment Availability

> Step 2.6: No new external dependencies required for this phase.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Vitest | Unit tests | Yes | 3.2.4 [VERIFIED: vite.config.js] | — |
| canvas-confetti | Win celebration | Yes | ^1.9.3 [VERIFIED: package.json in node_modules] | Omit confetti on win |
| jsdom | Test environment | Yes | configured in vite.config.js test.environment [VERIFIED: codebase] | — |

**Missing dependencies with no fallback:** None.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `vite.config.js` (test block, lines 87–93) |
| Quick run command | `npm test -- --reporter=verbose useMiniGame` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MINI-01a | Trigger fires when streak reaches threshold (5–7) | unit | `npm test -- useMiniGame` | No — Wave 0 gap |
| MINI-01b | Trigger does not fire before threshold | unit | `npm test -- useMiniGame` | No — Wave 0 gap |
| MINI-01c | Threshold randomizes between 5 and 7 | unit | `npm test -- useMiniGame` | No — Wave 0 gap |
| MINI-01d | Result callback clears showMiniGame and activeGame | unit | `npm test -- useMiniGame` | No — Wave 0 gap |
| MINI-01e | Bonus coins are credited via creditTimerCoins (integration) | manual | Manual play-through | Manual only |
| MINI-01f | All 3 mini-games are selectable (activeGame cycles through all types) | unit | `npm test -- useMiniGame` | No — Wave 0 gap |
| MINI-01g | resetMiniGame clears all state | unit | `npm test -- useMiniGame` | No — Wave 0 gap |

### Sampling Rate
- **Per task commit:** `npm test -- useMiniGame`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/composables/__tests__/useMiniGame.test.js` — covers MINI-01a through MINI-01d, MINI-01f, MINI-01g
- [ ] No new fixtures needed — `setup.js` already clears localStorage in `beforeEach` [VERIFIED: codebase]

---

## Security Domain

> `security_enforcement: true`, `security_asvs_level: 1` per config.json

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Not applicable — no auth in this app |
| V3 Session Management | No | Mini-game results are ephemeral; no session tokens |
| V4 Access Control | No | No access control in this SPA |
| V5 Input Validation | Yes (minor) | Math Dash answer input: same Number() coercion pattern as `checkAnswer()` [VERIFIED: useMathGame.js line 181]; cap input length at 3 digits [VERIFIED: useMathGame.js line 235] |
| V6 Cryptography | No | No secrets or cryptographic operations |

### Known Threat Patterns for Mini-Game Input

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Oversized input in Math Dash | Tampering | Cap at 3 chars — same guard as `appendDigit()` in useMathGame.js |
| NaN injection via empty submit | Tampering | `if (answer === '') return` guard — same as `checkAnswer()` |

> Level 1 ASVS: no high-severity concerns. Mini-games are purely client-side with no server interaction or stored secrets.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| External game library (Phaser) | Pure Vue 3 + CSS | Project convention from day 1 | No heavy dependency; simpler bundle |
| Periodic timer (every N correct) | Streak threshold with random offset | This phase | Avoids rhythmic predictability |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Jump Sequence uses 4 buttons in a 2×2 grid with 3 growing rounds | Mini-Game Designs | Low — design can be adjusted in planning without affecting architecture |
| A2 | Shape Match uses 4 shapes in a 2×2 option grid | Mini-Game Designs | Low — cosmetic |
| A3 | Math Dash win condition is >= 5 correct in 15 seconds | Mini-Game Designs | Low — threshold is a tunable constant |
| A4 | Mini-game bonus = coins credited, not stars from separate pool | Architecture Patterns | Medium — if user wants a separate reward currency, `creditTimerCoins` is wrong hook |
| A5 | Absolute threshold strategy (`streak >= _nextThreshold`) preferred over modulo | Code Examples | Low — planner can choose either; modulo is simpler if collision with streak milestones is acceptable |

---

## Open Questions

1. **What happens to the in-progress streak when a mini-game triggers?**
   - What we know: `streak` in `useMathGame` is not reset on mini-game entry (mini-games are a reward, not an interruption penalty).
   - What's unclear: Should streak continue counting during the mini-game, or pause?
   - Recommendation: Pause streak (don't increment) during mini-game; resume from same value when mini-game ends. Since `checkAnswer()` is not called during mini-games, streak naturally pauses — no code change needed.

2. **Should mini-game results (win/lose history) be persisted?**
   - What we know: Timer mode high score is persisted (`emma-timer-best`). Mini-game results are not mentioned in MINI-01.
   - What's unclear: Whether an aggregate win-rate or play count should persist.
   - Recommendation: No persistence for Phase 10. MINI-01 only requires playability and result feedback. Persistence can be added in Phase 12 (Reward System).

3. **Can the player skip / dismiss a mini-game?**
   - What we know: Timer mode and tutorial both require completion (no early exit). MINI-01 doesn't specify.
   - What's unclear: Whether a skip button is required.
   - Recommendation: Include a "Skip" tap target (small, bottom-right, low visual priority). Children may get stuck; a skip prevents frustration. Skip counts as `{ won: false, bonus: 0 }` result.

---

## Sources

### Primary (HIGH confidence)
- `src/composables/useMathGame.js` [VERIFIED: codebase] — streak tracking, `checkAnswer` structure, `creditTimerCoins` hook
- `src/composables/useTimer.js` [VERIFIED: codebase] — composable shape to mirror for `useMiniGame.js`
- `src/App.vue` [VERIFIED: codebase] — overlay guard pattern (`showLevelVictory`, `showTutorial` guards in `onSubmit`)
- `src/components/OperatorTutorialOverlay.vue` [VERIFIED: codebase] — overlay SFC pattern, `v-if + <Transition>`, `onMounted`/`onUnmounted` timer cleanup
- `src/components/TimerResultsOverlay.vue` [VERIFIED: codebase] — overlay shell pattern
- `vite.config.js` test block [VERIFIED: codebase] — Vitest config, include patterns, jsdom environment

### Secondary (MEDIUM confidence)
- `src/style.css` [VERIFIED: codebase] — theme tokens (`star-gold`, `mario-red`, `luigi`, `rosalina`) available for shape colors
- `.planning/config.json` [VERIFIED: codebase] — `nyquist_validation: true`, `security_enforcement: true`

### Tertiary (LOW confidence)
- None. All architectural claims are derived from verified codebase patterns.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; all tools already in the project
- Architecture: HIGH — directly derived from two verified existing patterns (`useTimer` + overlay shell)
- Mini-game designs: MEDIUM — game rules are [ASSUMED]; mechanic complexity is low enough that any reasonable design works
- Pitfalls: HIGH — each pitfall is traced to a specific verified code location

**Research date:** 2026-05-16
**Valid until:** 2026-08-16 (stable Vue 3 APIs; no external library upgrades needed)
