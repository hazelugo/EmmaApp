<script setup>
import ScoreHeader      from './components/ScoreHeader.vue'
import ChallengeZone    from './components/ChallengeZone.vue'
import NumberPad        from './components/NumberPad.vue'
import LevelUpModal     from './components/LevelUpModal.vue'
import CharacterSelect  from './components/CharacterSelect.vue'
import LevelIntroModal  from './components/LevelIntroModal.vue'
import LevelVictoryModal from './components/LevelVictoryModal.vue'
import ShopOverlay from './components/ShopOverlay.vue'
import OperatorTutorialOverlay from './components/OperatorTutorialOverlay.vue'
import TimerResultsOverlay from './components/TimerResultsOverlay.vue'

import { ref, computed, watch } from 'vue'
import confetti from 'canvas-confetti'

import { useMathGame }   from './composables/useMathGame.js'
import { useTimer }      from './composables/useTimer.js'
import { useSound }      from './composables/useSound.js'
import { useShop }       from './composables/useShop.js'
import { getLevelTheme } from './composables/useLevelTheme.js'

/* ── Composables ──────────────────────────────────────────────── */
const {
  stars, problemKey,
  currentProblem, answer, feedback,
  difficulty, showLevelUp,
  showLevelVictory, completedLevel,
  showLevelIntro, pendingLevel,
  showTutorial, tutorialOperator,
  zeroHint,
  generateProblem, checkAnswer, clearFeedback,
  appendDigit, backspace, resetGame,
  dismissTutorial,
} = useMathGame()

const timer = useTimer()

/* ── Timer Mode State ─────────────────────────────────────────── */
const isTimerMode       = ref(false)
const showTimerResults  = ref(false)

const { isMuted, toggleMute, playCorrect, playWrong, playTap, playLevelUp, playThemeMusic, stopThemeMusic } = useSound()

/* ── Shop ─────────────────────────────────────────────────────── */
const {
  CATALOG,
  owned,
  equippedVariants,
  pendingUndoItem,
  purchaseItem,
  undoPurchase,
  equippedSrcForCharacter,
} = useShop()

const showShop = ref(false)

/* ── Timer Mode Handlers ──────────────────────────────────────── */
/**
 * Called when the Sprint button is clicked (ScoreHeader emits 'start-sprint').
 * Starts the 60-second countdown and switches the game into timer mode.
 */
function handleSprintStart () {
  isTimerMode.value = true
  showTimerResults.value = false
  answer.value = ''
  timer.startTimer(handleSprintEnd)
}

/**
 * Called by useTimer's onComplete callback when the 60 seconds expire.
 * Shows results overlay and persists earned coins to the main star pool.
 */
function handleSprintEnd () {
  timer.handleComplete()
  // Add earned coins to the main star pool and persist to localStorage
  stars.value += timer.stars.value
  try { localStorage.setItem('emma-stars', stars.value) } catch { /* ignore */ }
  // Discard in-progress answer
  answer.value = ''
  isTimerMode.value = false
  showTimerResults.value = true
}

/**
 * Called when the player dismisses the results overlay.
 * Restores normal game by generating a fresh standard problem.
 */
function onTimerResultsClose () {
  showTimerResults.value = false
  generateProblem()
}

function onOpenShop () {
  showShop.value = true
}

function onCloseShop () {
  showShop.value = false
}

function onPurchaseItem (itemId) {
  purchaseItem(itemId, stars)
}

function onUndoPurchase () {
  undoPurchase(stars)
}

function onUndoExpired () {
  // Timer already fired inside useShop; nothing to do here.
  // Handler exists so the @expired event on <ShopOverlay> has a binding.
}

/** Equipped variant src for the currently selected character, or null. */
const equippedVariantSrc = computed(() => {
  if (!selectedCharacter.value) return null
  return equippedSrcForCharacter(selectedCharacter.value.id)
})

/* ── Level themes ─────────────────────────────────────────────── */
// Theme for the INCOMING level (pre-level intro)
const currentTheme = computed(() => getLevelTheme(pendingLevel.value, selectedCharacter.value?.id))
// Theme for the level that was JUST beaten (victory screen)
const victoryTheme = computed(() => getLevelTheme(completedLevel.value, selectedCharacter.value?.id))

