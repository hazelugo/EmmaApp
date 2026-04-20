---
phase: 3
plan: 1
subsystem: composables/utils
tags: [timer-mode, math-utils, composable, refactor]
dependency_graph:
  requires: []
  provides: [src/utils/mathUtils.js, src/composables/useTimer.js]
  affects: [src/composables/useMathGame.js]
tech_stack:
  added: [src/utils/mathUtils.js]
  patterns: [pure-utility-function, vue-composable, localStorage-persistence, setInterval-lifecycle]
key_files:
  created:
    - src/utils/mathUtils.js
    - src/composables/useTimer.js
  modified:
    - src/composables/useMathGame.js
decisions:
  - "Named internal timer currency ref 'stars' (not 'coins') to match project-wide naming convention per CONTEXT.md locked decision; UI layer renders as 'coins'"
  - "Timer mode uses fixed maxOperand=10 for + and - (no adaptive difficulty in sprint mode)"
  - "nextProblem() exposed in useTimer public API for App.vue to call after each correct answer"
metrics:
  duration: "1m 39s"
  completed: "2026-04-20T19:50:47Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 1
---

# Phase 3 Plan 1: Timer Math Data & useTimer Composable Summary

**One-liner:** Extracted pure `generateOperands` utility shared by both composables, and created `useTimer` with 60-second countdown lifecycle, high-score persistence to `emma-timer-best`, and +/- problem generation.

## What Was Built

### Task 1 — Extract problem generator (commit: 2a0cf3e)

Created `src/utils/mathUtils.js` with a single exported pure function `generateOperands(operator, maxOperand)` that returns `{ a, b }` for all four operators (+, -, ×, ÷). The inline operand generation blocks were removed from `useMathGame.js#generateProblem` and replaced with a single delegating call.

All operator rules are preserved exactly:
- `+` — both operands in [1, max]
- `-` — a in [1, max], b in [0, a] (no negative results)
- `×` — both in [0, max] (zero allowed per D-09)
- `÷` — quotient-first (D-07), min divisor 2 (D-08)

### Task 2 — Create useTimer composable (commit: d83d944)

Created `src/composables/useTimer.js` with full 60-second sprint lifecycle:

| Export | Type | Description |
|--------|------|-------------|
| `isActive` | `ref(bool)` | Whether a sprint is in progress |
| `timeLeft` | `ref(number)` | Seconds remaining, starts at 60 |
| `stars` | `ref(number)` | Coins earned this session |
| `correctCount` | `ref(number)` | Correct answers this session |
| `highScore` | `ref(number)` | Persisted best from `emma-timer-best` |
| `currentProblem` | `ref({a,b,operator})` | Active math problem |
| `startTimer(onComplete)` | function | Resets state, starts interval, calls onComplete at 0 |
| `stopTimer()` | function | Clears the interval handle |
| `handleComplete()` | function | Saves high score if beaten, sets isActive=false |
| `incrementScore()` | function | Adds 1 to stars |
| `incrementCorrect()` | function | Adds 1 to correctCount |
| `nextProblem()` | function | Generates a fresh +/- problem |

## Deviations from Plan

### Auto-adjustment: Internal ref named `stars` not `coins`

- **Found during:** Task 2 design
- **Issue:** Plan spec named the currency ref `coins`, but CONTEXT.md locked decision states "All new timer-mode code must use `stars` internally."
- **Fix:** Named the ref `stars` (matching `useMathGame.js` pattern and `emma-stars` localStorage key). Added JSDoc comment noting UI renders it as "coins". No functional impact.
- **Files modified:** `src/composables/useTimer.js`

### Auto-addition: `nextProblem()` and `currentProblem` exported

- **Rule 2 - Missing critical functionality**
- **Found during:** Task 2 implementation
- **Issue:** Without a way to generate and read problems, `useTimer` would be incomplete — App.vue needs to display math problems during a sprint.
- **Fix:** Added `nextProblem()` (generates fresh +/- problems via `generateOperands`) and `currentProblem` ref to the public API.
- **Files modified:** `src/composables/useTimer.js`

## Success Criteria Check

- [x] `mathUtils.js` contains `generateOperands` for all 4 operators
- [x] `useMathGame` imports and uses `generateOperands`
- [x] `useTimer.js` controls the 60-second countdown lifecycle

## Known Stubs

None — no placeholder values or hardcoded UI text introduced in this plan.

## Threat Flags

None — no new network endpoints, auth paths, or external data sources introduced.

## Self-Check: PASSED

- `src/utils/mathUtils.js` — FOUND
- `src/composables/useTimer.js` — FOUND
- `src/composables/useMathGame.js` — modified, FOUND
- Commit `2a0cf3e` — FOUND
- Commit `d83d944` — FOUND
- `npm run build` — PASSED (111 modules, 0 errors, both tasks)
