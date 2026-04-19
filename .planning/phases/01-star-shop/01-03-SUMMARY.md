---
phase: 01-star-shop
plan: "03"
subsystem: shop-integration
tags: [shop, integration, app, vue, composable]
status: partial  # Tasks 1 and 2 complete; Task 3 (checkpoint:human-verify) pending user sign-off

dependency_graph:
  requires: [01-01, 01-02]
  provides: [shop-entry-button, variant-src-plumbing, shop-wiring, z-collision-guard]
  affects: [src/App.vue, src/components/ScoreHeader.vue, src/components/MascotPanel.vue, src/components/ChallengeZone.vue]

tech_stack:
  patterns: [composable-singleton, fade-transition, prop-drilling, z-index-guard, watch-side-effect]

key_files:
  modified:
    - src/App.vue
    - src/components/ScoreHeader.vue
    - src/components/MascotPanel.vue
    - src/components/ChallengeZone.vue

decisions:
  - "variantSrc threaded as prop (not injected) to keep presentation components pure — no useShop() calls in child components"
  - "showShop.value = false placed first inside watch(showLevelVictory) block to ensure single-overlay invariant before sound effects fire"

metrics:
  duration: ~10 minutes
  completed_date: "2026-04-19"
  tasks_completed: 2
  tasks_pending: 1
  files_modified: 4
---

# Phase 01 Plan 03: Shop Integration Summary

**One-liner:** Wire useShop() composable + ShopOverlay into App.vue with ScoreHeader entry button, variantSrc prop plumbing to ChallengeZone/MascotPanel, and z-[200] collision guard.

## Tasks Completed

### Task 1 — ScoreHeader, MascotPanel, ChallengeZone prop/emit changes
**Commit:** `9a0364e`

**ScoreHeader.vue changes:**
- Added `'open-shop'` to `defineEmits(['toggle-mute', 'open-shop'])`
- Inserted `<button id="btn-shop" ... @click="$emit('open-shop')">🏪</button>` immediately before the mute button in the Right Controls div
- Button uses same w-11/h-11 sizing as mute button; aria-label "Open Star Shop"

**MascotPanel.vue changes:**
- Added `variantSrc: { type: String, default: null }` prop
- Changed `<img v-if="character.src" :src="character.src" ...>` to `v-if="variantSrc || character.src" :src="variantSrc || character.src"`
- All other bindings (alt, class, style, feedback classes, emoji fallback) left intact

**ChallengeZone.vue changes:**
- Added `variantSrc: { type: String, default: null }` prop (8th prop)
- Changed mascot `<img>` same way as MascotPanel — variantSrc takes precedence over character.src
- All 7 existing props retained

### Task 2 — App.vue orchestration
**Commit:** `f6014dc`

**Imports added:**
```javascript
import ShopOverlay from './components/ShopOverlay.vue'
import { useShop }       from './composables/useShop.js'
```

**Composable destructure added (after useSound):**
- `CATALOG, owned, equippedVariants, pendingUndoItem, purchaseItem, undoPurchase, equippedSrcForCharacter` from `useShop()`
- `const showShop = ref(false)`
- Handler functions: `onOpenShop`, `onCloseShop`, `onPurchaseItem(itemId)`, `onUndoPurchase`, `onUndoExpired`
- `const equippedVariantSrc = computed(() => equippedSrcForCharacter(selectedCharacter.value?.id))`

**Z-collision guard:**
- Added `showShop.value = false` as first line inside `watch(showLevelVictory, ...)` block

**Template changes:**
- `@open-shop="onOpenShop"` added to `<ScoreHeader>`
- `:variant-src="equippedVariantSrc"` added to `<ChallengeZone>`
- `<Transition name="fade"><ShopOverlay v-if="showShop" ... /></Transition>` block added before ScoreHeader

## Task 3 — Pending Checkpoint

**Status:** Awaiting human verification (checkpoint:human-verify)

The 13-step end-to-end verification checklist covers:
1. Dev server startup and character selection
2. Earning stars via math problems
3. SHOP-01: Opening shop via 🏪 button
4. SHOP-02/SHOP-07: Catalog display (20 cards, 2 columns)
5. SHOP-05: Disabled state when unaffordable
6. SHOP-03/SHOP-06: Purchase + undo flow
7. SHOP-08: Equipped indicator after finalization
8. SHOP-04: localStorage persistence across refresh
9. Undo does not persist on refresh
10. Z-collision: shop auto-closes on level victory
11. Close button behavior
12. Production build (`npm run build` exits 0)
13. Security/tampering: corrupt localStorage does not crash app

## Deviations from Plan

None — plan executed exactly as written. All edits match the specified snippets from the plan's `<action>` blocks. No new watches, no direct `stars.value` assignments, no useShop() calls in child components.

## Known Stubs

The variant PNG assets in `src/assets/variants/` are placeholder copies of existing character PNGs (per Plan 02 / Wave 2 scope). Real variant art is deferred to a future phase. This is intentional and documented — the shop works functionally with placeholder images.

## Threat Flags

No new threat surface introduced. All STRIDE mitigations from the plan's threat model are implemented:
- T-01-12: Single-timer invariant in purchaseItem (Plan 01) + disabled button in ShopItemCard (Plan 02)
- T-01-13: showShop.value = false in watch(showLevelVictory) — implemented in Task 2
- T-01-14: getStorage try/catch in useShop (Plan 01) — verified by checkpoint step 13

## Open Follow-ups (Phase 2+)

- Real variant artwork for all 20 items (currently placeholder PNGs copied from character defaults)
- Confetti animation on equip (out of scope for Phase 1)
- MascotPanel is not currently rendered anywhere in App.vue (its functionality was moved inline into ChallengeZone for mobile-first layout). The variantSrc prop was added to MascotPanel as a preparatory measure. If MascotPanel is reinstated as a desktop sidebar, it will already accept variantSrc without further changes.

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/components/ScoreHeader.vue | FOUND |
| src/components/MascotPanel.vue | FOUND |
| src/components/ChallengeZone.vue | FOUND |
| src/App.vue | FOUND |
| .planning/phases/01-star-shop/01-03-SUMMARY.md | FOUND |
| Commit 9a0364e (Task 1) | FOUND |
| Commit f6014dc (Task 2) | FOUND |
| npm run build | PASSED (built in ~1s) |
