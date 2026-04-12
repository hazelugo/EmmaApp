<script setup>
import ScoreHeader   from './components/ScoreHeader.vue'
import MascotPanel   from './components/MascotPanel.vue'
import ChallengeZone from './components/ChallengeZone.vue'
import NumberPad     from './components/NumberPad.vue'
import ConfettiBurst from './components/ConfettiBurst.vue'

import { useMathGame } from './composables/useMathGame.js'
import { useSound }    from './composables/useSound.js'

import { ref } from 'vue'

/* ── Composables ──────────────────────────────────────────────── */
const {
  stars, streak, problemKey,
  currentProblem, answer, feedback,
  difficulty,
  generateProblem, checkAnswer, clearFeedback,
  appendDigit, backspace,
} = useMathGame()

const { isMuted, toggleMute, playCorrect, playWrong, playTap, playStreak } = useSound()

/* ── UI State ─────────────────────────────────────────────────── */
const showConfetti = ref(false)

/* ── Number Pad Handlers ──────────────────────────────────────── */
function onDigit (digit) {
  if (appendDigit(digit)) playTap()
}

function onBackspace () {
  if (backspace()) playTap()
}

function onSubmit () {
  const result = checkAnswer()
  if (!result) return

  if (result === 'correct') {
    showConfetti.value = true
    playCorrect()

    // Streak fanfare at milestones
    if (streak.value === 5 || streak.value === 10 || streak.value % 10 === 0) {
      setTimeout(playStreak, 400)
    }

    setTimeout(() => {
      showConfetti.value = false
      generateProblem()
    }, 1400)
  } else {
    playWrong()
    setTimeout(clearFeedback, 900)
  }
}
</script>

<template>
  <div
    id="app-root"
    class="flex flex-col min-h-dvh max-w-lg mx-auto px-3 py-3 gap-3 select-none"
  >
    <!-- Confetti overlay -->
    <ConfettiBurst :active="showConfetti" />

    <!-- ★ Score Header -->
    <ScoreHeader
      :stars="stars"
      :streak="streak"
      :is-muted="isMuted"
      :max-operand="difficulty.maxOperand"
      @toggle-mute="toggleMute"
    />

    <!-- Middle: Mascot + Challenge -->
    <div class="flex flex-1 gap-3 items-stretch min-h-0">
      <!-- Mascot (left) -->
      <MascotPanel :feedback="feedback" />

      <!-- Challenge Zone (centre) -->
      <ChallengeZone
        :num1="currentProblem.a"
        :num2="currentProblem.b"
        :operator="currentProblem.operator"
        :answer="answer"
        :feedback="feedback"
        :problem-key="problemKey"
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
