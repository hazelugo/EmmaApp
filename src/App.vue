<script setup>
import ScoreHeader      from './components/ScoreHeader.vue'
import ChallengeZone    from './components/ChallengeZone.vue'
import NumberPad        from './components/NumberPad.vue'
import LevelUpModal     from './components/LevelUpModal.vue'
import CharacterSelect  from './components/CharacterSelect.vue'
import LevelIntroModal   from './components/LevelIntroModal.vue'
import LevelVictoryModal from './components/LevelVictoryModal.vue'

import { useMathGame }    from './composables/useMathGame.js'
import { useSound }       from './composables/useSound.js'
import { getLevelTheme }  from './composables/useLevelTheme.js'

import { ref, computed, watch } from 'vue'
import confetti from 'canvas-confetti'

/* ── Composables ──────────────────────────────────────────────── */
const {
  stars, streak, problemKey,
  currentProblem, answer, feedback,
  difficulty, showLevelUp,
  showLevelVictory, completedLevel,
  showLevelIntro, pendingLevel,
  generateProblem, checkAnswer, clearFeedback,
  appendDigit, backspace, resetGame,
} = useMathGame()

const { isMuted, toggleMute, playCorrect, playWrong, playTap, playStreak, playLevelUp, playSuccessMP3, playThemeMusic, stopThemeMusic } = useSound()

/* ── Level themes ───────────────────────────────────────── */
// Theme for the INCOMING level (pre-level intro)
const currentTheme  = computed(() => getLevelTheme(pendingLevel.value, selectedCharacter.value?.id))
// Theme for the level that was JUST beaten (victory screen)
const victoryTheme  = computed(() => getLevelTheme(completedLevel.value, selectedCharacter.value?.id))

/* ── Character Selection ──────────────────────────────────────── */
const selectedCharacter = ref(null)

function onSelectCharacter(char) {
  const prevChar = localStorage.getItem('emma-character')
  if (prevChar !== char.id) {
    resetGame()
    localStorage.setItem('emma-character', char.id)
  }
  selectedCharacter.value = char
  playThemeMusic(char.id)
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
    // Canvas-Confetti Trigger
    // Mario-themed confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#E52521', '#4CAF50', '#F8A5C2', '#FFB300'],
      shapes: ['star', 'circle'],
    })

    playCorrect()
    playSuccessMP3()

    // Streak fanfare at milestones
    if (streak.value === 5 || streak.value === 10 || streak.value % 10 === 0) {
      setTimeout(playStreak, 400)
    }

    setTimeout(() => {
      // Don't generate next problem while victory, intro, or level-up screens are showing
      if (!showLevelVictory.value && !showLevelUp.value && !showLevelIntro.value) generateProblem()
    }, 1400)
  } else {
    playWrong()
    setTimeout(clearFeedback, 900)
  }
}

function closeLevelUp() {
  showLevelUp.value = false
  if (!showLevelIntro.value && !showLevelVictory.value) generateProblem()
}

/**
 * Player tapped "NEXT WORLD" on the victory screen.
 * Hide victory, then show the pre-level intro for the new level.
 * If we're on level 7 (Bowser beaten), no next intro — just reset to level 1 flow.
 */
function onVictoryNext () {
  showLevelVictory.value = false
  playThemeMusic(selectedCharacter.value.id)
  // If there's a next level queued, show its intro; else generate a new problem
  if (completedLevel.value < 7) {
    showLevelIntro.value = true
  } else {
    // Level 7 was the last — just keep playing at max level
    generateProblem()
  }
}

/**
 * Player tapped "LET'S GO!" — hide the level intro and start playing.
 */
function onLevelIntroStart () {
  showLevelIntro.value = false
  showLevelUp.value    = false
  generateProblem()
}

// Watch for level up / victory to play the fanfare
watch(showLevelVictory, (val) => {
  if (val) {
    stopThemeMusic()
    playLevelUp()
  }
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

    <!-- Level Victory — shows after each level is beaten (Peach wins!) -->
    <LevelVictoryModal
      v-if="selectedCharacter"
      :show="showLevelVictory"
      :level="completedLevel"
      :theme="victoryTheme"
      @next="onVictoryNext"
    />

    <!-- Level Intro — shows before each level with enemy reveal -->
    <LevelIntroModal
      v-if="selectedCharacter"
      :show="showLevelIntro"
      :level="pendingLevel"
      :theme="currentTheme"
      :is-muted="isMuted"
      @start="onLevelIntroStart"
    />

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
      :max-operand="difficulty.maxOperand"
      @toggle-mute="toggleMute"
    />

    <!-- Middle: Challenge -->
    <div class="flex flex-1 gap-3 items-stretch min-h-0">
      <!-- Challenge Zone (centre) -->
      <ChallengeZone
        v-if="selectedCharacter"
        :num1="currentProblem.a"
        :num2="currentProblem.b"
        :operator="currentProblem.operator"
        :answer="answer"
        :feedback="feedback"
        :problem-key="problemKey"
        :character="selectedCharacter"
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
