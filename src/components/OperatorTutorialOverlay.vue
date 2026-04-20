<script setup>
/**
 * OperatorTutorialOverlay.vue
 *
 * One-time animated tutorial that fires the first time a new operator
 * (× at level 3, ÷ at level 5) becomes available. Child taps to advance
 * through the steps; final tap emits 'done' and the parent dismisses the
 * overlay by calling useMathGame().dismissTutorial().
 *
 * Props:
 *   show     {Boolean} — controls visibility (wrap the <div> in <Transition>)
 *   operator {String}  — '×' or '÷' — determines the dot grid content
 *
 * Emits:
 *   done — fired on the tap that leaves the final step
 */

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  show:     { type: Boolean, default: false },
  operator: { type: String,  default: null  },
})

const emit = defineEmits(['done'])

/* ── Animation state ──────────────────────────────────────────── */
const step         = ref(0)      // 0 = dots appear, 1 = equation reveal, 2 = final "Got it!" state
const showDots     = ref(false)
const showArrow    = ref(false)
const showEquation = ref(false)
let timers = []

const maxStep = 2  // step values: 0, 1, 2 (three visual phases before 'done')

function clearTimers () {
  timers.forEach(clearTimeout)
  timers = []
}

function startTutorial () {
  step.value         = 0
  showDots.value     = false
  showArrow.value    = false
  showEquation.value = false
  clearTimers()

  timers.push(setTimeout(() => { showDots.value     = true }, 250))
  timers.push(setTimeout(() => { showArrow.value    = true }, 800))
  timers.push(setTimeout(() => { showEquation.value = true }, 1200))
}

function onTap () {
  if (step.value < maxStep) {
    step.value++
  } else {
    emit('done')
  }
}

/* ── Content helpers ─────────────────────────────────────────── */
// For ×: show 3 groups of 4 dots → arrow → "3 × 4 = 12"
// For ÷: show 12 dots split into 3 groups of 4 → arrow → "12 ÷ 3 = 4"
const isMultiply = computed(() => props.operator === '×')
const isDivide   = computed(() => props.operator === '÷')

const groupCount   = 3
const dotsPerGroup = 4

const headline = computed(() => isMultiply.value
  ? 'New move: Multiplication!'
  : 'New move: Division!')

const explanation = computed(() => isMultiply.value
  ? '3 groups of 4 is 3 × 4 = 12'
  : '12 split into 3 groups is 12 ÷ 3 = 4')

const equationText = computed(() => isMultiply.value
  ? '3 × 4 = 12'
  : '12 ÷ 3 = 4')

const tapHint = computed(() => step.value < maxStep
  ? 'Tap to continue'
  : 'Tap to start!')

/* ── Lifecycle ──────────────────────────────────────────────── */
watch(() => props.show, (val) => {
  if (val) startTutorial()
  else clearTimers()
})

onMounted(() => {
  if (props.show) startTutorial()
})

onUnmounted(() => {
  clearTimers()
})
</script>

<template>
  <Transition name="tutorial-fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[200] bg-dark/95 flex flex-col items-center justify-center gap-6 p-6 cursor-pointer select-none"
      @click="onTap"
    >
      <!-- Headline -->
      <h2 class="text-star-gold text-3xl md:text-4xl font-black text-center drop-shadow-lg pop-in">
        {{ headline }}
      </h2>

      <!-- Dot grid (step 0+) -->
      <div
        v-if="showDots"
        class="flex flex-col gap-2 pop-in"
      >
        <div
          v-for="g in groupCount"
          :key="g"
          class="flex gap-2 p-2 rounded-xl"
          :class="{ 'bg-mushroom-white/10': isDivide }"
        >
          <span
            v-for="d in dotsPerGroup"
            :key="d"
            class="w-5 h-5 md:w-6 md:h-6 rounded-full bg-star-gold border-2 border-dark/40 shadow-md"
          />
        </div>
      </div>

      <!-- Arrow (step 1+) -->
      <div
        v-if="showArrow"
        class="text-mario-red text-5xl font-black pop-in"
      >
        ↓
      </div>

      <!-- Equation (shown when showEquation true AND step >= 1) -->
      <div
        v-if="showEquation && step >= 1"
        class="text-mushroom-white text-4xl md:text-5xl font-black pop-in"
      >
        {{ equationText }}
      </div>

      <!-- Explanation line (step 2+) -->
      <p
        v-if="step >= 2"
        class="text-mushroom-white text-lg md:text-xl text-center max-w-md pop-in"
      >
        {{ explanation }}
      </p>

      <!-- Tap hint (always present at bottom) -->
      <p class="text-mushroom-white/70 text-sm md:text-base mt-4 animate-pulse">
        {{ tapHint }}
      </p>
    </div>
  </Transition>
</template>

<style scoped>
/* Scoped transition — no global .fade-* rule exists in src/style.css */
.tutorial-fade-enter-active { transition: opacity 0.35s ease; }
.tutorial-fade-leave-active { transition: opacity 0.25s ease; }
.tutorial-fade-enter-from,
.tutorial-fade-leave-to     { opacity: 0; }
</style>
