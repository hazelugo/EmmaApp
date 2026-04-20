---
phase: 03-timer-mode
reviewed: 2026-04-20T00:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - src/App.vue
  - src/components/ScoreHeader.vue
  - src/components/TimerResultsOverlay.vue
  - src/composables/useMathGame.js
  - src/composables/useTimer.js
  - src/utils/mathUtils.js
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-04-20
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Reviewed the timer mode feature additions: `useTimer.js` (new composable), `TimerResultsOverlay.vue` (new component), and modifications to `App.vue`, `ScoreHeader.vue`, `useMathGame.js`, and `mathUtils.js`.

The timer lifecycle (start, tick, stop, complete) is well-structured and the interval-cleanup defense is solid. The operand generation logic in `mathUtils.js` is correct for all operators under normal operating conditions. The main concerns are a logic gap where timer-earned coins bypass the level progression milestone check, a false-positive "New High Score" badge on tied scores, and a minor operator assumption in the answer-checking path.

---

## Warnings

### WR-01: Timer coins bypass level-up milestone check

**File:** `src/App.vue:76-77` (interacts with `src/composables/useMathGame.js:199`)

**Issue:** When a sprint session ends, `handleSprintEnd()` directly mutates `stars.value` by adding the timer's earned coins:

```js
stars.value += timer.stars.value
```

`stars` is the reactive ref owned by `useMathGame`. The milestone check that triggers `showLevelVictory` and level advancement lives inside `checkAnswer()` (useMathGame.js line 199) and runs only there. Direct external mutation of `stars` skips this check entirely. A player who earns enough coins in timer mode to cross a 10-star boundary (e.g., going from 8 stars to 15) will not trigger the level-up/victory sequence that would normally fire. Stars are persisted correctly, but level progression is silently skipped.

**Fix:** Expose a dedicated crediting function from `useMathGame` that applies the coins and runs the milestone check, rather than mutating `stars` externally.

In `useMathGame.js`, add:
```js
/**
 * Credit coins earned outside normal checkAnswer flow (e.g., timer mode).
 * Applies milestone check so level progression is not skipped.
 */
function creditTimerCoins (amount) {
  if (amount <= 0) return
  for (let i = 0; i < amount; i++) {
    stars.value++
    setStorage('emma-stars', stars.value)
    if (stars.value % 10 === 0 && stars.value > lastMilestone.value) {
      lastMilestone.value = stars.value
      setStorage('emma-lastMilestone', lastMilestone.value)
      completedLevel.value   = level.value
      showLevelVictory.value = true
      if (level.value < 7) {
        level.value++
        setStorage('emma-level', level.value)
        pendingLevel.value = level.value
      }
    }
  }
}
```

Then in `App.vue` `handleSprintEnd()`, replace lines 76-77:
```js
// Before (bypasses milestone check):
stars.value += timer.stars.value
try { localStorage.setItem('emma-stars', stars.value) } catch { /* ignore */ }

// After:
creditTimerCoins(timer.stars.value)
```

Export `creditTimerCoins` from `useMathGame` and destructure it in `App.vue`.

---

### WR-02: "New High Score" badge fires on tied score

**File:** `src/App.vue:312`

**Issue:** The `isNewHighScore` binding is:
```js
timer.correctCount.value > 0 && timer.correctCount.value === timer.highScore.value
```

`handleComplete()` in `useTimer.js` updates `highScore` only when `correctCount > highScore` (strict improvement). After `handleComplete()` runs, if a player ties their previous best (e.g., scores 10 on a previous best of 10), `handleComplete()` does NOT update `highScore`. So `correctCount (10) === highScore (10)` evaluates to `true`, and the "New High Score" badge incorrectly appears for a tied, non-improved score.

**Fix:** Track whether the high score was actually beaten inside `useTimer` and expose it:

```js
// In useTimer.js — add reactive flag
const isNewRecord = ref(false)

function handleComplete () {
  stopTimer()
  if (correctCount.value > highScore.value) {
    highScore.value = correctCount.value
    setStorage(LS_HIGH_SCORE, highScore.value)
    isNewRecord.value = true   // set BEFORE isActive changes
  } else {
    isNewRecord.value = false
  }
  isActive.value = false
}
```

Expose `isNewRecord` from the return object, then in `App.vue`:
```html
:is-new-high-score="timer.isNewRecord.value"
```

---

### WR-03: Implicit operator assumption in timer answer check

**File:** `src/App.vue:161-163`

**Issue:** The timer-mode answer evaluation uses a bare `else` to handle subtraction:
```js
if (prob.operator === '+') correctAnswer = prob.a + prob.b
else correctAnswer = prob.a - prob.b   // timer mode is +/- only
```

This is safe today because `TIMER_OPERATORS` is `['+', '-']`. However, if `TIMER_OPERATORS` is ever extended (e.g., to include `'×'`), the `else` branch would silently compute a wrong answer without any error indication, making incorrect answers appear correct.

**Fix:** Use an explicit check or a lookup map to fail visibly on unexpected operators:
```js
const opMap = { '+': prob.a + prob.b, '-': prob.a - prob.b }
const correctAnswer = opMap[prob.operator]
if (correctAnswer === undefined) {
  console.error(`[timer] Unexpected operator: ${prob.operator}`)
  answer.value = ''
  return
}
```

---

## Info

### IN-01: Unused return value `getCutsceneVideoPath` never called

**File:** `src/composables/useMathGame.js:247-252`

**Issue:** `getCutsceneVideoPath` is defined and exported from `useMathGame` but is not destructured or called anywhere in `App.vue` or any other component. It contains a placeholder body and a comment about future routing. This is dead code.

**Fix:** Either remove it until the cutscene feature is actually implemented, or add a `// TODO(phase-N): wire up when cutscenes are ready` comment and keep it intentionally. If keeping, note in the return block comment that it is future-facing.

---

### IN-02: ScoreHeader countdown threshold is exclusive of 10

**File:** `src/components/ScoreHeader.vue:42`

**Issue:** The red-pulse animation triggers at `timeLeft < 10`, so it activates when 9 seconds remain, not 10. The threshold silently excludes the "10 seconds left" moment from the urgency cue. This is a minor UX inconsistency — a player watching the counter change from 10 to 9 sees no warning at 10.

**Fix:** If "10 seconds or fewer" is the intended urgency window, change to `timeLeft <= 10`. If "under 10" is intentional, a comment clarifying that choice would prevent future confusion:
```html
:class="timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-mushroom-white'"
```

---

_Reviewed: 2026-04-20_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
