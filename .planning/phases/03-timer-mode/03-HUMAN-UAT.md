---
status: partial
phase: 03-timer-mode
source: [03-VERIFICATION.md]
started: 2026-04-20T00:00:00Z
updated: 2026-04-20T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Full Sprint Session End-to-end
expected: Sprint button visible on game screen; clicking it starts the countdown in ScoreHeader; math problems appear (+/- only); correct answers cycle to next problem immediately with no delay; wrong answers clear input with no penalty; at 0s the results overlay shows Time's Up! with correct problem count and coins earned; clicking Done returns to normal game with a fresh standard problem
result: [pending]

### 2. New High Score Badge Logic
expected: On a first-ever sprint session the New High Score badge does not appear when 0 problems are solved; on a session that beats the stored best it appears; on a session that ties but did not beat it does NOT appear
result: [pending]

### 3. Star Persistence After Sprint
expected: Stars shown in ScoreHeader increase by the number of coins earned in the sprint; value survives a page refresh (emma-stars localStorage key updated)
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
