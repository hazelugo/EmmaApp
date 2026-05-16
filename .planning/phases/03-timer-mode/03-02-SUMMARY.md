---
phase: 3
plan: 2
subsystem: components/ui
tags: [timer-mode, vue-component, overlay, score-header]
dependency_graph:
  requires: [src/composables/useTimer.js]
  provides: [src/components/TimerResultsOverlay.vue]
  affects: [src/components/ScoreHeader.vue]
tech_stack:
  added: []
  patterns: [vue-transition-fade, conditional-rendering, emit-based-communication]
key_files:
  created:
    - src/components/TimerResultsOverlay.vue
  modified:
    - src/components/ScoreHeader.vue
decisions:
  - "Shop button hidden during timer mode to reduce cognitive load for the 6-year-old audience — mute remains accessible at all times"
  - "Sprint button uses text label instead of icon-only to be self-explanatory for a child without needing aria-label discovery"
metrics:
  duration: "~4m"
  completed: "2026-04-20T19:53:39Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 1
---

# Phase 3 Plan 2: Timer UI Components Summary

**One-liner:** Created `TimerResultsOverlay` results screen and extended `ScoreHeader` with a Sprint entry button plus live countdown display that pulses red under 10 seconds.

## What Was Built

### Task 1 — Create TimerResultsOverlay (commit: a2d89ef)

Created `src/components/TimerResultsOverlay.vue` following the `ShopOverlay.vue` fade transition pattern:

- Props: `show`, `coins`, `correctCount`, `highScore`, `isNewHighScore`
- Emits: `close`
- UI: "Time's Up!" heading, stat rows for correct problems and coins earned, best score row, optional animated "New High Score!" badge (bouncing star-gold pill), and a Done button styled with `btn-press` class

### Task 2 — Sprint button + timer countdown in ScoreHeader (commit: 757e721)

Extended `src/components/ScoreHeader.vue`:

| Addition | Detail |
|----------|--------|
| `isTimerMode` prop | Controls which UI branch renders |
| `timeLeft` prop | Seconds remaining to display |
| `start-sprint` emit | Fired by the Sprint button |
| Sprint button | Visible only when `!isTimerMode`, sits beside Shop button |
| Countdown display | Replaces "Emma's Star World" title during active sprint; turns red + pulses when `timeLeft < 10` |
| Shop button | Hidden during timer mode (mute button always visible) |

## Deviations from Plan

### Auto-decision: Hide Shop button during timer mode

- **Found during:** Task 2 implementation
- **Issue:** Plan did not specify whether the Shop button should remain during a sprint. Showing it would let a child accidentally navigate away mid-sprint.
- **Fix:** Added `v-if="!isTimerMode"` to Shop button to hide it while sprint is active. Mute remains always accessible.
- **Files modified:** `src/components/ScoreHeader.vue`

## Success Criteria Check

- [x] `TimerResultsOverlay.vue` is styled appropriately for the game's aesthetic
- [x] `ScoreHeader.vue` has a Sprint button that emits `start-sprint`
- [x] When `isTimerMode` is true, `ScoreHeader.vue` shows the timer countdown

## Known Stubs

None — all props are wired for real data from `useTimer`. App.vue integration is deferred to plan 03-03.

## Threat Flags

None — no new network endpoints, auth paths, or external data sources introduced.

## Self-Check: PASSED

- `src/components/TimerResultsOverlay.vue` — FOUND
- `src/components/ScoreHeader.vue` — modified, FOUND
- Commit `a2d89ef` — FOUND
- Commit `757e721` — FOUND
- `npm run build` — PASSED (both tasks)