/* ── Operator unlock announcement (D-16) ──────────────────────── */
const unlockedOperator = computed(() => {
  if (pendingLevel.value === 3) return '×'
  if (pendingLevel.value === 5) return '÷'
  return null
})

/* ── Character Selection ──────────────────────────────────────── */
const selectedCharacter = ref(null)

function onSelectCharacter (char) {
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
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#E52521', '#4CAF50', '#F8A5C2', '#FFB300'],
      shapes: ['star', 'circle'],
    })

    playCorrect()

    setTimeout(() => {
      // Don't generate next problem while victory, intro, level-up, or tutorial screens are showing
      if (!showLevelVictory.value && !showLevelUp.value && !showLevelIntro.value && !showTutorial.value) generateProblem()
    }, 1400)
  } else {
    playWrong()
    setTimeout(clearFeedback, 900)
  }
}

function closeLevelUp () {
  showLevelUp.value = false
  if (!showLevelIntro.value && !showLevelVictory.value && !showTutorial.value) generateProblem()
}

/**
 * Player tapped "NEXT WORLD" on the victory screen.
 * Hide victory, then show the pre-level intro for the new level.
 * If we're on level 7 (Bowser beaten), no next intro — just keep playing.
 */
function onVictoryNext () {
  showLevelVictory.value = false
  playThemeMusic(selectedCharacter.value.id)
  if (completedLevel.value < 7) {
    showLevelIntro.value = true
  } else {
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

// Watch for victory to stop music and play fanfare
watch(showLevelVictory, (val) => {
  if (val) {
    showShop.value = false          // prevent z-[200] overlap with victory overlay
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

    <!-- Level Victory — shows after each level is beaten -->
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
      :unlocked-operator="unlockedOperator"
      @start="onLevelIntroStart"
    />

    <!-- Operator Tutorial — fires once per newly-unlocked operator (MATH-01, MATH-02) -->
    <OperatorTutorialOverlay
      v-if="selectedCharacter"
      :show="showTutorial"
      :operator="tutorialOperator"
      @done="dismissTutorial"
    />

    <!-- Level Up Modal overlay -->
    <LevelUpModal
      :show="showLevelUp"
      :stars="stars"
      @close="closeLevelUp"
    />

    <!-- Star Shop Overlay -->
    <Transition name="fade">
      <ShopOverlay
        v-if="showShop"
        :stars="stars"
        :catalog="CATALOG"
        :owned="owned"
        :equipped-variants="equippedVariants"
        :pending-undo-item="pendingUndoItem"
        @close="onCloseShop"
        @purchase="onPurchaseItem"
        @undo="onUndoPurchase"
        @expired="onUndoExpired"
      />
    </Transition>

    <!-- Timer Results Overlay -->
    <TimerResultsOverlay
      :show="showTimerResults"
      :coins="timer.stars.value"
      :correct-count="timer.correctCount.value"
      :high-score="timer.highScore.value"
      :is-new-high-score="timer.correctCount.value > 0 && timer.correctCount.value === timer.highScore.value"
      @close="onTimerResultsClose"
    />

    <!-- ★ Score Header -->
    <ScoreHeader
      :stars="stars"
      :is-muted="isMuted"
      :is-timer-mode="isTimerMode"
      :time-left="timer.timeLeft.value"
      @toggle-mute="toggleMute"
      @open-shop="onOpenShop"
      @start-sprint="handleSprintStart"
    />

    <!-- Middle: Challenge -->
    <div class="flex flex-1 gap-3 items-stretch min-h-0">
      <ChallengeZone
        v-if="selectedCharacter"
        :num1="currentProblem.a"
        :num2="currentProblem.b"
        :operator="currentProblem.operator"
        :answer="answer"
        :feedback="feedback"
        :problem-key="problemKey"
        :character="selectedCharacter"
        :variant-src="equippedVariantSrc"
        :zero-hint="zeroHint"
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
