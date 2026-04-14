<script setup>
import ScoreHeader   from './components/ScoreHeader.vue'
import MascotPanel   from './components/MascotPanel.vue'
import ChallengeZone from './components/ChallengeZone.vue'
import NumberPad     from './components/NumberPad.vue'
import LevelUpModal  from './components/LevelUpModal.vue'
import CharacterSelect from './components/CharacterSelect.vue'

import { ref, watch } from 'vue'
import confetti from 'canvas-confetti'

import { useMathGame } from './composables/useMathGame.js'
import { useSound }    from './composables/useSound.js'

/* ── Composables ──────────────────────────────────────────────── */
const {
  stars, streak, problemKey,
  currentProblem, answer, feedback,
  showLevelUp,
  generateProblem, checkAnswer, clearFeedback,
  appendDigit, backspace,
} = useMathGame()

const { isMuted, toggleMute, playCorrect, playWrong, playTap, playStreak, playLevelUp } = useSound()

/* ── Character Selection ──────────────────────────────────────── */
const selectedCharacter = ref(null)

function onSelectCharacter(char) {
  selectedCharacter.value = char
  playTap()
}

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
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#E52521', '#4CAF50', '#F8A5C2', '#FFB300'],
      shapes: ['star', 'circle'],
    })

    playCorrect()

    // Streak fanfare at milestones (5, then every 10)
    if (streak.value === 5 || streak.value % 10 === 0) {
      setTimeout(playStreak, 400)
    }

    setTimeout(() => {
      if (!showLevelUp.value) generateProblem()
    }, 1400)
  } else {
    playWrong()
    setTimeout(clearFeedback, 900)
  }
}

function closeLevelUp() {
  showLevelUp.value = false
  generateProblem()
}

// Watch for level up to play the fanfare
watch(showLevelUp, (val) => {
  if (val) playLevelUp()
})
</script>

<template>
  <div
    id="app-root"
    class="relative z-10 flex flex-col min-h-dvh max-w-lg mx-auto px-3 py-3 gap-3 select-none"
  >
    <!-- Character Select Overlay -->
    <Transition name="fade">
      <CharacterSelect 
        v-if="!selectedCharacter" 
        @select="onSelectCharacter" 
      />
    </Transition>

    <!-- Level Up Modal overlay -->
    <LevelUpModal 

      :show="showLevelUp" 
      :stars="stars" 
      @close="closeLevelUp" 
    />

    <!-- ★ Score Header -->
    <ScoreHeader
      :stars="stars"
      :streak="streak"
      :is-muted="isMuted"
      @toggle-mute="toggleMute"
    />

    <!-- Middle: Mascot + Challenge -->
    <div class="flex flex-1 gap-3 items-stretch min-h-0">
      <!-- Mascot (left) -->
      <MascotPanel v-if="selectedCharacter" :feedback="feedback" :character="selectedCharacter" />

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
