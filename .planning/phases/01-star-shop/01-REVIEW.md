---
phase: 01-star-shop
reviewed: 2026-04-19T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - scripts/generate-variant-placeholders.sh
  - src/App.vue
  - src/components/ChallengeZone.vue
  - src/components/MascotPanel.vue
  - src/components/ScoreHeader.vue
  - src/components/ShopItemCard.vue
  - src/components/ShopOverlay.vue
  - src/components/UndoToast.vue
  - src/composables/useShop.js
findings:
  critical: 0
  warning: 4
  info: 4
  total: 8
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-19
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

The Star Shop feature is well-structured. The composable correctly isolates shop state at module scope (single instance), the optimistic-purchase + 10-second undo pattern is cleanly implemented, and all components have sensible prop validation. No security vulnerabilities or data-loss bugs were found.

Four warnings were identified — three logic/correctness issues and one missing persistence path — plus four informational items. The most impactful is the undo countdown/timer desync between `UndoToast` and `useShop`, which can allow a second purchase to silently finalize the first without the undo toast counting down to zero in the UI.

---

## Warnings

### WR-01: Undo toast countdown desync — new purchase silently expires previous toast

**File:** `src/composables/useShop.js:123-128`

**Issue:** When a second purchase is made while a prior undo window is still open, `purchaseItem` immediately calls `finalizePurchase` for the prior item (line 127), then clears `pendingUndoItemId` and starts a new undo window for the new item. The `UndoToast` component owns its own `countdown` ref and `setInterval`; when `active` flips false-then-true rapidly (old item gone, new item set), the watch re-triggers `startCountdown`. This works, but there is a window where `pendingUndoItemId` is set to `null` mid-tick and then immediately set to the new itemId in the same synchronous block, potentially causing one extra render cycle where the toast flashes. More importantly: if the prior undo window's `setTimeout` fires at the exact same tick as the new purchase, `finalizePurchase` can be called twice for the prior item (once via `purchaseItem` and once via the still-queued `undoTimer` callback). The `clearTimeout` on line 125 guards against this for timers still pending — but if the timer fires between the `clearTimeout` call and the `finalizePurchase` call in an async context they could theoretically race. In a browser single-threaded environment this is safe, but the `undoTimer` variable is module-level mutable state (not enclosed per-call), so concurrent calls from two rapid taps could corrupt it.

**Fix:** Capture and clear `undoTimer` atomically before calling `finalizePurchase`:

```js
function purchaseItem (itemId, starsRef) {
  const item = CATALOG.find(i => i.id === itemId)
  if (!item) return

  if (isOwned(itemId)) {
    equippedVariants.value = { ...equippedVariants.value, [item.characterId]: itemId }
    setStorage('emma-shop-equipped', equippedVariants.value)
    return
  }

  if (starsRef.value < item.price) return

  // Atomically clear the timer BEFORE calling finalizePurchase
  if (undoTimer !== null) {
    clearTimeout(undoTimer)
    undoTimer = null
  }
  if (pendingUndo) {
    const prior = pendingUndo
    pendingUndo = null          // clear before finalize to prevent re-entry
    finalizePurchase(prior.itemId, starsRef)
  }
  // ... rest unchanged
}
```

---

### WR-02: `undoPurchase` does not persist updated `equippedVariants` to localStorage

**File:** `src/composables/useShop.js:163-181`

**Issue:** `undoPurchase` correctly restores `starsRef.value` and calls `setStorage('emma-stars', ...)`, and it correctly restores `equippedVariants.value`. However, it never calls `setStorage('emma-shop-equipped', equippedVariants.value)` after updating it. If the user refreshes immediately after tapping UNDO, the equipped state will revert to what was written during the optimistic purchase, not to the rolled-back state.

**Fix:** Add the missing `setStorage` call before clearing `pendingUndo`:

```js
function undoPurchase (starsRef) {
  if (!pendingUndo) return
  clearTimeout(undoTimer)
  undoTimer = null

  starsRef.value += pendingUndo.price
  setStorage('emma-stars', starsRef.value)

  const next = { ...equippedVariants.value }
  if (pendingUndo.prevEquipped) {
    next[pendingUndo.characterId] = pendingUndo.prevEquipped
  } else {
    delete next[pendingUndo.characterId]
  }
  equippedVariants.value = next
  setStorage('emma-shop-equipped', equippedVariants.value)  // ← add this

  pendingUndo = null
  pendingUndoItemId.value = null
}
```

---

### WR-03: `MascotPanel` is imported-but-unused dead code path

**File:** `src/components/MascotPanel.vue:1`

