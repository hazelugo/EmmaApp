---
phase: 9
slug: story-driven-progression
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-16
---

# Phase 9 — Validation Strategy

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
| 9-01-01 | 01 | 1 | STORY-01 | — | N/A | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 9-02-01 | 02 | 2 | STORY-01 | — | N/A | unit | `npm run test` | ✅ | ⬜ pending |
| 9-03-01 | 03 | 3 | STORY-01 | — | N/A | manual | Visual: cutscene appears between levels | N/A | ⬜ pending |
| 9-03-02 | 03 | 3 | STORY-01 | — | N/A | manual | Visual: power-ups apply correctly in gameplay | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/composables/useStory.test.js` — unit tests for world progression, power-up unlock logic, dialogue data access

*Existing vitest infrastructure covers all other phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dialogue cutscene appears between levels | STORY-01 | DOM overlay rendering requires visual check | Complete level 1, verify DialogueCutsceneOverlay appears with correct dialogue lines |
| Character-specific dialogue shows correct text | STORY-01 | Content correctness requires human review | Select Peach vs Daisy, complete level 1, verify different dialogue lines appear |
| Power-up activates and affects gameplay | STORY-01 | Game mechanic requires play-through | Earn World 1 power-up (Double Stars), verify star multiplier applies to next answers |
| World 7 special ending cutscene fires | STORY-01 | End-game flow requires manual trigger | Complete level 7, verify special victory cutscene before Play Again |
| Power-up persists across browser refresh | STORY-01 | localStorage persistence requires manual check | Earn a power-up, refresh page, verify it's still active |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
