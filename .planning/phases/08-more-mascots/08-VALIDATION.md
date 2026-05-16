---
phase: 8
slug: more-mascots
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-16
---

# Phase 8 — Validation Strategy

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
| 8-01-01 | 01 | 1 | MASCOT-01 | — | N/A | unit | `npm run test` | ✅ | ⬜ pending |
| 8-01-02 | 01 | 1 | MASCOT-01 | — | N/A | manual | Visual: locked chars greyed, unlock badge shows | N/A | ⬜ pending |
| 8-02-01 | 02 | 2 | MASCOT-01 | — | N/A | unit | `npm run test` | ✅ | ⬜ pending |
| 8-02-02 | 02 | 2 | MASCOT-01 | — | N/A | manual | Visual: all 10 chars in grid, theme music on select | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure (vitest) covers all phase requirements. No new test files need scaffolding before execution — tests extend the existing useMathGame.test.js or add a new CharacterSelect-focused test inline.

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Locked characters appear greyed-out with star badge | MASCOT-01 | DOM rendering in jsdom doesn't reflect visual CSS states | Open app with 0 stars; verify new chars show lock overlay |
| Characters unlock at correct thresholds in live app | MASCOT-01 | Requires real star count manipulation | Use localStorage to set emma-stars to 25/50/75/100/150/200 and verify each char unlocks |
| BGM plays correct theme on character select | MASCOT-01 | Audio API not available in jsdom | Select each new character, verify music plays |
| Grid displays 2 rows of 5 on desktop | MASCOT-01 | CSS layout is visual | Open at ≥768px width, verify grid-cols-5 layout |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