**Issue:** `MascotPanel.vue` exists and accepts `feedback`, `character`, and `variantSrc` props, identical to the mascot rendering block inside `ChallengeZone.vue`. The component is not imported or used in `App.vue` or any other file in the reviewed set. The comment in `ChallengeZone.vue` line 27 reads "moved from MascotPanel so it shows on mobile," confirming the panel was superseded. If the component remains it will be bundled if accidentally re-imported, and it creates maintenance confusion.

**Fix:** Delete `src/components/MascotPanel.vue` once confirmed it is not referenced anywhere else in the project. Verify with:
```bash
grep -r "MascotPanel" src/
```
If the grep returns no results, the file is safe to remove.

---

### WR-04: `UndoToast` emits `expired` but never resets `countdown` to a non-zero value on unmount

**File:** `src/components/UndoToast.vue:25-28`

**Issue:** When `countdown.value` reaches `0`, `stopCountdown()` is called and `expired` is emitted. The `countdown` ref is left at `0`. If the component becomes active again (a new purchase starts a new undo window), `startCountdown` resets it to `10` correctly — so the displayed value is fine. However, if the component is briefly shown while `countdown` is `0` (e.g., a race between `active` going false and the next render), the user will momentarily see "(0s)" before the new countdown starts. The `v-if="active"` guard in the template mitigates this because the DOM element is removed when inactive. This is low-probability but worth noting.

**Fix:** Reset `countdown.value = 10` inside `stopCountdown` so the ref never rests at `0`:

```js
function stopCountdown () {
  if (interval !== null) {
    clearInterval(interval)
    interval = null
  }
  countdown.value = 10  // always reset so stale "0s" is never briefly visible
}
```

---

## Info

### IN-01: Module-level mutable `undoTimer` and `pendingUndo` are not reactive

**File:** `src/composables/useShop.js:74-75`

**Issue:** `undoTimer` and `pendingUndo` are plain module-level `let` variables, not `ref`s. This is intentional — they are internal bookkeeping, not template-bound. The pattern is fine, but it means they are shared across all callers of `useShop()` (which is already the explicit design intent per the JSDoc). The comment on line 70 documents this. No action required unless the composable is ever multi-instantiated.

---

### IN-02: `ShopItemCard` `aria-disabled` is redundant when `disabled` attribute is set

**File:** `src/components/ShopItemCard.vue:47`

**Issue:** The `<button>` has both `:disabled="!isInteractive"` and `:aria-disabled="!isInteractive ? 'true' : 'false'"`. When a native `<button disabled>` attribute is present, assistive technologies already treat it as disabled. The `aria-disabled` attribute is useful on non-button elements or when you want to keep the element focusable while marking it semantically disabled — but on a `<button>` with `disabled`, the `aria-disabled` attribute is at best redundant and at worst contradictory (if the button is disabled but `aria-disabled="false"` were set by mistake). Consider removing `aria-disabled` and relying solely on the native `disabled` attribute.

**Fix:** Remove the `aria-disabled` binding:
```html
<button
  type="button"
  ...
  :disabled="!isInteractive"
  @click="onTap"
>
```

---

### IN-03: `generate-variant-placeholders.sh` has no guard for missing source files

**File:** `scripts/generate-variant-placeholders.sh:13`

**Issue:** The script uses `set -euo pipefail`, so it will abort on error. If any source PNG (`src/assets/mascot.png`, `daisy.png`, `rosalina.png`, `toad.png`) is missing, the script exits immediately mid-copy with a terse error. For a one-time setup script this is acceptable, but there is no pre-flight check or user-friendly message. A developer running this before assets are in place will see `cp: src/assets/daisy.png: No such file or directory` with no guidance.

**Fix (optional):** Add a pre-flight existence check at the top:
```bash
for src in src/assets/mascot.png src/assets/daisy.png src/assets/rosalina.png src/assets/toad.png; do
  [ -f "$src" ] || { echo "ERROR: missing $src — add source art before running this script."; exit 1; }
done
```

---

### IN-04: `ShopOverlay` `CHARACTER_NAMES` lookup duplicates data already in the catalog

**File:** `src/components/ShopOverlay.vue:18-23`

**Issue:** `CHARACTER_NAMES` is a hardcoded object inside `ShopOverlay.vue` mapping character IDs to display names. The catalog items (passed in as the `catalog` prop) contain `characterId` but not a display name — that lookup table must be kept in sync manually if new characters are added. Consider deriving display names from the catalog or passing them in via a separate `characters` prop (from the character selection data), so there is a single source of truth.

---

_Reviewed: 2026-04-19_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
