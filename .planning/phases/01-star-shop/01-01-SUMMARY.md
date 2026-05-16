---
phase: 01-star-shop
plan: 01
subsystem: shop
tags: [shop, composable, localstorage, assets, variants]
one_liner: "20 placeholder variant PNGs + useShop.js composable with 20-item frozen catalog, optimistic purchase/undo, and localStorage persistence"
completed_date: "2026-04-19T14:36:29Z"
duration_minutes: 15
tasks_completed: 2
tasks_total: 2
files_created: 23
files_modified: 0

dependency_graph:
  requires: []
  provides:
    - src/composables/useShop.js (useShop export)
    - src/assets/variants/*.png (20 placeholder PNGs)
    - scripts/generate-variant-placeholders.sh (idempotent PNG generator)
  affects:
    - Plan 02 (ShopOverlay, ShopItemCard, UndoToast — consume useShop contract)
    - Plan 03 (App.vue wiring + checkpoint verification)

tech_stack:
  added:
    - import.meta.glob (Vite eager glob for variant PNG asset resolution)
  patterns:
    - Singleton composable pattern (module-level ref state, mirroring useMathGame.js)
    - Optimistic purchase with 10-second undo window and delta rollback
    - localStorage read on module load, write only in finalizePurchase

key_files:
  created:
    - src/composables/useShop.js
    - scripts/generate-variant-placeholders.sh
    - src/assets/variants/.gitkeep
    - src/assets/variants/peach-{default,blue,green,purple,yellow}.png
    - src/assets/variants/daisy-{default,blue,green,purple,yellow}.png
    - src/assets/variants/rosalina-{default,blue,green,purple,yellow}.png
    - src/assets/variants/toad-{default,blue,green,purple,yellow}.png
  modified: []

decisions:
  - "Used delta rollback (starsRef.value += price) not snapshot per D-08/Pitfall 2 — gameplay earns stars during undo window"
  - "Single undoTimer invariant: purchaseItem finalizes any pending prior purchase before starting a new undo window"
  - "Default variants always reported as owned without localStorage persistence per D-09"
  - "finalizePurchase is the sole localStorage write site (both emma-shop-owned and emma-shop-equipped)"
  - "import.meta.glob with eager:true used instead of 20 static imports per Pitfall 3"
---

# Phase 01 Plan 01: Star Shop Foundation Summary

Foundation assets and composable for the Star Shop feature: 20 placeholder variant PNGs and a fully-implemented `useShop.js` singleton composable covering catalog, purchase flow with 10-second undo, and localStorage persistence.

## Tasks Completed

| # | Name | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Generate 20 placeholder variant PNGs and generator script | c04acab | scripts/generate-variant-placeholders.sh, src/assets/variants/*.png (21 files) |
| 2 | Create useShop.js composable | 0d1be89 | src/composables/useShop.js |

## Artifact Details

### 20 Placeholder PNG Filenames and Source Mapping

| Character | Source PNG | Variant Files Produced |
|-----------|-----------|------------------------|
| peach | src/assets/mascot.png | peach-default.png, peach-blue.png, peach-green.png, peach-purple.png, peach-yellow.png |
| daisy | src/assets/daisy.png | daisy-default.png, daisy-blue.png, daisy-green.png, daisy-purple.png, daisy-yellow.png |
| rosalina | src/assets/rosalina.png | rosalina-default.png, rosalina-blue.png, rosalina-green.png, rosalina-purple.png, rosalina-yellow.png |
| toad | src/assets/toad.png | toad-default.png, toad-blue.png, toad-green.png, toad-purple.png, toad-yellow.png |

### CATALOG Structure

- 20 items total: 4 characters × 5 variants
- Price distribution: 4 items at price 0 (defaults), 16 items at price 15
- ID scheme: `${characterId}-${variantId}` (e.g., `peach-blue`, `toad-default`)
- colorName mapping: Classic (default), Ocean (blue), Forest (green), Royal (purple), Sunny (yellow)
- src: Vite-resolved URL via `import.meta.glob('../assets/variants/*.png', { eager: true, import: 'default' })`

### localStorage Key Contracts

| Key | Shape | When Written | When Read |
|-----|-------|-------------|-----------|
| `emma-shop-owned` | `string[]` — array of non-default item ids (e.g., `["peach-blue","toad-green"]`) | Only in `finalizePurchase` after 10s timer fires | Module load via `getStorage` with fallback `[]` |
| `emma-shop-equipped` | `Record<string,string>` — `{ characterId: itemId }` map (e.g., `{"peach":"peach-blue"}`) | Only in `finalizePurchase` after 10s timer fires | Module load via `getStorage` with fallback `{}` |

### Exported Composable Surface

```javascript
export function useShop(): {
  CATALOG:                  readonly CatalogItem[20],   // frozen, module-level
  owned:                    Ref<string[]>,              // module-level singleton
  equippedVariants:         Ref<Record<string,string>>, // module-level singleton
  pendingUndoItem:          ComputedRef<CatalogItem|null>,
  isOwned:                  (itemId: string) => boolean, // true for any '-default' item
  isEquipped:               (itemId: string) => boolean,
  purchaseItem:             (itemId: string, starsRef: Ref<number>) => void,
  undoPurchase:             (starsRef: Ref<number>) => void,
  equippedSrcForCharacter:  (characterId: string) => string | null,
}
```

**Key invariants:**
- `isOwned(id)` short-circuits true for any item where `variantId === 'default'` OR `price === 0`
- `purchaseItem` guards `if (starsRef.value < item.price) return` before any mutation
- Only one undo window active at a time; a second purchase finalizes the first
- `undoPurchase` never writes localStorage; only `finalizePurchase` does
- Stars rollback is delta (`+= price`), not snapshot — allows earning during undo window

## Verification

- `npm run build` exits 0 (confirmed)
- `ls src/assets/variants/*.png | wc -l` = 20 (confirmed)
- Script is executable and idempotent (confirmed via double-run)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| Placeholder PNGs (character source copied for all variants) | src/assets/variants/*.png | D-05: real variant art to be provided by designer in a future phase; placeholder enables Vite glob resolution and build pipeline now |

These stubs do NOT block the plan goal — the Vite glob resolves valid URLs for all 20 items, CATALOG.src is populated, and `npm run build` succeeds. The visual difference (same art for all variants) is intentional and documented.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes beyond the localStorage keys already in the plan's threat model.

## Self-Check: PASSED

- `src/composables/useShop.js` exists: FOUND
- `scripts/generate-variant-placeholders.sh` exists: FOUND
- `src/assets/variants/.gitkeep` exists: FOUND
- 20 variant PNGs exist: FOUND (count = 20)
- Commit c04acab (Task 1): FOUND
- Commit 0d1be89 (Task 2): FOUND
- `npm run build` exits 0: CONFIRMED
