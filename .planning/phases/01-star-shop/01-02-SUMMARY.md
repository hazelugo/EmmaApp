---
phase: 01-star-shop
plan: 02
subsystem: shop-components
tags: [shop, components, vue, overlay, ui, tailwind]
dependency_graph:
  requires: ["01-01"]
  provides: ["ShopItemCard.vue", "UndoToast.vue", "ShopOverlay.vue"]
  affects: ["src/App.vue (Plan 03 wires these in)"]
tech_stack:
  added: []
  patterns:
    - "defineProps object syntax (CONVENTIONS.md)"
    - "script setup SFC order: script → template → style"
    - "scoped fade transition in UndoToast (undo-fade)"
    - "global fade transition in ShopOverlay (unscoped <style>)"
    - "setInterval countdown with onUnmounted cleanup"
    - "watch on prop active for timer lifecycle"
key_files:
  created:
    - src/components/ShopItemCard.vue
    - src/components/UndoToast.vue
    - src/components/ShopOverlay.vue
  modified: []
decisions:
  - "OPTION A (global unscoped <style>) adopted in ShopOverlay.vue for .fade-* classes so App.vue's <Transition name=\"fade\"> can resolve them"
  - "UndoToast uses its own scoped undo-fade transition (not the global fade) to keep toast entrance/exit separate from overlay-level fading"
  - "ShopItemCard isInteractive computed: equipped items are non-interactive (no emit) — already equipped means no further action needed; owned-not-equipped items emit purchase so parent can re-equip at zero cost via composable"
metrics:
  duration: "106s"
  completed: "2026-04-19"
  tasks_completed: 3
  files_created: 3
  files_modified: 0
---

# Phase 01 Plan 02: Shop Components Summary

Three pure-presentation Vue components for the Star Shop UI: tappable item card, countdown undo toast, and full-screen overlay. No composable calls inside components — all state flows in via props, all user actions flow out via emits.

## Prop / Emit Contracts (authoritative for Plan 03)

### ShopItemCard.vue

**Props:**
```javascript
defineProps({
  item:       { type: Object,  required: true }, // CatalogItem: { id, characterId, variantId, colorName, price, src }
  isOwned:    { type: Boolean, default: false },
  isEquipped: { type: Boolean, default: false },
  canAfford:  { type: Boolean, default: false },
})
```

**Emits:**
```javascript
defineEmits(['purchase'])
// emit('purchase', item.id) — fired only when isInteractive is true
// isInteractive = !isEquipped && (isOwned || canAfford)
```

**State treatments:**
- Equipped: `ring-4 ring-star-gold` + `✓ Equipped` gold badge (no emit on tap)
- Owned not equipped: `Owned` amber badge (emits purchase to allow re-equip)
- Affordable not owned: `⭐ {price}` gold badge (emits purchase)
- Unaffordable not owned: `opacity-50 cursor-not-allowed` + `⭐ {price}` dark badge + `disabled` + `aria-disabled="true"` (no emit)

---

### UndoToast.vue

**Props:**
```javascript
defineProps({
  active:   { type: Boolean, default: false },
  itemName: { type: String,  default: '' },   // e.g. "Ocean Princess Peach"
})
```

**Emits:**
```javascript
defineEmits(['undo', 'expired'])
// emit('undo')    — user tapped UNDO button; countdown stopped
// emit('expired') — 10s elapsed; countdown stopped
```

**Lifecycle:** `watch(() => props.active, ...)` restarts countdown each time `active` flips `false → true`. `onUnmounted(stopCountdown)` prevents interval leaks.

---

### ShopOverlay.vue

**Props:**
```javascript
defineProps({
  stars:            { type: Number,  required: true },
  catalog:          { type: Array,   required: true }, // CatalogItem[]
  owned:            { type: Array,   required: true }, // string[] of owned item IDs
  equippedVariants: { type: Object,  required: true }, // { characterId: itemId }
  pendingUndoItem:  { type: Object,  default: null  }, // CatalogItem | null
})
```

