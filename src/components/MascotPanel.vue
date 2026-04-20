<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  feedback:   { type: String, default: '' },
  character:  { type: Object, required: true },
  variantSrc: { type: String, default: null },
  zeroHint:   { type: String, default: '' },   // NEW: hint text, empty string when no zero
})

/* ── Speech bubble auto-dismiss (D-10, D-11) ──────────────── */
const showBubble = ref(false)
let bubbleTimer = null

watch(() => props.zeroHint, (hint) => {
  clearTimeout(bubbleTimer)
  if (hint) {
    showBubble.value = true
    bubbleTimer = setTimeout(() => { showBubble.value = false }, 3000)
  } else {
    showBubble.value = false
  }
}, { immediate: true })

onUnmounted(() => {
  clearTimeout(bubbleTimer)
})
</script>

<template>
  <aside
    id="mascot-panel"
    class="hidden sm:flex flex-col items-center justify-center w-28 md:w-36 shrink-0"
  >
    <!-- Character Mascot -->
    <div class="relative flex items-center justify-center">
      <!-- Zero-operand hint bubble (D-10) -->
      <Transition name="bubble-fade">
        <div
          v-if="showBubble && zeroHint"
          class="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full
                 bg-mushroom-white border-2 border-dark/30 rounded-2xl rounded-bl-sm
                 px-3 py-2 text-xs font-bold text-dark text-center w-32 shadow-md z-30
                 pointer-events-none"
        >
          {{ zeroHint }}
          <!-- Bubble tail -->
          <span class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full
                       border-[8px] border-transparent border-t-mushroom-white" />
        </div>
      </Transition>

      <div 
        class="absolute w-28 h-28 md:w-36 md:h-36 rounded-full blur-md"
        :class="character.bg"
      ></div>
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
      <!-- Emoji Fallback if no sprite image available -->
      <div 
        v-else 
        class="relative text-8xl md:text-9xl filter drop-shadow-md animate-float z-20"
        :class="{
          'scale-110 transition-transform duration-300': feedback === 'correct',
          'shake': feedback === 'wrong',
        }"
      >
        {{ character.emoji }}
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* ── Speech bubble fade (D-10) ──────────────────────────────── */
.bubble-fade-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.bubble-fade-leave-active { transition: opacity 0.2s ease, transform 0.15s ease; }
.bubble-fade-enter-from,
.bubble-fade-leave-to     { opacity: 0; transform: translateX(-50%) translateY(calc(-100% - 4px)) scale(0.9); }
</style>
