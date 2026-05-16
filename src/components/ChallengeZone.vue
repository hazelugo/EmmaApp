<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  num1:       { type: Number, required: true },
  num2:       { type: Number, required: true },
  operator:   { type: String, required: true },
  answer:     { type: String, default: '' },
  feedback:   { type: String, default: '' },
  problemKey: { type: Number, default: 0 },
  character:  { type: Object, required: true },
  variantSrc: { type: String, default: null  },
  zeroHint:   { type: String, default: ''    },
})

/* ── Zero-hint bubble (D-10, D-11) ────────────────────────────────── */
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
  <section
    id="challenge-zone"
    class="block-border flex-1 flex flex-col items-center justify-center
           rounded-3xl bg-coin/90 backdrop-blur-sm p-6 min-h-[200px]
           transition-all duration-300"
    :class="{
      'pulse-glow ring-4 ring-star-gold/70': feedback === 'correct',
      'shake ring-4 ring-mario-red/60': feedback === 'wrong',
    }"
  >
    <!-- Question Block "?" decoration at top removed per feedback -->

    <!-- Character Mascot (moved from MascotPanel so it shows on mobile) -->
    <div class="relative flex items-center justify-center mb-4 md:mb-6">
      <div 
        class="absolute w-20 h-20 md:w-32 md:h-32 rounded-full blur-md"
        :class="character.bg"
      ></div>
      <!-- Zero-operand hint bubble (D-10, D-11) -->
      <Transition name="bubble-fade">
        <div
          v-if="showBubble && zeroHint"
          class="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full
                 bg-mushroom-white border-2 border-dark/30 rounded-2xl rounded-bl-sm
                 px-3 py-2 text-xs md:text-sm font-bold text-dark text-center
                 min-w-[140px] max-w-[200px] shadow-lg z-30 pointer-events-none"
        >
          {{ zeroHint }}
          <span class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full
                       border-[8px] border-transparent border-t-mushroom-white" />
        </div>
      </Transition>
      <img
        v-if="variantSrc || character.src"
        :src="variantSrc || character.src"
        :alt="character.name"
        class="relative w-24 md:w-36 animate-float drop-shadow-xl z-20"
        style="image-rendering: pixelated;"
        :class="{
          'scale-110 transition-transform duration-300': feedback === 'correct',
          'shake': feedback === 'wrong',
        }"
      />
      <div 
        v-else 
        class="relative text-7xl md:text-9xl filter drop-shadow-md animate-float z-20"
        :class="{
          'scale-110 transition-transform duration-300': feedback === 'correct',
          'shake': feedback === 'wrong',
        }"
      >
        {{ character.emoji }}
      </div>
    </div>

    <!-- Problem display — pop-in on new problem -->
    <div class="flex items-center gap-2 md:gap-3 text-center pop-in" :key="problemKey">
      <!-- First Number -->
      <span class="text-6xl md:text-7xl font-extrabold text-dark drop-shadow-lg">
        {{ num1 }}
      </span>

      <!-- Operator -->
      <span class="text-5xl md:text-6xl font-extrabold text-mario-red drop-shadow-md">
        {{ operator }}
      </span>

      <!-- Second Number -->
      <span class="text-6xl md:text-7xl font-extrabold text-dark drop-shadow-lg">
        {{ num2 }}
      </span>

      <!-- Equals -->
      <span class="text-5xl md:text-6xl font-extrabold text-mario-red drop-shadow-md">
        =
      </span>

      <!-- Answer Box (styled like a ? block) -->
      <div
        class="relative min-w-[80px] md:min-w-[100px] rounded-2xl border-4
               flex items-center justify-center px-4 py-2
               transition-colors duration-200"
        :class="{
          'border-block-outline bg-mushroom-white/60':   !feedback,
          'border-star-gold bg-star-glow/40 block-bump': feedback === 'correct',
          'border-mario-red bg-mario-red/15':             feedback === 'wrong',
        }"
      >
        <span
          v-if="answer"
          class="text-6xl md:text-7xl font-extrabold text-dark drop-shadow-lg"
        >
          {{ answer }}
        </span>

        <!-- Blinking cursor placeholder -->
        <span
          v-else
          class="text-6xl md:text-7xl font-extrabold text-block-outline/50 animate-pulse"
        >
          ?
        </span>
      </div>
    </div>

  </section>
</template>

<style scoped>
/* ── Speech bubble fade (D-10) ────────────────────────────────── */
.bubble-fade-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.bubble-fade-leave-active { transition: opacity 0.2s ease, transform 0.15s ease; }
.bubble-fade-enter-from,
.bubble-fade-leave-to     { opacity: 0; transform: translateX(-50%) translateY(calc(-100% - 4px)) scale(0.9); }
</style>
