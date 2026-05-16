# Phase 1: Star Shop - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

A shop overlay where players spend earned stars on cosmetic mascot color variants. Single-tap purchase, 10-second undo window, localStorage persistence. Accessible from the main game screen via ScoreHeader. Tier-1 items only (mascot color variants) — no gameplay-affecting items.

</domain>

<decisions>
## Implementation Decisions

### Shop Entry Point
- **D-01:** Shop button lives in `ScoreHeader.vue` next to the coin/star count — a shop icon (🏪 or bag icon) emitting `@open-shop` upward to `App.vue`.

### Item Layout
- **D-02:** Shop overlay displays items in a **2-per-row grid of cards**. Each card shows: character variant preview image, color name, star price, and lock/equipped state. Cards must be ≥60px touch targets (6-year-old rule).

### Color Variant Assets
- **D-03:** Color variants are **separate PNG files** per variant (not CSS filters). Placeholder PNGs are acceptable for this phase — real art drops in later without code changes.
- **D-04:** Shop offers **5 color variants × all 4 characters = 20 items total**. Each variant is a distinct PNG in `src/assets/variants/` (e.g., `peach-blue.png`, `daisy-purple.png`).
- **D-05:** Placeholder PNG generation is in scope for this phase (script or simple solid-color images). Final art is out of scope.

### Post-Purchase UX
- **D-06:** Purchase is **immediate and optimistic** — item equips instantly on tap, character updates to new variant right away.
- **D-07:** A **10-second undo toast appears inside the shop overlay** (bottom of overlay). If user taps undo within 10s, purchase reverses, stars restored, previous variant re-equipped.
- **D-08:** Shop **stays open** after purchase and after undo window expires. Player closes manually via X button.
- **D-09:** No purchase confirmation dialog — the undo window replaces it.

### State & Persistence
- **D-10:** New `useShop.js` composable manages: item catalog, purchased items, currently equipped variant per character. `App.vue` destructures it.
- **D-11:** localStorage keys: `emma-shop-owned` (JSON array of owned item IDs), `emma-shop-equipped` (JSON object: `{ characterId: variantId }`).
- **D-12:** Stars are deducted via a function exposed from `useMathGame.js` (or direct mutation of the `stars` ref — planner's discretion). Shop cannot push stars negative (SHOP-05: button disabled when unaffordable).
- **D-13:** Equipped variant is passed as a prop to `MascotPanel.vue` so the character sprite updates live during gameplay.

### Equipped State Display (SHOP-08)
- **D-14:** Equipped item card shows a visible "✓ Equipped" badge or checkmark overlay. Owned-but-not-equipped items show "Owned". Unaffordable items show the star price in a dimmed/locked state.

### Claude's Discretion
- Shop overlay visual design (colors, header, close button placement) — follow established overlay patterns from `CharacterSelect.vue` and `LevelUpModal.vue`
- Exact star prices for each variant (reasonable values like 10–25 stars)
- Specific placeholder PNG generation approach (script, solid-color, etc.)
- Animation for equipping a new variant (brief pop or fade acceptable)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — SHOP-01 through SHOP-08 are the acceptance criteria for this phase

### Codebase Patterns
- `.planning/codebase/CONVENTIONS.md` — naming conventions, component patterns, import style
- `.planning/codebase/ARCHITECTURE.md` — data flow, overlay pattern, composable singleton pattern
- `.planning/codebase/STRUCTURE.md` — where to add new files (components, composables, assets)

### Character Definitions
- `.planning/codebase/CHARACTER-THEMES-SPEC.md` — existing character IDs, asset paths, color tokens (Peach, Daisy, Rosalina, Toad)
- `src/components/CharacterSelect.vue` — character object shape `{ id, name, src, bg, border, icon }` that shop variants extend

### Existing Overlay Pattern (read before building ShopOverlay)
- `src/components/CharacterSelect.vue` — full-screen overlay with fade Transition, z-200
- `src/components/LevelUpModal.vue` — full-screen overlay with internal state management

### State Integration
- `src/composables/useMathGame.js` — `stars` ref to deduct from on purchase
- `src/composables/useSound.js` — sound pattern for purchase SFX (optional)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CharacterSelect.vue`: Full-screen overlay pattern (fixed inset-0, z-200, fade Transition) — `ShopOverlay.vue` should follow this exact pattern
- `LevelUpModal.vue`: Internal overlay state management pattern
- `useMathGame.js`: `stars` ref (reactive) and `streak` ref for reference on how to structure `useShop.js`
- Tailwind `@theme` tokens: `star-gold`, `mario-red`, `pipe`, `coin`, `peach`, `daisy`, `rosalina` — use these for shop UI

### Established Patterns
- Overlay: `v-if="showShop"` in `App.vue` + `<Transition name="fade"><ShopOverlay /></Transition>`
- Composable: `export function useShop()` in `src/composables/useShop.js`, returning flat object of refs + functions
- localStorage: `emma-*` key prefix, `|| defaultValue` fallback on read, write on every state change
- Props: `defineProps({ prop: { type: Type, required: true/default: val } })`
- Touch targets: ≥60px height/width on all tappable elements

### Integration Points
- `App.vue`: import + destructure `useShop()`, wire `@open-shop` from `ScoreHeader`, pass equipped variant to `MascotPanel`
- `ScoreHeader.vue`: add shop icon button, emit `@open-shop`
- `MascotPanel.vue`: accept new prop for variant src override (or the whole variant object)

</code_context>

<specifics>
## Specific Ideas

- 20 total shop items: 5 color variants × 4 characters (Peach, Daisy, Rosalina, Toad)
- Placeholder PNGs are fine for launch — drop-in replacement when real art is ready
- Shop overlay should feel like the existing overlays: same z-index layer, same fade animation
- "10-second undo" toast at the bottom of the shop, auto-dismisses, can be tapped to undo

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-star-shop*
*Context gathered: 2026-04-17*
