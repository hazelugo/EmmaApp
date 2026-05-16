---
phase: 7
slug: themed-backgrounds
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-16
---

# Phase 7 — Validation Strategy

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
| 7-01-01 | 01 | 1 | THEME-01 | — | N/A | unit | `npm run test -- difficultyTheme` | ❌ W0 | ⬜ pending |
| 7-01-02 | 01 | 1 | THEME-01 | — | N/A | manual | Visual: background changes at thresholds | N/A | ⬜ pending |
| 7-01-03 | 01 | 1 | THEME-01 | — | N/A | manual | Visual: 800ms transition is smooth | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/utils/difficultyTheme.js` — pure function mapping maxOperand → theme class
- [ ] `src/utils/difficultyTheme.test.js` — unit tests for threshold bucket logic

*Existing infrastructure (vitest) covers phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Background transitions smoothly at 800ms | THEME-01 | CSS animation timing cannot be tested in jsdom | Set difficulty to cross threshold, observe transition in browser |
| All 4 themes are visually distinct | THEME-01 | Color rendering is visual | Review each theme class in browser across difficulty levels |
| Reduced-motion: transition is instant | THEME-01 | OS-level setting required | Enable prefers-reduced-motion in OS, verify no animation |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