**Emits:**
```javascript
defineEmits(['close', 'purchase', 'undo', 'expired'])
// emit('close')          — X button tapped
// emit('purchase', id)   — card purchase bubbled up
// emit('undo')           — UndoToast undo bubbled up
// emit('expired')        — UndoToast expired bubbled up
```

**App.vue usage (Plan 03):**
```html
<Transition name="fade">
  <ShopOverlay
    v-if="showShop"
    :stars="stars"
    :catalog="CATALOG"
    :owned="owned"
    :equipped-variants="equippedVariants"
    :pending-undo-item="pendingUndoItem"
    @close="showShop = false"
    @purchase="onPurchaseItem"
    @undo="onUndoPurchase"
    @expired="onExpiredUndo"
  />
</Transition>
```

---

## Tailwind Utility Classes Used

| Class | Source | Usage |
|-------|--------|-------|
| `block-border` | `src/style.css` utility | Card border, overlay header, toast border |
| `btn-press` | `src/style.css` utility | All tappable buttons |
| `bg-star-gold` | `@theme` token | Equipped badge, affordable price badge, equipped ring |
| `bg-mario-red` | `@theme` token | Overlay header, UNDO button |
| `bg-coin` | `@theme` token | Owned-not-equipped badge |
| `bg-mushroom-white` | `@theme` token | Card background, header close button |
| `bg-sky` | `@theme` token | Overlay root background |
| `bg-dark` | `@theme` token | Unaffordable badge, toast background |
| `text-dark` | `@theme` token | Card text |
| `text-mushroom-white` | `@theme` token | Overlay header text, toast text |
| `text-star-gold` | `@theme` token | Star balance in overlay header |
| `ring-star-gold` | `@theme` token | Equipped card ring highlight |
| `z-[200]` | Tailwind arbitrary | Overlay root (matches CharacterSelect tier) |
| `z-[210]` | Tailwind arbitrary | UndoToast (above overlay) |
| `min-h-[60px] min-w-[60px]` | Tailwind arbitrary | ShopItemCard touch target |

---

## Fade Transition Approach

**OPTION A adopted** — `ShopOverlay.vue` contains an unscoped `<style>` block defining all 6 global `.fade-*` classes:

```css
.fade-enter-active, .fade-leave-active { transition: opacity 300ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-to, .fade-leave-from { opacity: 1; }
```

These classes are globally visible so `<Transition name="fade">` in App.vue resolves them when wrapping `<ShopOverlay>`. This mirrors the existing pattern confirmed by PATTERNS.md note 3: no global `.fade-*` was found in `style.css`, meaning the overlay is responsible for defining them.

UndoToast uses a separate scoped `undo-fade` transition to avoid coupling with the overlay-level fade.

---

## Deviations from Plan

None — plan executed exactly as written. All component code follows the exact templates specified in the plan's `<action>` blocks.

---

## Requirements Addressed

| Requirement | Description | How Addressed |
|-------------|-------------|---------------|
| SHOP-02 | Display items with costs | ShopItemCard shows price badge with ⭐ cost |
| SHOP-05 | Disabled when unaffordable | opacity-50 + disabled + aria-disabled on non-affordable cards |
| SHOP-06 | Undo UI | UndoToast with 10s countdown and UNDO button |
| SHOP-07 | 5+ items rendered | ShopOverlay renders full catalog (20 items) via v-for |
| SHOP-08 | Equipped state badge | "✓ Equipped" badge with gold ring on equipped cards |

---

## Known Stubs

None — all components render live data from props. No hardcoded placeholder values or TODO markers.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes. Components are pure presentation with no side effects.

## Self-Check: PASSED

- `src/components/ShopItemCard.vue` — FOUND (81 lines)
- `src/components/UndoToast.vue` — FOUND (86 lines)
- `src/components/ShopOverlay.vue` — FOUND (125 lines)
- Commit f43625e (ShopItemCard) — FOUND
- Commit 25ac679 (UndoToast) — FOUND
- Commit f3fd055 (ShopOverlay) — FOUND
- `npm run build` — exits 0
