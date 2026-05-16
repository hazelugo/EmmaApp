---
phase: 1
slug: star-shop
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-17
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vite.config.js / vitest.config.js |
| **Quick run command** | `npm run test -- --run` |
| **Full suite command** | `npm run test -- --run && npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --run`
- **After every plan wave:** Run `npm run test -- --run && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | SHOP-01 | — | N/A | unit | `npm run test -- --run` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | SHOP-02 | — | Stars deducted only if balance sufficient | unit | `npm run test -- --run` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | SHOP-03 | — | localStorage writes only after finalize | unit | `npm run test -- --run` | ❌ W0 | ⬜ pending |
| 1-01-04 | 01 | 1 | SHOP-04 | — | Blocked when stars < price | unit | `npm run test -- --run` | ❌ W0 | ⬜ pending |
| 1-01-05 | 01 | 1 | SHOP-05 | — | N/A | unit | `npm run test -- --run` | ❌ W0 | ⬜ pending |
| 1-01-06 | 01 | 1 | SHOP-06 | — | N/A | unit | `npm run test -- --run` | ❌ W0 | ⬜ pending |
| 1-01-07 | 01 | 1 | SHOP-07 | — | N/A | unit | `npm run test -- --run` | ❌ W0 | ⬜ pending |
| 1-01-08 | 01 | 1 | SHOP-08 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/composables/__tests__/useShop.test.js` — stubs for SHOP-01 through SHOP-07
- [ ] Vitest already present — no new framework install needed

*Existing test infrastructure assumed; Wave 0 adds shop-specific test stubs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 10-second undo toast countdown visible | SHOP-02 | Timer UX requires visual inspection | Open shop, purchase item, confirm toast appears and counts down to 0 |
| Undo restores star balance correctly | SHOP-02 | Requires live interaction | Purchase item, tap Undo within 10s, verify star balance restored |
| ShopOverlay renders in game UI | SHOP-01 | Requires browser render | Open app, tap shop icon, verify overlay appears over game |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
