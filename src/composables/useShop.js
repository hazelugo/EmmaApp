import { ref, computed } from 'vue'

/**
 * Star Shop composable.
 *
 * Manages the item catalog, purchase flow (optimistic + 10-second undo),
 * owned/equipped state, and localStorage persistence.
 * Call once in App.vue; pass data down as props — do not call in child components.
 */

/* ── localStorage helpers ───────────────────────────────────── */

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
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage unavailable (private browsing, quota exceeded)
  }
}

/* ── Vite asset glob ────────────────────────────────────────── */

const variantModules = import.meta.glob(
  '../assets/variants/*.png',
  { eager: true, import: 'default' }
)
// Build lookup: { 'peach-blue': '/path/to/peach-blue.abc.png', ... }
const variantSrcs = Object.fromEntries(
  Object.entries(variantModules).map(([path, src]) => {
    const filename = path.split('/').pop().replace('.png', '')
    return [filename, src]
  })
)

/* ── Catalog ────────────────────────────────────────────────── */

const CHARACTER_IDS = ['peach', 'daisy', 'rosalina', 'toad']
const VARIANT_DEFS = [
  { variantId: 'default', colorName: 'Classic', price: 0  },
  { variantId: 'blue',    colorName: 'Ocean',   price: 15 },
  { variantId: 'green',   colorName: 'Forest',  price: 15 },
  { variantId: 'purple',  colorName: 'Royal',   price: 15 },
  { variantId: 'yellow',  colorName: 'Sunny',   price: 15 },
]

const CATALOG = Object.freeze(
  CHARACTER_IDS.flatMap(characterId =>
    VARIANT_DEFS.map(v => Object.freeze({
      id:          `${characterId}-${v.variantId}`,
      characterId,
      variantId:   v.variantId,
      colorName:   v.colorName,
      price:       v.price,
      src:         variantSrcs[`${characterId}-${v.variantId}`],
    }))
  )
)

/* ── State ──────────────────────────────────────────────────── */

// Module-level — ONE instance of shop state across the app
const owned            = ref(getStorage('emma-shop-owned', []))
const equippedVariants = ref(getStorage('emma-shop-equipped', {}))
const pendingUndoItemId = ref(null)  // id of the item currently in its 10s undo window, or null
let undoTimer   = null
let pendingUndo = null  // internal snapshot: { itemId, prevEquipped, price, characterId }

/* ── Export ─────────────────────────────────────────────────── */

export function useShop () {
  /* ── Queries ────────────────────────────────────────────────── */

  function isOwned (itemId) {
    // Defaults are always owned without persistence
    const item = CATALOG.find(i => i.id === itemId)
    if (!item) return false
    if (item.variantId === 'default' || item.price === 0) return true
    return owned.value.includes(itemId)
  }

  function isEquipped (itemId) {
    const item = CATALOG.find(i => i.id === itemId)
    if (!item) return false
    return equippedVariants.value[item.characterId] === itemId
  }

  function equippedSrcForCharacter (characterId) {
    const itemId = equippedVariants.value[characterId]
    if (!itemId) return null
    return CATALOG.find(i => i.id === itemId)?.src || null
  }

  const pendingUndoItem = computed(() =>
    pendingUndoItemId.value
      ? CATALOG.find(i => i.id === pendingUndoItemId.value) || null
      : null
  )

  /* ── Purchase flow ───────────────────────────────────────────── */

  function purchaseItem (itemId, starsRef) {
    const item = CATALOG.find(i => i.id === itemId)
    if (!item) return
    if (starsRef.value < item.price) return  // SHOP-05: guard at composable level

    // Finalize any pending prior purchase BEFORE starting a new undo window
    // (single timer at a time — prevents two concurrent undo windows)
    if (pendingUndo) {
      const prior = pendingUndo
      clearTimeout(undoTimer)
      finalizePurchase(prior.itemId)
    }

    // Snapshot for rollback
    pendingUndo = {
      itemId,
      price:        item.price,
      characterId:  item.characterId,
      prevEquipped: equippedVariants.value[item.characterId] || null,
    }

    // Optimistic mutation (D-06)
    starsRef.value -= item.price
    equippedVariants.value = {
      ...equippedVariants.value,
      [item.characterId]: itemId,
    }
    pendingUndoItemId.value = itemId

    // 10s undo window (D-07)
    undoTimer = setTimeout(() => finalizePurchase(itemId), 10_000)
  }

  function finalizePurchase (itemId) {
    // Defaults are never written to owned
    const item = CATALOG.find(i => i.id === itemId)
    if (item && item.price > 0 && !owned.value.includes(itemId)) {
      owned.value = [...owned.value, itemId]
    }
    setStorage('emma-shop-owned',    owned.value)
    setStorage('emma-shop-equipped', equippedVariants.value)
    pendingUndo = null
    pendingUndoItemId.value = null
    undoTimer = null
  }

  function undoPurchase (starsRef) {
    if (!pendingUndo) return
    clearTimeout(undoTimer)
    undoTimer = null

    // Delta rollback (Pitfall 2): refund the price, DO NOT snapshot-restore
    starsRef.value += pendingUndo.price

    // Restore previously equipped variant (or remove the key)
    const next = { ...equippedVariants.value }
    if (pendingUndo.prevEquipped) {
      next[pendingUndo.characterId] = pendingUndo.prevEquipped
    } else {
      delete next[pendingUndo.characterId]
    }
    equippedVariants.value = next

    pendingUndo = null
    pendingUndoItemId.value = null
    // NOTE: intentionally do NOT write localStorage here — undo never touches disk.
  }

  return {
    CATALOG,
    owned,
    equippedVariants,
    pendingUndoItem,
    isOwned,
    isEquipped,
    purchaseItem,
    undoPurchase,
    equippedSrcForCharacter,
  }
}
