# Phase 01: Star Shop - Research

**Researched:** 2026-04-17
**Domain:** Vue 3 Composition API, localStorage persistence, overlay/composable patterns, in-game shop UX
**Confidence:** HIGH

## Summary

This is a greenfield Vue 3 feature built entirely within an established codebase that already has clear, opinionated patterns. No new dependencies are required — the shop is built using existing Tailwind CSS tokens, the existing overlay pattern from `CharacterSelect.vue`, and a new `useShop.js` composable modeled after `useMathGame.js`.

The central challenge is not technical novelty but precise integration: `stars` lives in `useMathGame.js` and must be decremented by the shop; `MascotPanel.vue` must receive the equipped variant src override; and the undo window requires a careful `setTimeout`/`clearTimeout` pattern with optimistic state rollback.

Twenty total shop items (5 color variants × 4 characters) are seeded as a static catalog inside `useShop.js`. Placeholder PNGs in `src/assets/variants/` make the feature testable immediately, with real art as a drop-in replacement later.

**Primary recommendation:** Follow the `CharacterSelect.vue` overlay pattern exactly. Mirror the `useMathGame.js` composable structure. Expose a `deductStars(n)` function from `useMathGame.js` (or directly mutate via the returned ref) for star spending. Write localStorage on purchase-finalize (after 10s), not on optimistic equip.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Shop button lives in `ScoreHeader.vue` next to the coin/star count — a shop icon (🏪 or bag icon) emitting `@open-shop` upward to `App.vue`.
- **D-02:** Shop overlay displays items in a **2-per-row grid of cards**. Each card shows: character variant preview image, color name, star price, and lock/equipped state. Cards must be ≥60px touch targets (6-year-old rule).
- **D-03:** Color variants are **separate PNG files** per variant (not CSS filters). Placeholder PNGs are acceptable for this phase — real art drops in later without code changes.
- **D-04:** Shop offers **5 color variants × all 4 characters = 20 items total**. Each variant is a distinct PNG in `src/assets/variants/` (e.g., `peach-blue.png`, `daisy-purple.png`).
- **D-05:** Placeholder PNG generation is in scope for this phase (script or simple solid-color images). Final art is out of scope.
- **D-06:** Purchase is **immediate and optimistic** — item equips instantly on tap, character updates to new variant right away.
- **D-07:** A **10-second undo toast appears inside the shop overlay** (bottom of overlay). If user taps undo within 10s, purchase reverses, stars restored, previous variant re-equipped.
- **D-08:** Shop **stays open** after purchase and after undo window expires. Player closes manually via X button.
- **D-09:** No purchase confirmation dialog — the undo window replaces it.
- **D-10:** New `useShop.js` composable manages: item catalog, purchased items, currently equipped variant per character. `App.vue` destructures it.
- **D-11:** localStorage keys: `emma-shop-owned` (JSON array of owned item IDs), `emma-shop-equipped` (JSON object: `{ characterId: variantId }`).
- **D-12:** Stars are deducted via a function exposed from `useMathGame.js` (or direct mutation of the `stars` ref — planner's discretion). Shop cannot push stars negative (SHOP-05: button disabled when unaffordable).
- **D-13:** Equipped variant is passed as a prop to `MascotPanel.vue` so the character sprite updates live during gameplay.
- **D-14:** Equipped item card shows a visible "✓ Equipped" badge or checkmark overlay. Owned-but-not-equipped items show "Owned". Unaffordable items show the star price in a dimmed/locked state.

### Claude's Discretion
- Shop overlay visual design (colors, header, close button placement) — follow established overlay patterns from `CharacterSelect.vue` and `LevelUpModal.vue`
- Exact star prices for each variant (reasonable values like 10–25 stars)
- Specific placeholder PNG generation approach (script, solid-color, etc.)
- Animation for equipping a new variant (brief pop or fade acceptable)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SHOP-01 | Player can open a Star Shop from the main game screen | D-01: Shop button in ScoreHeader emits `@open-shop`; `showShop` ref in `App.vue` controls overlay visibility |
| SHOP-02 | Star Shop displays available items with their star costs | D-02/D-04: 20 items in 2-per-row grid; catalog defined in `useShop.js` with prices |
| SHOP-03 | Player can purchase items using earned stars (stars deducted on purchase) | D-06/D-12: Optimistic purchase; `stars.value -= price` via `useMathGame.js` ref mutation |
| SHOP-04 | Purchased items persist across browser refreshes (localStorage) | D-11: `emma-shop-owned` and `emma-shop-equipped` JSON keys; written after 10s undo window |
| SHOP-05 | Player cannot purchase items they cannot afford (button disabled) | D-12: Computed `canAfford` check; card button disabled + `aria-disabled` when `stars < item.price` |
| SHOP-06 | Purchase supports a 10-second undo window before finalizing | D-07/D-09: `setTimeout` 10s → finalize; `clearTimeout` on undo tap; rollback stars + variant |
| SHOP-07 | At least 5 Tier-1 items are available (e.g., mascot color variants) | D-04: 20 items (5 variants × 4 characters); placeholder PNGs in `src/assets/variants/` |
| SHOP-08 | Active/equipped item is visually indicated in the shop | D-14: "✓ Equipped" badge on equipped card; "Owned" badge on owned-not-equipped cards |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Shop state (owned, equipped) | Composable (`useShop.js`) | `App.vue` (orchestration) | All game state lives in composables per established pattern; `App.vue` only destructures |
| Star balance / deduction | Composable (`useMathGame.js`) | — | `stars` ref already owned by `useMathGame`; shop borrows it via `App.vue` pass-through |
| Overlay rendering | Component (`ShopOverlay.vue`) | `App.vue` (v-if + Transition) | Matches existing overlay pattern (CharacterSelect, LevelUpModal) |
| Item card display | Component (`ShopItemCard.vue`) | `ShopOverlay.vue` (layout) | Separation of layout vs. item card logic mirrors existing SFC patterns |
| Undo countdown | Component (`UndoToast.vue`) | `useShop.js` (timer logic) | Timer logic belongs in composable; toast is a pure display component |
| Persistence | `useShop.js` composable | — | localStorage reads/writes co-located with state (matches `useMathGame.js` pattern) |
| Mascot variant display | Component (`MascotPanel.vue`) | `App.vue` (prop plumbing) | MascotPanel receives `variantSrc` prop override; App.vue computes it from `useShop` |
| Placeholder PNG generation | Build-time script | — | One-time generation; no runtime involvement |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 | `^3.5.32` [VERIFIED: package.json] | Composition API, reactivity, SFCs | Already the project framework |
| Tailwind CSS v4 | `^4.2.2` [VERIFIED: package.json] | Utility-first styling via `@theme` tokens | Already the project styling system |
| Vite | `^8.0.4` [VERIFIED: package.json] | Build + dev server | Already the project bundler |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `canvas-confetti` | `^1.9.4` [VERIFIED: package.json] | Particle effect on purchase (optional) | Could fire a small burst on equip — follow existing `onSubmit` pattern |
| Browser `localStorage` | Native | Persist owned/equipped state | Zero dependency; matches existing `emma-stars`, `emma-streak` pattern |
| Browser `setTimeout` / `clearTimeout` | Native | 10-second undo window | No external timer library needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain `localStorage` | Pinia store | Pinia would add a new dependency; no router, no need — overkill for this SPA |
| `setTimeout` for undo | VueUse `useTimeoutFn` | VueUse is not installed; `setTimeout` is sufficient and consistent with `LevelUpModal.vue` timer pattern |
| Static PNG imports | CSS `filter: hue-rotate()` | Locked out by D-03 — must be separate PNGs |

**Installation:** No new packages required. [VERIFIED: package.json analysis]

---

## Architecture Patterns

### System Architecture Diagram

```
User taps shop icon (ScoreHeader)
         │
         ▼ emits @open-shop
App.vue sets showShop = true
         │
         ▼ v-if + <Transition name="fade">
ShopOverlay.vue renders
  ├── reads catalog from useShop.js
  ├── reads stars from useMathGame.js (passed as prop)
  ├── 2-per-row grid of ShopItemCard.vue components
  │       ├── Affordable → tap → purchaseItem(id)
  │       └── Unaffordable → disabled, no-op
  │
  └── UndoToast.vue (conditional, bottom of overlay)
           ├── countdown: 10s setTimeout in useShop.js
           ├── tap undo → rollbackPurchase()
           └── timeout expires → finalizePurchase() → write localStorage

purchaseItem(id):
  1. Save previous state (prevStars, prevEquipped)
  2. stars.value -= item.price  (mutate useMathGame ref)
  3. equippedVariants[char] = variantId  (optimistic)
  4. Start 10s undo timer
  5. Emit to App.vue → MascotPanel gets new variantSrc immediately

finalizePurchase():
  1. owned.push(itemId)
  2. localStorage.setItem('emma-shop-owned', JSON.stringify(owned))
  3. localStorage.setItem('emma-shop-equipped', JSON.stringify(equippedVariants))

rollbackPurchase():
  1. stars.value = prevStars  (restore)
  2. equippedVariants[char] = prevVariantId  (restore)
  3. clearTimeout(undoTimer)
  4. dismiss toast
```

### Recommended Project Structure

```
src/
├── assets/
│   └── variants/                # NEW — 20 placeholder PNGs
│       ├── peach-default.png    # base (just copies mascot.png)
│       ├── peach-blue.png
│       ├── peach-green.png
│       ├── peach-purple.png
│       ├── peach-yellow.png
│       ├── daisy-default.png
│       ├── daisy-blue.png
│       ... (20 total)
├── components/
│   ├── ShopOverlay.vue          # NEW — full-screen shop modal
│   ├── ShopItemCard.vue         # NEW — single item card
│   ├── UndoToast.vue            # NEW — countdown undo toast
│   ├── ScoreHeader.vue          # MODIFY — add shop icon button
│   └── MascotPanel.vue          # MODIFY — accept variantSrc prop
└── composables/
    └── useShop.js               # NEW — catalog, owned, equipped, purchase logic
```

### Pattern 1: useShop.js Composable Structure

**What:** Singleton composable managing the full shop state, mirroring `useMathGame.js` structure.

**When to use:** Import once in `App.vue`, destructure needed refs/functions. Do not call inside child components.

```javascript
// src/composables/useShop.js
// Source: mirrors useMathGame.js patterns [VERIFIED: codebase read]
import { ref, computed } from 'vue'
import peachDefaultSrc from '../assets/mascot.png'
// ... all 20 variant imports

// Module-level singleton state (same pattern as useSound.js audioCtx)
const owned = ref(JSON.parse(localStorage.getItem('emma-shop-owned') || '[]'))
const equippedVariants = ref(JSON.parse(localStorage.getItem('emma-shop-equipped') || '{}'))
let undoTimer = null
let pendingUndo = null  // { prevOwned, prevEquipped, prevStars, itemId }

const CATALOG = [
  // 20 items: characterId, variantId, colorName, price, src
  { id: 'peach-default',  characterId: 'peach',    colorName: 'Classic',  price: 0,  src: peachDefaultSrc },
  { id: 'peach-blue',     characterId: 'peach',    colorName: 'Ocean',    price: 15, src: peachBlueSrc },
  // ... 18 more
]

export function useShop () {
  function isOwned(itemId) { return itemId.endsWith('-default') || owned.value.includes(itemId) }
  function isEquipped(itemId) { /* check equippedVariants[characterId] === variantId */ }

  function purchaseItem(itemId, starsRef) {
    const item = CATALOG.find(i => i.id === itemId)
    if (!item || starsRef.value < item.price) return

    // Save rollback state
    pendingUndo = {
      prevStars: starsRef.value,
      prevEquipped: { ...equippedVariants.value },
      itemId,
    }

    // Optimistic update
    starsRef.value -= item.price
    equippedVariants.value = { ...equippedVariants.value, [item.characterId]: item.id }

    // Start undo window
    clearTimeout(undoTimer)
    undoTimer = setTimeout(() => finalizePurchase(itemId), 10_000)
  }

  function finalizePurchase(itemId) {
    if (!owned.value.includes(itemId)) owned.value = [...owned.value, itemId]
    localStorage.setItem('emma-shop-owned', JSON.stringify(owned.value))
    localStorage.setItem('emma-shop-equipped', JSON.stringify(equippedVariants.value))
    pendingUndo = null
  }

  function undoPurchase(starsRef) {
    if (!pendingUndo) return
    clearTimeout(undoTimer)
    starsRef.value = pendingUndo.prevStars
    equippedVariants.value = pendingUndo.prevEquipped
    pendingUndo = null
  }

  function equippedSrcForCharacter(characterId) {
    const variantId = equippedVariants.value[characterId]
    if (!variantId) return null  // use character default src
    return CATALOG.find(i => i.id === variantId)?.src || null
  }

  return {
    CATALOG,
    owned,
    equippedVariants,
    pendingUndo: computed(() => pendingUndo),
    isOwned,
    isEquipped,
    purchaseItem,
    undoPurchase,
    equippedSrcForCharacter,
  }
}
```

### Pattern 2: ShopOverlay Overlay Pattern

**What:** Full-screen overlay following `CharacterSelect.vue` exactly — `fixed inset-0 z-[200]`, fade Transition, v-if in App.vue.

**When to use:** This IS the established overlay pattern. All new overlays in this project use it.

```html
<!-- In App.vue -->
<Transition name="fade">
  <ShopOverlay
    v-if="showShop"
    :stars="stars"
    :catalog="CATALOG"
    :owned="owned"
    :equipped-variants="equippedVariants"
    @close="showShop = false"
    @purchase="onPurchaseItem"
    @undo="onUndoPurchase"
  />
</Transition>
```

```html
<!-- ShopOverlay.vue root element — matches CharacterSelect.vue -->
<!-- Source: CharacterSelect.vue pattern [VERIFIED: codebase read] -->
<div class="fixed inset-0 z-[200] bg-sky flex flex-col">
  <!-- Header: "Star Shop" title + star balance + X close button -->
  <!-- Body: 2-per-row grid of ShopItemCard -->
  <!-- Footer: UndoToast (v-if="pendingUndo") -->
</div>
```

### Pattern 3: MascotPanel variantSrc Override

**What:** Add a `variantSrc` prop to `MascotPanel.vue`. When set, it overrides `character.src`. Keeps the default character sprite when no variant is equipped.

```javascript
// Source: MascotPanel.vue existing pattern [VERIFIED: codebase read]
defineProps({
  feedback:   { type: String, default: '' },
  character:  { type: Object, required: true },
  variantSrc: { type: String, default: null },  // NEW — null = use character.src
})
```

```html
<!-- In MascotPanel.vue template -->
<img
  :src="variantSrc || character.src"
  :alt="character.name"
  ...
/>
```

### Pattern 4: Undo Timer with Reactive Countdown

**What:** `UndoToast.vue` displays a live countdown using `setInterval` inside a composable or the component itself.

**When to use:** 10-second undo window per D-07. Timer starts in `useShop.purchaseItem()`, countdown display lives in `UndoToast.vue`.

```javascript
// UndoToast.vue <script setup>
// Source: LevelUpModal.vue timer pattern [VERIFIED: codebase read]
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({ active: { type: Boolean, default: false } })
const emit  = defineEmits(['undo', 'expired'])

const countdown = ref(10)
let interval = null

watch(() => props.active, (val) => {
  if (val) {
    countdown.value = 10
    interval = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(interval)
        emit('expired')
      }
    }, 1000)
  } else {
    clearInterval(interval)
  }
})
```

### Pattern 5: Placeholder PNG Generation

**What:** Generate 20 solid-color PNG placeholders using a Node.js script (no extra deps — use built-in `fs` and a tiny canvas or just copy the existing character PNGs with a suffix).

**Simplest approach:** Copy existing character PNG as the "default" variant, and create small solid-color 100×100 PNG files via a Node script using the `canvas` API — OR — just copy `mascot.png` / `daisy.png` for all variants of that character (they'll look identical until real art drops in).

**Recommended approach for this phase:** Copy each character's existing PNG as all their variant files. The distinction between variants is the filename/ID — the image content is placeholder-only.

```bash
# scripts/generate-variant-placeholders.js (or one-liner)
# For each character, copy its existing PNG to each variant filename
cp src/assets/mascot.png src/assets/variants/peach-default.png
cp src/assets/mascot.png src/assets/variants/peach-blue.png
# etc.
```

This produces 20 files immediately with zero extra tooling.

### Anti-Patterns to Avoid

- **Writing localStorage on every equip (optimistic):** Only write after the 10-second window expires. Writing on equip means undo can't roll back persistence.
- **Storing `stars` twice:** Don't duplicate the star count in `useShop.js`. The canonical `stars` ref lives in `useMathGame.js`. Shop borrows a reference.
- **Calling `useShop()` inside child components:** The composable is a singleton (module-level state). Only call it in `App.vue` and pass data down as props. Same pattern as `useMathGame.js`.
- **Multiple simultaneous undo timers:** Only one `undoTimer` should exist at a time. Always `clearTimeout(undoTimer)` before starting a new one (D-07: subsequent purchase replaces previous toast).
- **Making item cards `<div>` instead of `<button>`:** All tappable elements must be native `<button>` for accessibility and mobile tap reliability.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reactive state | Custom event bus / global variables | Vue 3 `ref()` + composable singleton | Project standard; reactivity is automatic |
| Overlay animation | Custom CSS enter/leave transitions | `<Transition name="fade">` + existing `.fade-*` classes in style.css | Already defined, consistent with all overlays |
| Touch target sizing | Custom click area expansion | Native `<button>` ≥60px height via Tailwind `h-16` or `min-h-[60px]` | Simple, accessibility-correct |
| Countdown display | Date math / `Date.now()` delta | `setInterval` decrementing a `ref(10)` | Sufficient precision for 10-second UX; matches LevelUpModal timer approach |
| Asset bundling for PNGs | Dynamic `require()` / runtime asset fetch | Static `import variantSrc from '../assets/variants/peach-blue.png'` in composable | Vite's asset pipeline handles hashing; matches existing `import mascotSrc from '../assets/mascot.png'` pattern |

**Key insight:** Every pattern needed for this shop already exists in the codebase. The risk is inconsistency, not missing capability.

---

## Common Pitfalls

### Pitfall 1: localStorage Write on Optimistic Equip

**What goes wrong:** Stars and equipped state written to localStorage immediately on purchase. Undo tap restores in-memory state but localStorage already reflects the purchase — next refresh shows the purchased state even if undo was tapped.

**Why it happens:** Developer writes on every state change (simple mental model).

**How to avoid:** Only call `localStorage.setItem` inside `finalizePurchase()`, which runs after the 10-second timer. Undo runs before finalize and prevents finalize from executing.

**Warning signs:** Test: buy item, tap undo, refresh browser — if item is still "owned", the write-timing is wrong.

---

### Pitfall 2: Stale `stars` Value After Undo

**What goes wrong:** Stars are deducted optimistically. On undo, the code tries to restore `stars.value = originalStars` but by then another answer was answered correctly, so `stars.value` is already higher. The undo incorrectly sets stars back to the pre-purchase value, erasing earned stars.

**Why it happens:** `originalStars` is captured at purchase time; math gameplay continues in parallel.

**How to avoid:** On undo, restore only the delta: `stars.value += item.price` (add back what was spent), not `stars.value = snapshot`. This is safe regardless of math earned during the undo window.

**Warning signs:** Player earns 2 stars during undo window; undo drops stars by 2 more than expected.

---

### Pitfall 3: 20 Static PNG Imports in Composable

**What goes wrong:** Importing 20 PNG assets at the top of `useShop.js` with 20 individual `import` statements compiles correctly but is verbose. More importantly, if the path or filename convention changes, 20 lines need updating.

**Why it happens:** Vite requires static import paths — no dynamic `require('./assets/' + name + '.png')` in ESM.

**How to avoid:** Use Vite's `import.meta.glob` for the variants directory:

```javascript
// Vite glob import — loads all PNGs from variants/ as a keyed object
// Source: [ASSUMED] based on Vite docs pattern; confirm glob syntax for Vite 8
const variantAssets = import.meta.glob('../assets/variants/*.png', { eager: true, import: 'default' })
// Access: variantAssets['../assets/variants/peach-blue.png']
```

This is cleaner than 20 separate imports and survives adding new variants without code changes.

**Warning signs:** If adding a variant requires a new import line in the composable, the pattern is wrong.

---

### Pitfall 4: z-index Collision

**What goes wrong:** `ShopOverlay` uses `z-[200]` (matching `CharacterSelect.vue`), but other overlays (`LevelUpModal`, `LevelVictoryModal`, `LevelIntroModal`) also occupy high z-index layers. If the shop is open and a level milestone triggers, two overlays fight for the screen.

**Why it happens:** The shop can be open during live gameplay; a correct answer can trigger a level-up at any time.

**How to avoid:** In `App.vue`'s `onSubmit` handler, close the shop automatically when a milestone triggers: `showShop.value = false` alongside `showLevelVictory.value = true`. Alternatively, document the z-index layering clearly. Check `LevelVictoryModal` and `LevelIntroModal` z-index values before assigning the shop's.

**Warning signs:** During testing, open the shop and answer 10 correct answers — two modals overlapping is the failure mode.

---

### Pitfall 5: MascotPanel Hidden on Mobile

**What goes wrong:** `MascotPanel.vue` uses `hidden sm:flex` — it is hidden on small screens. The equipped variant updates `MascotPanel`'s `variantSrc` prop, but on mobile the mascot is not visible, so the live equip feedback is invisible to the user on the primary target device (6-year-olds on tablets/phones).

**Why it happens:** The existing responsive hide is correct for game layout (mascot takes space), but a shop preview of the equipped character needs a different solution.

**How to avoid:** The ShopOverlay item cards themselves show the variant PNG — the card image IS the preview. No need to rely on MascotPanel visibility for the shop's visual feedback. When the shop closes and the player returns to the game, MascotPanel visibility applies normally.

**Warning signs:** If the design requires "see your character wearing the variant live while in the shop", MascotPanel's hidden state on mobile is a gap to address explicitly.

---

## Code Examples

Verified patterns from existing codebase:

### localStorage Read with JSON Fallback

```javascript
// Source: useMathGame.js getStorage pattern [VERIFIED: codebase read]
function getStorage (key, fallback) {
  try {
    const val = localStorage.getItem(key)
    return val !== null ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

// Usage for shop:
const owned = ref(getStorage('emma-shop-owned', []))
const equippedVariants = ref(getStorage('emma-shop-equipped', {}))
```

### Overlay Pattern (CharacterSelect.vue)

```html
<!-- App.vue — exact pattern from CharacterSelect [VERIFIED: codebase read] -->
<Transition name="fade">
  <ShopOverlay
    v-if="showShop"
    @close="showShop = false"
  />
</Transition>
```

### Composable Return Shape

```javascript
// Source: useMathGame.js flat return object pattern [VERIFIED: codebase read]
export function useShop () {
  // ... state and functions ...
  return {
    // State refs (reactive)
    CATALOG,
    owned,
    equippedVariants,
    // Computed
    pendingUndoItem,
    // Actions
    purchaseItem,
    undoPurchase,
    equippedSrcForCharacter,
  }
}
```

### Vite Glob Import for Variant PNGs

```javascript
// Source: [ASSUMED] Vite import.meta.glob — verify exact syntax against Vite 8 docs
const variantModules = import.meta.glob(
  '../assets/variants/*.png',
  { eager: true, import: 'default' }
)
// Result: { '../assets/variants/peach-blue.png': '/assets/peach-blue.abc123.png', ... }

// Map to catalog-friendly lookup:
const variantSrcs = Object.fromEntries(
  Object.entries(variantModules).map(([path, src]) => {
    const filename = path.split('/').pop().replace('.png', '')
    return [filename, src]
  })
)
// Usage: variantSrcs['peach-blue'] → hashed asset URL
```

### Touch-Target Card Button

```html
<!-- Source: CharacterSelect.vue button pattern [VERIFIED: codebase read] -->
<button
  class="relative group rounded-2xl border-4 block-border
         min-h-[60px] min-w-[60px] flex flex-col items-center justify-center
         transition-all duration-300 btn-press cursor-pointer"
  :aria-label="`${item.colorName} variant — ${item.price} stars — ${cardState}`"
  :aria-disabled="!canAfford && !isOwned"
  @click="onTapCard"
>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Options API component | `<script setup>` Composition API | Vue 3.2+ | Already adopted in this project |
| `vuex` for global state | Composable singletons | Vue 3 era | No Vuex/Pinia in this project — deliberate |
| `tailwind.config.js` theme | `@theme {}` in CSS (Tailwind v4) | Tailwind v4.0 (2024) | Already adopted — use `@theme` for any new tokens |

**Deprecated/outdated:**
- `Options API`: Not used in this project — all components are `<script setup>`
- `require()` for asset imports: Not used — all imports are `import` statements
- `tailwind.config.js` for color tokens: Not used — tokens live in `src/style.css` `@theme {}`

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `import.meta.glob` works with Vite 8 using `{ eager: true, import: 'default' }` syntax | Code Examples (Vite Glob Import) | If API changed, fall back to 20 individual static imports — functionally equivalent, just more verbose |
| A2 | Restoring stars via `stars.value += item.price` (delta) rather than snapshot avoids the concurrent-earn pitfall | Common Pitfalls #2 | If the undo semantics are "return to exact pre-purchase state", a snapshot approach is correct — clarify with user |
| A3 | `z-[200]` is the correct z-index tier for the shop overlay (same as CharacterSelect) | Architecture Patterns | If LevelVictoryModal/LevelIntroModal use `z-[200]` or higher, the shop may need a different value |
| A4 | Copying existing character PNGs as placeholder variants is acceptable (all variants look identical) | Pattern 5 | If visual distinction between variants is required during this phase, minimal unique placeholders (solid-color squares) are needed |

---

## Open Questions

1. **z-index of existing modals vs. shop**
   - What we know: CharacterSelect uses `z-[200]`; LevelVictoryModal and LevelIntroModal are not directly checked
   - What's unclear: exact z-index values of newer modals (`LevelVictoryModal.vue`, `LevelIntroModal.vue`)
   - Recommendation: Planner should grep `z-` in those two files and assign shop a consistent layer

2. **Star delta vs. snapshot on undo**
   - What we know: Undo must restore the star amount spent; game continues during undo window
   - What's unclear: Whether the spec intends "return to exact star count at purchase time" (snapshot) or "refund the purchase price" (delta)
   - Recommendation: Use delta (`stars.value += item.price`) — this is safer and more intuitive

3. **Default variant ownership model**
   - What we know: UI spec says default variants are "free / already equipped at start" (price: 0)
   - What's unclear: Should default variants be pre-populated in `emma-shop-owned` on first load, or should `isOwned` return `true` for any item with `price: 0`?
   - Recommendation: Check `item.id.endsWith('-default') || item.price === 0` in `isOwned()` — no need to write them to localStorage

---

## Environment Availability

Step 2.6: SKIPPED — this phase has no external runtime dependencies. All work is source code and static assets. `npm run build` uses Vite + the existing plugin set (no new devDependencies).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed [VERIFIED: package.json — no vitest, no jest] |
| Config file | None present |
| Quick run command | `npm run build` (type-check via Vite) |
| Full suite command | `npm run build` |

No test framework is installed in this project. The `config.json` has `nyquist_validation: true` but ARCHITECTURE.md explicitly documents "No test directories or test patterns present." [VERIFIED: codebase read]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SHOP-01 | Shop opens from ScoreHeader | manual smoke | — | N/A |
| SHOP-02 | Items display with prices | manual smoke | — | N/A |
| SHOP-03 | Stars deducted on purchase | manual smoke | — | N/A |
| SHOP-04 | Owned/equipped persist after refresh | manual smoke | — | N/A |
| SHOP-05 | Disabled when unaffordable | manual smoke | — | N/A |
| SHOP-06 | 10-second undo works | manual smoke | — | N/A |
| SHOP-07 | 5+ Tier-1 items present | manual smoke | — | N/A |
| SHOP-08 | Equipped item visually indicated | manual smoke | — | N/A |

### Sampling Rate

- **Per task commit:** `npm run build` (ensures no compile errors per success criterion 5)
- **Per wave merge:** `npm run build`
- **Phase gate:** All 8 manual smoke tests pass + `npm run build` green before `/gsd-verify-work`

### Wave 0 Gaps

No test infrastructure to create — project has no test setup and TEST-01 (Vitest for useMathGame) is a separate requirement in a different phase. The planner should include `npm run build` as the automated gate per task.

---

## Security Domain

`security_enforcement: true`, `security_asvs_level: 1` [VERIFIED: config.json]

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in this SPA |
| V3 Session Management | No | localStorage is not session management |
| V4 Access Control | No | No server, no roles |
| V5 Input Validation | Partial | Star balance check: `stars.value >= item.price` before purchase — prevents negative balance. No user text input in shop. |
| V6 Cryptography | No | No encryption needed for cosmetic item state |

### Known Threat Patterns for Client-Side localStorage

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| localStorage tampering (user opens DevTools, sets `emma-shop-owned` to all items) | Tampering | Acceptable for a children's cosmetic shop — no real-money purchases, no server validation required. The `canAfford` guard in UI is sufficient. |
| Negative stars via rapid purchase | Tampering | `stars.value >= item.price` guard in `purchaseItem()` prevents this at composable level |
| XSS via shop item names | Tampering | Item names are hardcoded catalog strings, not user input — no sanitization needed |

**Security posture:** ASVS Level 1 is satisfied by the existing SPA architecture (no auth, no server, no PII). The shop adds no new attack surface beyond localStorage, which is already used for `emma-stars` and `emma-streak`.

---

## Sources

### Primary (HIGH confidence)
- `/Users/hector/Developer/EmmaApp/src/App.vue` — actual wiring, composable imports, overlay pattern
- `/Users/hector/Developer/EmmaApp/src/composables/useMathGame.js` — `stars` ref, localStorage pattern, composable return shape
- `/Users/hector/Developer/EmmaApp/src/components/CharacterSelect.vue` — overlay pattern, character object shape
- `/Users/hector/Developer/EmmaApp/src/components/ScoreHeader.vue` — header layout, existing button pattern
- `/Users/hector/Developer/EmmaApp/src/components/MascotPanel.vue` — prop shape, `character.src` usage
- `/Users/hector/Developer/EmmaApp/src/style.css` — `@theme` color tokens, existing animation classes
- `/Users/hector/Developer/EmmaApp/.planning/codebase/CONVENTIONS.md` — naming, import style, code patterns
- `/Users/hector/Developer/EmmaApp/.planning/codebase/ARCHITECTURE.md` — data flow, composable singleton pattern
- `/Users/hector/Developer/EmmaApp/package.json` — dependency versions, no test framework
- `/Users/hector/Developer/EmmaApp/.planning/phases/01-star-shop/01-UI-SPEC.md` — component inventory, copy, accessibility contract

### Secondary (MEDIUM confidence)
- Vite `import.meta.glob` pattern — standard Vite feature [ASSUMED; well-established but version-specific syntax not verified against Vite 8 changelog]

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified directly from package.json and codebase
- Architecture: HIGH — all patterns directly verified in existing source files
- Pitfalls: HIGH — derived from concrete codebase inspection (the undo-write timing, MascotPanel hidden class, z-index)
- Vite glob syntax: MEDIUM — well-known pattern, syntax not verified against Vite 8 specifically

**Research date:** 2026-04-17
**Valid until:** 2026-05-17 (stable stack; Tailwind v4 and Vue 3 APIs are stable)
