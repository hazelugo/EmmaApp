# Phase 3: Timer Mode - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 03-timer-mode
**Areas discussed:** Entry point, End state, Scoring, Architecture, Operator scope, Edge cases, High score persistence

---

## Entry Point

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated button on main screen | "⏱ Sprint" button visible on main game UI | ✓ |
| Toggle/switch in ScoreHeader | Mode switch embedded in score bar | |

**User's choice:** Dedicated button on main screen  
**Notes:** Keeps the main screen approachable — button is opt-in. Mode switch felt too subtle for a child's UI.

---

## End State (Time's Up)

| Option | Description | Selected |
|--------|-------------|----------|
| Results overlay | Full overlay showing coins earned, correct count, high score | ✓ |
| Soft toast message | Brief "Time's Up!" message, return to normal mode | |
| Just stop | Timer stops, no feedback, player continues | |

**User's choice:** Results overlay  
**Notes:** Gives the session a clear sense of closure. Overlay should show coins earned this run, correct count, and whether a new high score was set.

---

## Scoring / Currency Integration

| Option | Description | Selected |
|--------|-------------|----------|
| Adds to main star/coin total | Coins earned in sprint go straight into the same wallet | ✓ |
| Separate timer-mode currency | Sprint coins kept separate from main game | |

**User's choice:** Adds to main coin total  
**Notes:** Internal variable is still `stars` (localStorage key `emma-stars`). UI displays a Mario coin image. Timer mode adds to the same pool — keep naming consistent with existing code.

---

## Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Option A: Separate `useTimer` composable | Self-contained composable wired into App.vue alongside useMathGame | ✓ |
| Option B: Extend useMathGame with timerMode flag | Single composable, mode flag inside | |

**User's choice:** Option A — separate `useTimer` composable  
**Notes:** Cleaner separation of concerns. `useTimer` owns the countdown, score tally, and high score logic. App.vue orchestrates both composables.

---

## Operator Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Addition + Subtraction only | Fixed to +/- regardless of unlock state | ✓ |
| All unlocked operators | Respects × and ÷ unlock from Phase 2 | |

**User's choice:** Addition + Subtraction only (for now)  
**Notes:** Simplifies timer mode for Phase 3. ×/÷ can be added in a later phase.

---

## In-Progress Answer at Time's Up

| Option | Description | Selected |
|--------|-------------|----------|
| Discard in-progress answer | Current input cleared, no credit given | ✓ |
| Validate in-progress answer | Attempt to grade the partial input | |

**User's choice:** Discard — no credit for in-progress answers  
**Notes:** Cleaner UX. Avoids edge case of partial numeric input being misinterpreted.

---

## High Score Persistence

| Option | Description | Selected |
|--------|-------------|----------|
| Store in localStorage | Persists across sessions | ✓ |
| Session only | Resets on page refresh | |

**User's choice:** localStorage persistence  
**Notes:** Key to use: `emma-timer-best`. Stores highest correct-answer count achieved in a single 60-second sprint.

---

## Claude's Discretion

- Exact button label and placement (suggested: "⏱ Sprint!" below NumberPad or in ScoreHeader area)
- Results overlay visual design (coin tally, correct count, high score badge)
- Whether to show a "Ready?" countdown (3–2–1) before the timer starts
- Timer color transition (green → yellow → red as time runs low)
- Whether the `useTimer` composable generates its own problems or delegates to `useMathGame`

## Deferred Ideas

- Timer mode with × and ÷ (Phase 3 scope excludes this, revisit later)
- Leaderboard / multiple player high scores
