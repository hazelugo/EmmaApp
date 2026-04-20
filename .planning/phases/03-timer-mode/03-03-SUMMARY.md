---
phase: 3
plan: 3
subsystem: app-orchestration
tags: [timer-mode, app-wiring, vue-composable, game-logic]
dependency_graph:
  requires:
    - src/composables/useTimer.js
    - src/components/TimerResultsOverlay.vue
    - src/components/ScoreHeader.vue
  provides: []
  affects:
    - src/App.vue
tech_stack:
  added: []
  patterns: [forked-submit-handler, composable-orchestration, ref-based-mode-switching]
key_files:
  created: []
  modified:
    - src/App.vue
decisions:
  - "ChallengeZone reads from timer.currentProblem when isTimerMode is active — no duplicate problem refs needed"
  - "Timer wrong answer clears input immediately with no delay and no penalty, keeping sprint fast-paced"
  - "handleSprintEnd captures timer.stars.value before handleComplete resets isActive, ensuring coin count is accurate"
metrics:
  duration: "~6m"
  completed: "2026-04-20T20:10:00Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 0
  files_modified: 1
---

# Phase 3 Plan 3: App Orchestration & Wiring Summary

**One-liner:** Wired `useTimer` and `TimerResultsOverlay` into `App.vue` with a forked submit handler that drives instant problem cycling and coin accumulation during 60-second sprint sessions.

## What Was Built

### Task 1 — Integrate useTimer and UI into App.vue (commit: 0894941)

Modified `src/App.vue`:

- Imported `useTimer` composable and `TimerResultsOverlay` component
- Added `isTimerMode` and `showTimerResults` refs for mode state management
- Implemented `handleSprintStart()`: sets `isTimerMode=true`, clears answer, calls `timer.startTimer(handleSprintEnd)`
- Implemented `handleSprintEnd()`: calls `timer.handleComplete()`, adds `timer.stars.value` to main `stars`, persists to `emma-stars` localStorage, clears answer, sets `showTimerResults=true`
- Implemented `onTimerResultsClose()`: hides overlay, calls `generateProblem()` to restore standard mode
- Wired `<ScoreHeader>` with `:is-timer-mode`, `:time-left`, and `@start-sprint` binding
- Placed `<TimerResultsOverlay>` with full prop and emit wiring including `isNewHighScore` computed inline

### Task 2 — Handle Timer problem generation and check answer (commit: 2ea9c6d)

- Forked `onSubmit()` with a timer-mode branch that runs first:
  - Computes correct answer inline for `+` and `-` (no `useMathGame.checkAnswer` call)
  - Correct: `playCorrect()`, `timer.incrementScore()`, `timer.incrementCorrect()`, clears `answer`, calls `timer.nextProblem()` immediately — no delay
  - Wrong: `playWrong()`, clears `answer` — no penalty, no freeze
  - Returns early so standard mode path is never executed during a sprint
- Wired `<ChallengeZone>` to read from `timer.currentProblem.value` when `isTimerMode` is true, falling back to the standard `currentProblem` reactive object otherwise

## Deviations from Plan

None — plan executed exactly as written. The `difficulty.maxOperandByOperator` reference mentioned in the plan was not needed since `useTimer.nextProblem()` uses its own fixed `maxOperand=10` (established in plan 03-01 and documented in 03-01-SUMMARY.md).

## Success Criteria Check

- [x] User can click 'Sprint' to start a 60s timer session
- [x] Problems rapidly refresh upon getting them correct (skip the long delay)
- [x] Only '+' and '-' problems appear during Sprint mode
- [x] When time expires, Sprint mode ends, UI overlay shows results, and coins are added to main pool

## Known Stubs

None — all timer state flows from live `useTimer` refs. The `isNewHighScore` prop is computed inline from `timer.correctCount.value === timer.highScore.value`, which reflects the post-`handleComplete()` persisted value.

## Threat Flags

None — no new network endpoints, auth paths, or external data sources introduced.

## Self-Check: PASSED

- `src/App.vue` — modified, FOUND
- Commit `0894941` — FOUND
- Commit `2ea9c6d` — FOUND
- `npm run build` — PASSED (113 modules, 0 errors, both tasks)
