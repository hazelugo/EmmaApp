# Phase 3: Timer Mode — CONTEXT

> **Input to planning agent.** These decisions are locked. Do not re-open them.

## Locked Decisions

| Decision | Choice |
|----------|--------|
| Entry point | Dedicated button on main game screen |
| End state | Results overlay (coins earned, correct count, high score) |
| Scoring | Adds directly to main `stars` pool (same localStorage key: `emma-stars`) |
| Architecture | Separate `useTimer` composable + App.vue orchestration |
| Operator scope | Addition and Subtraction ONLY (`+` and `-`) |
| In-progress answer | Discard on time's up — no credit |
| High score persistence | `localStorage` key: `emma-timer-best` (highest correct count) |

## Currency Naming Note

The UI uses a Mario coin image and the label "coins" in ScoreHeader.vue, but the internal ref is `stars` and the localStorage key is `emma-stars`. All new timer-mode code must use `stars` internally. UI copy can say "coins" to match the existing display.

## Key Existing Patterns to Follow

- Composable pattern: `useMathGame.js` — reactive refs, `getStorage`/`setStorage` helpers, exported object
- Overlay pattern: `ShopOverlay.vue`, `LevelVictoryModal.vue` — `<Transition name="fade">`, `v-if="show"` prop, `@close` emit
- App.vue orchestration: destructure from composable, pass as props, handle emits
- `generateProblem` for +/- lives inside `useMathGame.js` — `useTimer` should delegate problem generation to a shared utility or re-use the same operator logic (not duplicate it)

## Out of Scope for Phase 3

- × and ÷ in timer mode
- Leaderboard / multi-player scores
- Sound changes specific to timer mode (reuse existing correct/wrong sounds)
