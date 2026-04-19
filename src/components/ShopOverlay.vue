<script setup>
import { computed } from 'vue'
import ShopItemCard from './ShopItemCard.vue'
import UndoToast   from './UndoToast.vue'

const props = defineProps({
  stars:            { type: Number,  required: true },
  catalog:          { type: Array,   required: true },
  owned:            { type: Array,   required: true },
  equippedVariants: { type: Object,  required: true },
  pendingUndoItem:  { type: Object,  default: null  },
})

const emit = defineEmits(['close', 'purchase', 'undo', 'expired'])

// Character display-name lookup for grouping/context (not a header-per-character, just for labels)
const CHARACTER_NAMES = {
  peach:    'Princess Peach',
  daisy:    'Princess Daisy',
  rosalina: 'Rosalina',
  toad:     'Toad',
}

function isOwned (itemId) {
  const item = props.catalog.find(i => i.id === itemId)
  if (!item) return false
  if (item.variantId === 'default' || item.price === 0) return true
  return props.owned.includes(itemId)
}

function isEquipped (itemId) {
  const item = props.catalog.find(i => i.id === itemId)
  if (!item) return false
  return props.equippedVariants[item.characterId] === itemId
}

function canAfford (item) {
  return isOwned(item.id) || props.stars >= item.price
}

const pendingLabel = computed(() => {
  if (!props.pendingUndoItem) return ''
  const charName = CHARACTER_NAMES[props.pendingUndoItem.characterId] || props.pendingUndoItem.characterId
  return `${props.pendingUndoItem.colorName} ${charName}`
})

function onCardPurchase (itemId) {
  emit('purchase', itemId)
}
</script>

<template>
  <div class="fixed inset-0 z-[200] bg-sky flex flex-col">
    <!-- Header: title + star balance + close button -->
    <header class="block-border rounded-b-3xl bg-mario-red/95 backdrop-blur-sm px-4 py-3
                   flex items-center justify-between gap-3">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-2xl">🏪</span>
        <h2 class="text-xl md:text-2xl font-extrabold tracking-tight text-mushroom-white drop-shadow-md truncate">
          Star Shop
        </h2>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1">
          <span class="text-2xl">⭐</span>
          <span class="text-2xl font-extrabold text-star-gold drop-shadow-lg">{{ stars }}</span>
        </div>
        <button
          type="button"
          class="btn-press flex items-center justify-center w-11 h-11 rounded-xl
                 bg-mushroom-white/20 hover:bg-mushroom-white/40 transition-colors cursor-pointer"
          aria-label="Close shop"
          @click="emit('close')"
        >
          <span class="text-2xl text-mushroom-white drop-shadow-md">✕</span>
        </button>
      </div>
    </header>

    <!-- Grid body: 2 columns, scrollable -->
    <main class="flex-1 overflow-y-auto p-4">
      <div class="grid grid-cols-2 gap-3 max-w-lg mx-auto">
        <ShopItemCard
          v-for="item in catalog"
          :key="item.id"
          :item="item"
          :is-owned="isOwned(item.id)"
          :is-equipped="isEquipped(item.id)"
          :can-afford="canAfford(item)"
          @purchase="onCardPurchase"
        />
      </div>

      <!-- Empty-state copy block, always visible underneath the grid for a 6-year-old audience -->
      <p class="text-center text-dark/70 text-sm font-medium mt-6 px-2">
        Answer math problems to earn ⭐ stars, then come back to spend them.
      </p>
    </main>

    <!-- Undo toast (floats above the overlay via its own fixed positioning + z-[210]) -->
    <UndoToast
      :active="!!pendingUndoItem"
      :item-name="pendingLabel"
      @undo="emit('undo')"
      @expired="emit('expired')"
    />
  </div>
</template>

<style>
/* Global fade transition for ShopOverlay (and reusable by other overlays).
   Uses unscoped selectors so Vue's Transition wrapper in App.vue can find them. */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
