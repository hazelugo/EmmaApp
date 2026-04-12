<script setup>
import { ref, computed } from 'vue'

import ScoreHeader  from './components/ScoreHeader.vue'
import MascotPanel  from './components/MascotPanel.vue'
import ChallengeZone from './components/ChallengeZone.vue'
import NumberPad    from './components/NumberPad.vue'

/* ── Game State ───────────────────────────────────────────────── */
const stars     = ref(0)
const streak    = ref(0)

const num1      = ref(0)
const num2      = ref(0)
const operator  = ref('+')
const answer    = ref('')
const feedback  = ref('')   // 'correct' | 'wrong' | ''

const correctAnswer = computed(() => {
  if (operator.value === '+') return num1.value + num2.value
  return num1.value - num2.value
})

/** Generate a brand-new problem */
function generateProblem () {
  // Keep numbers small for a 6-year-old (0-10)
  const ops = ['+', '-']
  operator.value = ops[Math.floor(Math.random() * ops.length)]

  if (operator.value === '+') {
    num1.value = Math.floor(Math.random() * 10) + 1
    num2.value = Math.floor(Math.random() * 10) + 1
  } else {
    // Ensure no negative results
    const a = Math.floor(Math.random() * 10) + 1
    const b = Math.floor(Math.random() * (a + 1))
    num1.value = a
    num2.value = b
  }

  answer.value = ''
  feedback.value = ''
}

/* ── Number Pad Handlers ──────────────────────────────────────── */
function onDigit (digit) {
  if (feedback.value) return          // lock input during feedback
  if (answer.value.length >= 3) return // max 3 digits
  answer.value += String(digit)
}

function onBackspace () {
  if (feedback.value) return
  answer.value = answer.value.slice(0, -1)
}

function onSubmit () {
  if (answer.value === '' || feedback.value) return

  if (Number(answer.value) === correctAnswer.value) {
    feedback.value = 'correct'
    stars.value++
    streak.value++
    setTimeout(generateProblem, 1200)
  } else {
    feedback.value = 'wrong'
    streak.value = 0
    setTimeout(() => { feedback.value = '' }, 900)
  }
}

/* ── Kick off first problem ───────────────────────────────────── */
generateProblem()
</script>

<template>
  <div
    id="app-root"
    class="flex flex-col min-h-dvh max-w-lg mx-auto px-3 py-3 gap-3 select-none"
  >
    <!-- ★ Score Header -->
    <ScoreHeader :stars="stars" :streak="streak" />

    <!-- Middle: Mascot + Challenge -->
    <div class="flex flex-1 gap-3 items-stretch min-h-0">
      <!-- Mascot (left) -->
      <MascotPanel :feedback="feedback" />

      <!-- Challenge Zone (centre) -->
      <ChallengeZone
        :num1="num1"
        :num2="num2"
        :operator="operator"
        :answer="answer"
        :feedback="feedback"
      />
    </div>

    <!-- Number Pad (bottom) -->
    <NumberPad
      :disabled="!!feedback"
      @digit="onDigit"
      @backspace="onBackspace"
      @submit="onSubmit"
    />
  </div>
</template>
