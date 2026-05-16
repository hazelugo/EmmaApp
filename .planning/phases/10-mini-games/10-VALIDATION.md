---
phase: 10
slug: mini-games
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-16
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.2.4 |
| **Config file** | vite.config.js (test.environment: jsdom) |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test -- --coverage` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test`
- **After every plan wave:** Run `npm run test -- --coverage`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | MINI-01 | — | N/A | unit | `npm run test -- useMiniGame` | ❌ W0 | ⬜ pending |
| 10-02-01 | 02 | 2 | MINI-01 | — | N/A | unit | `npm run test -- useMiniGame` | ✅ | ⬜ pending |
| 10-02-02 | 02 | 2 | MINI-01 | — | N/A | manual | Visual: Math Dash mini-game is playable | N/A | ⬜ pending |
| 10-03-01 | 03 | 3 | MINI-01 | — | N/A | manual | Visual: Shape Match + Jump Sequence playable | N/A | ⬜ pending |
| 10-04-01 | 04 | 4 | MINI-01 | — | N/A | manual | Visual: mini-game triggers after 5-7 correct, result feeds back | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/composables/__tests__/useMiniGame.test.js` — unit tests for trigger logic (streak threshold, random 5-7 range, reset) and result callback

*Existing vitest infrastructure covers all other requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mini-game triggers at 5-7 correct answers | MINI-01 | Random threshold can't be unit-tested easily; requires play-through | Answer 7 consecutive correct questions, verify mini-game overlay appears |
| Math Dash is playable end-to-end | MINI-01 | Game interaction is visual | Play Math Dash, verify win/lose states work and result returns to main game |
| Shape Match is playable end-to-end | MINI-01 | Game interaction is visual | Play Shape Match, verify correct/incorrect taps work |
| Jump Sequence is playable end-to-end | MINI-01 | Game interaction is visual | Play Jump Sequence, verify sequence input works |
| Skip button returns to main game | MINI-01 | UI interaction requires visual check | Trigger mini-game, tap Skip, verify main game resumes |
| Bonus stars route through creditTimerCoins | MINI-01 | Requires winning and checking star count | Win a mini-game with bonus stars, verify level progression still fires correctly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
