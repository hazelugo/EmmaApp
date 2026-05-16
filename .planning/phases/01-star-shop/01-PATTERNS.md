# Phase 01: Star Shop - Pattern Map

**Mapped:** 2026-04-17
**Files analyzed:** 8 new/modified files
**Analogs found:** 8 / 8

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/composables/useShop.js` | composable | CRUD + event-driven | `src/composables/useMathGame.js` | exact |
| `src/components/ShopOverlay.vue` | component (overlay) | request-response | `src/components/CharacterSelect.vue` | exact |
| `src/components/ShopItemCard.vue` | component (card) | request-response | `src/components/CharacterSelect.vue` (button grid) | role-match |
| `src/components/UndoToast.vue` | component (timer display) | event-driven | `src/components/LevelVictoryModal.vue` (timer pattern) | role-match |
| `src/components/ScoreHeader.vue` | component (MODIFY) | request-response | itself — add button to existing header | self-match |
| `src/components/MascotPanel.vue` | component (MODIFY) | request-response | itself — add prop override | self-match |
| `src/App.vue` | orchestrator (MODIFY) | request-response | itself — wire shop composable + overlay | self-match |
| `scripts/generate-variant-placeholders.js` | utility script | batch / file-I/O | none (no existing scripts) | no-analog |

---

## Pattern Assignments

### `src/composables/useShop.js` (composable, CRUD + event-driven)

**Analog:** `src/composables/useMathGame.js`

**Imports pattern** (`useMathGame.js` lines 1):
```javascript
import { ref, computed, reactive } from 'vue'
```

For `useShop.js`, use only what is needed:
```javascript
import { ref, computed } from 'vue'
```

**Module-level singleton state pattern** (`useMathGame.js` lines 10–25):
```javascript
// Module-level helpers — defined OUTSIDE the export function so all callers share one instance
function getStorage (key, fallback) {
  try {
    const val = localStorage.getItem(key)
    return val !== null ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

function setStorage (key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage unavailable (private browsing, quota exceeded)
  }
}
```

Note: `useMathGame.js` uses `Number(val)` in its `getStorage`; `useShop.js` must use `JSON.parse(val)` for arrays/objects.

**Module-level state (singleton) pattern** (`useMathGame.js` lines 29–35):
```javascript
// State declared at module scope — shared across all calls to useShop()
const stars      = ref(getStorage('emma-stars', 0))
const streak     = ref(getStorage('emma-streak', 0))
```

Mirror this for shop state:
```javascript
// Module-level — ONE instance of shop state across the app
const owned           = ref(getStorage('emma-shop-owned', []))
const equippedVariants = ref(getStorage('emma-shop-equipped', {}))
let undoTimer   = null
let pendingUndo = null   // { prevStars, prevEquipped, itemId, price }
```

**Export function return shape** (`useMathGame.js` lines 27, 217–246):
```javascript
export function useMathGame () {
  // ... state, computed, and functions defined here ...

  return {
    // State refs (reactive — consumers get live binding)
    stars,
    streak,
    level,
    // Computed
    correctAnswer,
    successRate,
    // Actions
    generateProblem,
    checkAnswer,
    clearFeedback,
    appendDigit,
    backspace,
    resetGame,
  }
}
```

**localStorage write pattern** (`useMathGame.js` lines 131–133):
```javascript
// Write on every meaningful state change (not on optimistic interim states)
setStorage('emma-stars', stars.value)
setStorage('emma-streak', streak.value)
```

For shop: only write inside `finalizePurchase()`, NOT inside the optimistic update.

**Internal function (no JSDoc for simple helpers) pattern** (`useMathGame.js` lines 68–78):
```javascript
function adjustDifficulty () {
  if (difficulty.history.length < 5) return

  if (successRate.value >= 0.9 && difficulty.maxOperand < 20) {
    difficulty.maxOperand = Math.min(difficulty.maxOperand + 1, 20)
    setStorage('emma-maxOperand', difficulty.maxOperand)
  }
  // ...
}
```

**JSDoc comment on exported function** (`useMathGame.js` lines 3–8):
```javascript
/**
 * Core math game composable.
 *
 * Manages problem generation, answer checking, scoring,
 * streak tracking, adaptive difficulty, and level progression.
 */
```

Mirror this style for `useShop.js`:
```javascript
/**
 * Star Shop composable.
 *
 * Manages the item catalog, purchase flow (optimistic + 10-second undo),
 * owned/equipped state, and localStorage persistence.
 * Call once in App.vue; pass data down as props — do not call in child components.
 */
```

---

### `src/components/ShopOverlay.vue` (component, overlay, request-response)

**Analog:** `src/components/CharacterSelect.vue`

**Script setup imports pattern** (`CharacterSelect.vue` lines 1–6):
```javascript
<script setup>
import { ref } from 'vue'
import { useSound } from '../composables/useSound.js'
```

For `ShopOverlay.vue` (no composable call — receives all data as props):
```javascript
<script setup>
import { computed } from 'vue'
import ShopItemCard from './ShopItemCard.vue'
import UndoToast   from './UndoToast.vue'
```

**defineProps pattern** (`CharacterSelect.vue` lines 5 + CONVENTIONS.md):
```javascript
// ShopOverlay.vue receives all state from App.vue; never calls useShop() internally
defineProps({
  stars:            { type: Number,  required: true },
  catalog:          { type: Array,   required: true },
  owned:            { type: Array,   required: true },
  equippedVariants: { type: Object,  required: true },
  pendingUndoItem:  { type: Object,  default: null  },
})

defineEmits(['close', 'purchase', 'undo'])
```

**Overlay root element — fixed inset-0, z-[200], flex column** (`CharacterSelect.vue` line 65):
```html
<div class="fixed inset-0 z-[200] bg-sky flex justify-center items-center p-4">
```

Note on z-index layering (confirmed from codebase scan):
- `CharacterSelect.vue`: `z-[200]` (fixed fullscreen)
- `LevelVictoryModal.vue` CSS: `z-index: 200` (`.victory-overlay` class)
- `LevelUpModal.vue`: `z-[100]`

**ShopOverlay should use `z-[200]`** — same tier as CharacterSelect. Close the shop (`showShop = false`) in `App.vue`'s `onSubmit` when `showLevelVictory` triggers, to avoid two z-200 overlays simultaneously (see RESEARCH.md Pitfall 4).

**Item grid layout pattern** (`CharacterSelect.vue` lines 100–133):
```html
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
  <button
    v-for="char in characters"
    :key="char.id"
    class="relative group aspect-square rounded-2xl border-4 block-border
           flex flex-col items-center justify-center
           transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer bg-sky/30"
    :class="char.border"
    @click="selectCharacter(char)"
  >
```

For ShopOverlay the grid is **always 2-column** (D-02):
```html
<div class="grid grid-cols-2 gap-3 p-4 overflow-y-auto">
  <ShopItemCard
    v-for="item in catalog"
    :key="item.id"
    :item="item"
    :is-owned="isOwned(item.id)"
    :is-equipped="isEquipped(item.id)"
    :can-afford="stars >= item.price"
    @purchase="$emit('purchase', item.id)"
  />
</div>
```

**Character image pattern** (`CharacterSelect.vue` lines 116–121):
```html
<img
  v-if="char.src"
  :src="char.src"
  :alt="char.name"
  class="relative z-10 w-24 md:w-32 object-contain"
  style="image-rendering: pixelated;"
/>
```

Use `image-rendering: pixelated` on all variant PNG `<img>` elements — this is the established style for all sprite assets.

**Transition wrapper pattern** (`App.vue` lines 132–137):
```html
<Transition name="fade">
  <CharacterSelect
    v-if="!selectedCharacter"
    @select="onSelectCharacter"
  />
</Transition>
```

Mirror in `App.vue` for shop:
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
  />
</Transition>
```

The `.fade-*` transition classes are defined globally in `src/style.css` — check that section and use the existing `name="fade"` (same as CharacterSelect's Transition wrapper in App.vue).

---

### `src/components/ShopItemCard.vue` (component, card, request-response)

**Analog:** `src/components/CharacterSelect.vue` button grid items

**Touch-target native button pattern** (`CharacterSelect.vue` lines 101–109):
```html
<button
  v-for="char in characters"
  :key="char.id"
  class="relative group aspect-square rounded-2xl border-4 block-border
         flex flex-col items-center justify-center
         transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer bg-sky/30"
  :class="char.border"
  @click="selectCharacter(char)"
  @mouseenter="hoveredChar = char.id"
  @mouseleave="hoveredChar = null"
>
```

Adapt for `ShopItemCard.vue` — must be a native `<button>`, min 60px touch target:
```html
<button
  class="relative rounded-2xl border-4 block-border flex flex-col items-center
         min-h-[60px] p-3 transition-all duration-300 btn-press cursor-pointer
         bg-mushroom-white/90 overflow-hidden"
  :class="[item.borderClass, { 'opacity-60 cursor-not-allowed': !canAfford && !isOwned }]"
  :disabled="!canAfford && !isOwned"
  :aria-label="`${item.colorName} variant for ${item.characterName} — ${item.price} stars`"
  :aria-disabled="!canAfford && !isOwned"
  @click="$emit('purchase')"
>
```

**defineProps for ShopItemCard.vue** (following CONVENTIONS.md object syntax):
```javascript
defineProps({
  item:      { type: Object,  required: true },
  isOwned:   { type: Boolean, default: false },
  isEquipped:{ type: Boolean, default: false },
  canAfford: { type: Boolean, default: false },
})

defineEmits(['purchase'])
```

**Conditional badge pattern** (adapted from `CharacterSelect.vue` label, line 127–130):
```html
<div class="absolute bottom-2 left-0 right-0 text-center z-10">
  <span class="bg-mushroom-white/90 text-dark px-2 rounded-full font-bold text-sm border-2 border-dark/20 shadow-sm">
    {{ char.name }}
  </span>
</div>
```

Adapt for equipped/owned/price badge:
```html
<!-- State badge at bottom of card -->
<div class="absolute bottom-1 left-0 right-0 text-center z-10">
  <span v-if="isEquipped"  class="bg-luigi    text-dark   px-2 py-0.5 rounded-full font-bold text-xs border-2 border-luigi-dark">✓ Equipped</span>
  <span v-else-if="isOwned"  class="bg-coin     text-dark   px-2 py-0.5 rounded-full font-bold text-xs border-2 border-block-outline">Owned</span>
  <span v-else-if="!canAfford" class="bg-dark/60  text-mushroom-white px-2 py-0.5 rounded-full font-bold text-xs">⭐ {{ item.price }}</span>
  <span v-else                class="bg-star-gold text-dark   px-2 py-0.5 rounded-full font-bold text-xs border-2 border-block-outline">⭐ {{ item.price }}</span>
</div>
```

---

### `src/components/UndoToast.vue` (component, timer display, event-driven)

**Analog:** `src/components/LevelVictoryModal.vue` (timer/watch pattern)

**watch + timer lifecycle pattern** (`LevelVictoryModal.vue` lines 34–52, 79–88):
```javascript
import { ref, watch, onMounted, onUnmounted } from 'vue'

let timers = []

function clearTimers () {
  timers.forEach(clearTimeout)
  timers = []
}

function startScene () {
  // ... reset state ...
  clearTimers()
  timers.push(setTimeout(() => { showArt.value = true }, 200))
  timers.push(setTimeout(() => { showText.value = true }, 650))
}

watch(() => props.show, (val) => {
  if (val) startScene()
  else clearTimers()
})

onMounted(() => {
  if (props.show) startScene()
})

onUnmounted(clearTimers)
```

For `UndoToast.vue`, use `setInterval` (not `setTimeout`) for the live countdown:
```javascript
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  itemName: { type: String, default: '' },
})
const emit = defineEmits(['undo', 'expired'])

const countdown = ref(10)
let interval = null

function clearCountdown () {
  clearInterval(interval)
  interval = null
}

watch(() => props.active, (val) => {
  if (val) {
    countdown.value = 10
    clearCountdown()
    interval = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearCountdown()
        emit('expired')
      }
    }, 1000)
  } else {
    clearCountdown()
  }
})

onUnmounted(clearCountdown)
```

**defineProps pattern** (CONVENTIONS.md object syntax):
```javascript
defineProps({
  active:   { type: Boolean, default: false },
  itemName: { type: String,  default: ''    },
})
defineEmits(['undo', 'expired'])
```

**Toast template** — no exact analog; use `block-border` + Tailwind utilities consistent with rest of UI:
```html
<template>
  <Transition name="fade">
    <div
      v-if="active"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[210]
             bg-dark text-mushroom-white block-border rounded-2xl
             px-6 py-4 flex items-center gap-4 min-w-[280px]"
      role="status"
      aria-live="polite"
    >
      <span class="font-bold flex-1">Undo? ({{ countdown }}s)</span>
      <button
        class="btn-press bg-mario-red text-mushroom-white font-black
               rounded-xl px-4 py-2 border-2 border-dark"
        @click="emit('undo')"
      >
        UNDO
      </button>
    </div>
  </Transition>
</template>
```

Note: `z-[210]` — one layer above the overlay (`z-[200]`) so it floats over shop content.

---

### `src/components/ScoreHeader.vue` (MODIFY — add shop button)

**Analog:** itself — add a button following the existing mute button pattern.

**Existing mute button pattern** (`ScoreHeader.vue` lines 52–58):
```html
<button
  id="btn-mute"
  class="btn-press flex items-center justify-center w-11 h-11 md:w-12 md:h-12
         rounded-xl hover:scale-110 transition-transform cursor-pointer"
  :aria-label="isMuted ? 'Unmute sounds' : 'Mute sounds'"
  @click="$emit('toggle-mute')"
>
  <span class="text-xl md:text-2xl drop-shadow-md">{{ isMuted ? '🔇' : '🔊' }}</span>
</button>
```

**Add shop button** — same class pattern, placed in the "Right Controls" `<div>` before the mute button:
```html
<button
  id="btn-shop"
  class="btn-press flex items-center justify-center w-11 h-11 md:w-12 md:h-12
         rounded-xl hover:scale-110 transition-transform cursor-pointer"
  aria-label="Open Star Shop"
  @click="$emit('open-shop')"
>
  <span class="text-xl md:text-2xl drop-shadow-md">🏪</span>
</button>
```

**Add `open-shop` to defineEmits** (`ScoreHeader.vue` line 11):
```javascript
// Before (line 11 — not present, must add defineEmits):
defineEmits(['toggle-mute'])

// After:
defineEmits(['toggle-mute', 'open-shop'])
```

**Existing props** — no change needed to defineProps; shop button has no prop dependency.

---

### `src/components/MascotPanel.vue` (MODIFY — add variantSrc prop)

**Analog:** itself — extend existing prop list and img src binding.

**Current defineProps** (`MascotPanel.vue` lines 2–5):
```javascript
defineProps({
  feedback:  { type: String, default: '' },
  character: { type: Object, required: true },
})
```

**Add `variantSrc` prop** — `null` means use `character.src` (no variant equipped):
```javascript
defineProps({
  feedback:   { type: String, default: '' },
  character:  { type: Object, required: true },
  variantSrc: { type: String, default: null },  // null = use character default src
})
```

**Current img src** (`MascotPanel.vue` lines 19–28):
```html
<img
  v-if="character.src"
  :src="character.src"
  :alt="character.name"
  class="relative w-28 md:w-36 animate-float drop-shadow-xl z-20"
  style="image-rendering: pixelated;"
  :class="{
    'scale-110 transition-transform duration-300': feedback === 'correct',
    'shake': feedback === 'wrong',
  }"
/>
```

**Change `:src` binding only** — all other attributes stay identical:
```html
<img
  v-if="variantSrc || character.src"
  :src="variantSrc || character.src"
  :alt="character.name"
  class="relative w-28 md:w-36 animate-float drop-shadow-xl z-20"
  style="image-rendering: pixelated;"
  :class="{
    'scale-110 transition-transform duration-300': feedback === 'correct',
    'shake': feedback === 'wrong',
  }"
/>
```

---

### `src/App.vue` (MODIFY — orchestrate shop)

**Analog:** itself — follow the existing composable destructure + overlay wiring pattern.

**Composable import + destructure pattern** (`App.vue` lines 13–26):
```javascript
import { useMathGame }   from './composables/useMathGame.js'
import { useSound }      from './composables/useSound.js'

const {
  stars, streak, problemKey,
  currentProblem, answer, feedback,
  // ...
} = useMathGame()
```

Add shop composable directly below the existing destructures:
```javascript
import { useShop } from './composables/useShop.js'
import ShopOverlay from './components/ShopOverlay.vue'

const {
  CATALOG,
  owned,
  equippedVariants,
  pendingUndoItem,
  purchaseItem,
  undoPurchase,
  equippedSrcForCharacter,
} = useShop()

const showShop = ref(false)
```

**Overlay v-if pattern** (`App.vue` lines 132–137):
```html
<Transition name="fade">
  <CharacterSelect
    v-if="!selectedCharacter"
    @select="onSelectCharacter"
  />
</Transition>
```

**Event handler naming convention** (`App.vue` lines 39–47, 58–86):
```javascript
function onSelectCharacter (char) { ... }
function onSubmit () { ... }
function onVictoryNext () { ... }
function onLevelIntroStart () { ... }
```

Add shop handlers with `on` prefix:
```javascript
function onOpenShop () {
  showShop.value = true
}

function onPurchaseItem (itemId) {
  purchaseItem(itemId, stars)
}

function onUndoPurchase () {
  undoPurchase(stars)
}
```

**Prop passing to ScoreHeader** (`App.vue` lines 166–171):
```html
<ScoreHeader
  :stars="stars"
  :streak="streak"
  :is-muted="isMuted"
  @toggle-mute="toggleMute"
/>
```

Add `@open-shop` listener:
```html
<ScoreHeader
  :stars="stars"
  :streak="streak"
  :is-muted="isMuted"
  @toggle-mute="toggleMute"
  @open-shop="onOpenShop"
/>
```

**Prop passing to MascotPanel** — `MascotPanel` is inside `ChallengeZone.vue`. Check if `MascotPanel` is used there or directly in `App.vue`. From `App.vue` line 174–185, `ChallengeZone` receives `character`. If `MascotPanel` lives inside `ChallengeZone`, the equipped src must be threaded through `ChallengeZone` as well. Planner should verify `ChallengeZone.vue` internals and decide prop-threading depth. The pattern for adding a prop to a component is identical to the `variantSrc` addition above.

**Close shop on level milestone** (prevent z-index collision — RESEARCH.md Pitfall 4):
```javascript
// Inside onSubmit(), after result === 'correct' branch, where showLevelVictory triggers:
watch(showLevelVictory, (val) => {
  if (val) {
    showShop.value = false  // close shop to avoid z-200 overlap
    stopThemeMusic()
    playLevelUp()
  }
})
```

---

### `scripts/generate-variant-placeholders.js` (utility, batch/file-I/O)

**Analog:** none — no existing scripts directory.

**Pattern from RESEARCH.md Pattern 5 (simplest approach):**
```bash
# Shell one-liner — copy each character's existing PNG to all variant filenames
# Run once from project root before first npm run dev

mkdir -p src/assets/variants

cp src/assets/mascot.png src/assets/variants/peach-default.png
cp src/assets/mascot.png src/assets/variants/peach-blue.png
cp src/assets/mascot.png src/assets/variants/peach-green.png
cp src/assets/mascot.png src/assets/variants/peach-purple.png
cp src/assets/mascot.png src/assets/variants/peach-yellow.png

cp src/assets/daisy.png  src/assets/variants/daisy-default.png
cp src/assets/daisy.png  src/assets/variants/daisy-blue.png
cp src/assets/daisy.png  src/assets/variants/daisy-green.png
cp src/assets/daisy.png  src/assets/variants/daisy-purple.png
cp src/assets/daisy.png  src/assets/variants/daisy-yellow.png

cp src/assets/rosalina.png src/assets/variants/rosalina-default.png
cp src/assets/rosalina.png src/assets/variants/rosalina-blue.png
cp src/assets/rosalina.png src/assets/variants/rosalina-green.png
cp src/assets/rosalina.png src/assets/variants/rosalina-purple.png
cp src/assets/rosalina.png src/assets/variants/rosalina-yellow.png

cp src/assets/toad.png  src/assets/variants/toad-default.png
cp src/assets/toad.png  src/assets/variants/toad-blue.png
cp src/assets/toad.png  src/assets/variants/toad-green.png
cp src/assets/toad.png  src/assets/variants/toad-purple.png
cp src/assets/toad.png  src/assets/variants/toad-yellow.png
```

Alternatively, this can be a minimal Node.js script at `scripts/generate-variant-placeholders.js` using `fs.copyFileSync`. Either approach produces 20 files in `src/assets/variants/` with zero extra dependencies.

---

## Shared Patterns

### Overlay Structure
**Source:** `src/components/CharacterSelect.vue` line 65
**Apply to:** `ShopOverlay.vue`
```html
<div class="fixed inset-0 z-[200] bg-sky flex flex-col">
  <!-- Header row: title + star count + X close button -->
  <!-- Scrollable body: 2-col item grid -->
  <!-- Footer: UndoToast (v-if="pendingUndoItem") -->
</div>
```

### Touch Target Buttons
**Source:** `src/components/CharacterSelect.vue` lines 101–109 + `src/style.css` `.btn-press`
**Apply to:** `ShopItemCard.vue` root, `UndoToast.vue` undo button, `ScoreHeader.vue` shop button
```html
<button class="btn-press ... min-h-[60px] min-w-[60px] ...">
```
The `.btn-press` class provides `:active` scale+shadow animation automatically — apply to all tappable elements.

### Image Rendering for Sprites
**Source:** All components using PNG assets (`CharacterSelect.vue` line 120, `MascotPanel.vue` line 24, `LevelVictoryModal.vue` line 122)
**Apply to:** All `<img>` elements displaying variant PNGs
```html
style="image-rendering: pixelated;"
```

### localStorage Read with JSON Fallback
**Source:** `src/composables/useMathGame.js` lines 10–17 (adapted for JSON)
**Apply to:** `useShop.js` module-level state initialization
```javascript
function getStorage (key, fallback) {
  try {
    const val = localStorage.getItem(key)
    return val !== null ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}
// Usage:
const owned            = ref(getStorage('emma-shop-owned', []))
const equippedVariants = ref(getStorage('emma-shop-equipped', {}))
```

### Vite Asset Import for PNGs
**Source:** `src/composables/useMathGame.js` (indirectly — `LevelUpModal.vue` lines 4–7)
**Apply to:** `useShop.js` variant asset loading
```javascript
// Static import (per-file):
import peachDefaultSrc from '../assets/variants/peach-default.png'

// OR Vite glob (preferred for 20 files):
const variantModules = import.meta.glob(
  '../assets/variants/*.png',
  { eager: true, import: 'default' }
)
// Access: variantModules['../assets/variants/peach-blue.png']
```

### Tailwind Color Tokens Available for Shop UI
**Source:** `src/style.css` `@theme {}` block, lines 11–62
```
bg-star-gold       → #FFD700  (star prices, equipped badge)
bg-mario-red       → #E52521  (header, undo button)
bg-peach           → #F8A5C2  (Peach character cards)
bg-daisy           → #F5A623  (Daisy character cards)
bg-rosalina        → #80D8FF  (Rosalina character cards)
bg-luigi           → #4CAF50  (equipped state badge)
bg-coin            → #FFB300  (owned-not-equipped badge)
bg-mushroom-white  → #FFF8F0  (card backgrounds, toast)
bg-sky             → #87CEEB  (overlay background)
text-dark          → #2C2C2C  (body text)
block-border       → (utility class) 4px black border + inset highlights + corner screws
btn-press          → (utility class) active state scale + shadow
```

### Section Comment Dividers in JS Composables
**Source:** `src/composables/useMathGame.js` throughout
**Apply to:** `useShop.js`
```javascript
/* ── Catalog ────────────────────────────────────────────────── */
/* ── State ──────────────────────────────────────────────────── */
/* ── Undo / Purchase ─────────────────────────────────────────── */
/* ── localStorage ───────────────────────────────────────────── */
/* ── Exports ─────────────────────────────────────────────────── */
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `scripts/generate-variant-placeholders.js` | utility | batch/file-I/O | No existing scripts directory; shell one-liner or minimal Node.js fs.copyFileSync — no project pattern to copy |

---

## Key Notes for Planner

1. **MascotPanel location:** `MascotPanel.vue` is not directly used in `App.vue` — it appears inside `ChallengeZone.vue` based on `App.vue`'s template (line 174: `<ChallengeZone :character="selectedCharacter" />`). The planner must read `ChallengeZone.vue` to determine if `variantSrc` needs threading through `ChallengeZone` as an intermediary prop, or if `MascotPanel` is rendered elsewhere.

2. **z-index layering confirmed:**
   - `CharacterSelect.vue`: `z-[200]` (Tailwind inline)
   - `LevelVictoryModal.vue`: `z-index: 200` (CSS class `.victory-overlay`)
   - `LevelUpModal.vue`: `z-[100]`
   - `ShopOverlay.vue` should use `z-[200]` — same tier, but guarded by closing on milestone (see App.vue shared pattern above)
   - `UndoToast.vue` should use `z-[210]` — above the shop overlay

3. **No `<Transition name="fade">` CSS found in style.css** — the `fade` transition used in `App.vue` for `CharacterSelect` must be defined somewhere (either inline in `CharacterSelect.vue`'s `<style>` or in a file not yet checked). Planner should verify and ensure `ShopOverlay` uses the same transition name. If not found, a scoped `<style>` block in `ShopOverlay.vue` with `.fade-enter-active`, `.fade-leave-active`, `.fade-enter-from`, `.fade-leave-to` is the safe fallback — following `LevelVictoryModal.vue` lines 144–148's pattern with a renamed `victory-fade`.

4. **Star deduction:** Use delta restore on undo (`stars.value += item.price`) not snapshot, per RESEARCH.md Pitfall 2 — gameplay continues earning stars during the undo window.

---

## Metadata

**Analog search scope:** `src/composables/`, `src/components/`, `src/style.css`, `src/App.vue`
**Files scanned:** 8 source files read in full
**Pattern extraction date:** 2026-04-17
