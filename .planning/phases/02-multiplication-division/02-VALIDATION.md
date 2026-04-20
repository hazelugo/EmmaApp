---
phase: 2
slug: multiplication-division
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-20
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vite.config.js (or vitest.config.js if installed in Wave 0) |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | MATH-01 | — | N/A | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | MATH-01 | — | N/A | unit | `npx vitest run` | ✅ | ⬜ pending |
| 02-01-03 | 01 | 1 | MATH-02 | — | N/A | unit | `npx vitest run` | ✅ | ⬜ pending |
| 02-01-04 | 01 | 2 | MATH-03 | — | N/A | unit | `npx vitest run` | ✅ | ⬜ pending |
| 02-02-01 | 02 | 2 | MATH-02 | — | N/A | unit | `npx vitest run` | ✅ | ⬜ pending |
| 02-02-02 | 02 | 2 | MATH-03 | — | N/A | unit | `npx vitest run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/composables/__tests__/useMathGame.test.js` — stubs for MATH-01, MATH-02, MATH-03
- [ ] vitest installed if not already present (`npm install -D vitest`)

*Wave 0 installs test infrastructure before functional implementation begins.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Tutorial overlay fades visibly for × operator | MATH-01 | CSS Transition visual check | Reach level 3, confirm fade-in overlay appears, dismiss, confirm fade-out |
| Tutorial overlay fades visibly for ÷ operator | MATH-02 | CSS Transition visual check | Reach level 5, confirm fade-in overlay appears, dismiss, confirm fade-out |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
