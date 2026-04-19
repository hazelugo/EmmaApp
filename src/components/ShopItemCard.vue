<script setup>
import { computed } from 'vue'

const props = defineProps({
  item:       { type: Object,  required: true },
  isOwned:    { type: Boolean, default: false },
  isEquipped: { type: Boolean, default: false },
  canAfford:  { type: Boolean, default: false },
})

const emit = defineEmits(['purchase'])

// A card is interactive when:
//  - it's already equipped → no-op tap (still interactive cursor feel OK, but emit suppressed)
//  - it's owned but not equipped → tap to equip (emit 'purchase' — parent treats as re-equip with 0 cost path via composable logic; simpler: only emit when not equipped)
//  - it's affordable and not owned → tap to purchase
//  - it's unaffordable and not owned → disabled, no emit
const isInteractive = computed(() =>
  !props.isEquipped && (props.isOwned || props.canAfford)
)

const stateLabel = computed(() => {
  if (props.isEquipped) return 'Equipped'
  if (props.isOwned)    return 'Owned'
  if (!props.canAfford) return 'Locked'
  return 'Available'
})

function onTap () {
  if (!isInteractive.value) return
  emit('purchase', props.item.id)
}
</script>

<template>
  <button
    type="button"
    class="relative rounded-2xl border-4 block-border flex flex-col items-center justify-center
           min-h-[60px] min-w-[60px] p-3 transition-all duration-300 btn-press cursor-pointer
           bg-mushroom-white/90 overflow-hidden"
    :class="{
      'opacity-50 cursor-not-allowed': !isInteractive,
      'ring-4 ring-star-gold': isEquipped,
    }"
    :disabled="!isInteractive"
    :aria-disabled="!isInteractive ? 'true' : 'false'"
    :aria-label="`${item.colorName} ${item.characterId} variant — ${item.price} stars — ${stateLabel}`"
    @click="onTap"
  >
    <!-- Variant image -->
    <img
      :src="item.src"
      :alt="`${item.colorName} ${item.characterId}`"
      class="w-20 h-20 object-contain"
      style="image-rendering: pixelated;"
    />

    <!-- Color name -->
    <span class="mt-1 text-sm font-bold text-dark">{{ item.colorName }}</span>

    <!-- State badge pinned to bottom -->
    <div class="absolute bottom-1 left-0 right-0 flex justify-center z-10 pointer-events-none">
      <span
        v-if="isEquipped"
        class="bg-star-gold text-dark px-2 py-0.5 rounded-full font-bold text-xs border-2 border-dark/30"
      >✓ Equipped</span>
      <span
        v-else-if="isOwned"
        class="bg-coin text-dark px-2 py-0.5 rounded-full font-bold text-xs border-2 border-dark/30"
      >Owned</span>
      <span
        v-else-if="!canAfford"
        class="bg-dark/60 text-mushroom-white px-2 py-0.5 rounded-full font-bold text-xs"
      >⭐ {{ item.price }}</span>
      <span
        v-else
        class="bg-star-gold text-dark px-2 py-0.5 rounded-full font-bold text-xs border-2 border-dark/30"
      >⭐ {{ item.price }}</span>
    </div>
  </button>
</template>
