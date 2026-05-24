<script setup>
import ScoreHeader      from './components/ScoreHeader.vue'
import ChallengeZone    from './components/ChallengeZone.vue'
import NumberPad        from './components/NumberPad.vue'
import LevelUpModal     from './components/LevelUpModal.vue'
import CharacterSelect  from './components/CharacterSelect.vue'
import LevelIntroModal  from './components/LevelIntroModal.vue'
import LevelVictoryModal from './components/LevelVictoryModal.vue'
import ModeSelect from './components/ModeSelect.vue'
import ShopOverlay from './components/ShopOverlay.vue'
import OperatorTutorialOverlay from './components/OperatorTutorialOverlay.vue'
import TimerResultsOverlay from './components/TimerResultsOverlay.vue'
import SoundSettingsOverlay from './components/SoundSettingsOverlay.vue'
import PWAInstallPrompt from './components/PWAInstallPrompt.vue'

import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import confetti from 'canvas-confetti'

import { useMathGame }        from './composables/useMathGame.js'
import { useTimer }           from './composables/useTimer.js'
import { useSound }           from './composables/useSound.js'
import { useShop }            from './composables/useShop.js'
import { getLevelTheme }      from './composables/useLevelTheme.js'
import { useCharacterVoice }  from './composables/useCharacterVoice.js'
import { CHARACTERS }         from './data/characters.js'

/* ── Composables ──────────────────────────────────────────────── */
const {
  stars, streak, problemKey,
  currentProblem, answer, feedback,
  difficulty, showLevelUp,
  showLevelVictory, completedLevel,
  showLevelIntro, pendingLevel,
  showTutorial, tutorialOperator,
  zeroHint,
  generateProblem, checkAnswer, clearFeedback,
  appendDigit, backspace, resetGame,
  dismissTutorial,
  creditTimerCoins,
} = useMathGame()

const timer = useTimer()

/* ── Mode Selection ───────────────────────────────────────────── */
const selectedMode = ref(null) // null | 'adventure' | 'sprint'

function onSelectMode (mode) {
  selectedMode.value = mode
  localStorage.setItem('emma-mode', mode)
  if (mode === 'sprint') {
    handleSprintStart()
  } else {
    generateProblem()
  }
}

/* ── Timer Mode State ─────────────────────────────────────────── */
const isTimerMode       = ref(false)
const showTimerResults  = ref(false)

const { isMuted, volume, toggleMute, setVolume, playCorrect, playWrong, playTap, playDigitNote, playStreak, playLevelUp, playThemeMusic, stopThemeMusic } = useSound()
const voice = useCharacterVoice()

/* ── Sound Settings ────────────────────────────────────────────── */
const showSoundSettings = ref(false)
function onOpenSoundSettings () { showSoundSettings.value = true }
function onCloseSoundSettings () { showSoundSettings.value = false }
function onSetVolume (v) { setVolume(v) }

/* ── Idle Nudge ───────────────────────────────────────────────── */
const idleMessage    = ref('')
const streakFlash    = ref('')   // CSS class for screen flash at streak milestones
let   idleTimer      = null
let   idleClearTimer = null

function resetIdleTimer () {
  clearTimeout(idleTimer)
  clearTimeout(idleClearTimer)
  idleMessage.value = ''
  if (!selectedCharacter.value || feedback.value) return
  idleTimer = setTimeout(() => {
    const charId = selectedCharacter.value?.id
    const text   = voice.sayIdle(charId, isMuted.value)
    idleMessage.value = text
    idleClearTimer = setTimeout(() => { idleMessage.value = '' }, 4500)
  }, 8000)
}

/* ── Streak Explosion ─────────────────────────────────────────── */
function fireStreakExplosion (n) {
  const colors = ['#FFD700', '#E52521', '#4CAF50', '#F8A5C2', '#80D8FF', '#FFB300']

  if (n >= 10) {
    // Triple burst from left, centre, right + gold flash
    ;[0.1, 0.5, 0.9].forEach((x, i) => {
      setTimeout(() => confetti({
        particleCount: 160,
        startVelocity: 38,
        spread: 360,
        ticks: 90,
        gravity: 0.65,
        origin: { x, y: 0.45 },
        colors,
        shapes: ['star', 'circle'],
      }), i * 180)
    })
    streakFlash.value = 'flash-gold'
    setTimeout(() => { streakFlash.value = '' }, 700)
  } else if (n >= 5) {
    // Dual burst from sides + orange flash
    ;[0.15, 0.85].forEach((x, i) => {
      setTimeout(() => confetti({
        particleCount: 110,
        startVelocity: 32,
        spread: 280,
        ticks: 65,
        gravity: 0.72,
        origin: { x, y: 0.4 },
        colors,
        shapes: ['star', 'circle'],
      }), i * 200)
    })
    streakFlash.value = 'flash-star'
    setTimeout(() => { streakFlash.value = '' }, 500)
  } else {
    // n === 3 — single upward burst
    confetti({
      particleCount: 70,
      spread: 180,
      origin: { y: 0.55 },
      colors: ['#FFD700', '#4CAF50', '#E52521'],
      shapes: ['star'],
    })
  }
}

/* ── PWA Install Prompt ──────────────────────────────────────── */
const showPWAPrompt    = ref(false)
let   deferredPrompt   = null
let   installTimer     = null

onMounted(() => {
  // Don't show if already dismissed or installed
  if (localStorage.getItem('emma-pwa-dismissed')) return

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()             // stop browser's native mini-bar
    deferredPrompt = e
    // Show our custom prompt after 60 seconds of engagement
    installTimer = setTimeout(() => { showPWAPrompt.value = true }, 60_000)
  })

  // If already installed, make sure prompt stays hidden
  window.addEventListener('appinstalled', () => {
    showPWAPrompt.value = false
    clearTimeout(installTimer)
    localStorage.setItem('emma-pwa-dismissed', '1')
  })
})

onBeforeUnmount(() => clearTimeout(installTimer))

async function onPWAInstall () {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  if (outcome === 'accepted') {
    localStorage.setItem('emma-pwa-dismissed', '1')
  }
  deferredPrompt = null
  showPWAPrompt.value = false
}

function onPWADismiss () {
  showPWAPrompt.value = false
  clearTimeout(installTimer)
  localStorage.setItem('emma-pwa-dismissed', '1')
}

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
  // Route earned coins through milestone check so level progression fires correctly
  creditTimerCoins(timer.stars.value)
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
  selectedMode.value = null
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

/* ── Navigation ───────────────────────────────────────────────── */
function onGoHome () {
  if (isTimerMode.value) {
    timer.handleComplete()
    isTimerMode.value = false
  }
  selectedMode.value = null
  selectedCharacter.value = null
  stopThemeMusic()
  resetIdleTimer()
}

/* ── Character Selection ──────────────────────────────────────── */
const selectedCharacter = ref(null)

/* Restore last session so returning players skip both select screens */
onMounted(() => {
  const savedId   = localStorage.getItem('emma-character')
  const savedMode = localStorage.getItem('emma-mode')
  if (!savedId) return
  const char = CHARACTERS.find(c => c.id === savedId)
  if (!char) return
  selectedCharacter.value = char
  playThemeMusic(char.id)
  if (savedMode === 'adventure' || savedMode === 'sprint') {
    onSelectMode(savedMode)
  }
})

function onSelectCharacter (char) {
  const prevChar = localStorage.getItem('emma-character')
  if (prevChar !== char.id) {
    resetGame()
  }
  localStorage.setItem('emma-character', char.id)
  selectedCharacter.value = char
  selectedMode.value = null
  playThemeMusic(char.id)
  resetIdleTimer()
}

/* ── Number Pad Handlers ──────────────────────────────────────── */
function onDigit (digit) {
  if (appendDigit(digit)) {
    playDigitNote(digit)   // xylophone note per digit
    resetIdleTimer()
  }
}

function onBackspace () {
  if (backspace()) {
    playTap()
    resetIdleTimer()
  }
}

function onSubmit () {
  // ── Timer Mode path ────────────────────────────────────────────
  if (isTimerMode.value) {
    if (answer.value === '') return   // nothing to check

    const prob = timer.currentProblem.value
    const opMap = { '+': prob.a + prob.b, '-': prob.a - prob.b }
    const correctAnswer = opMap[prob.operator]
    if (correctAnswer === undefined) {
      console.error(`[timer] Unexpected operator: ${prob.operator}`)
      answer.value = ''
      return
    }

    if (Number(answer.value) === correctAnswer) {
      playCorrect()
      timer.incrementScore()
      timer.incrementCorrect()
      answer.value = ''
      timer.nextProblem()           // immediate next problem — no delay
    } else {
      playWrong()
      answer.value = ''             // clear input; no penalty, no delay
    }
    return
  }

  // ── Standard Mode path ────────────────────────────────────────
  const result = checkAnswer()
  if (!result) return
  resetIdleTimer()

  const charId = selectedCharacter.value?.id

  if (result === 'correct') {
    // Check streak milestone BEFORE confetti so explosion fires on top
    const isStreakMilestone = streak.value === 3 || streak.value === 5
      || (streak.value >= 10 && streak.value % 5 === 0)

    if (isStreakMilestone) {
      fireStreakExplosion(streak.value)
      if (!showLevelVictory.value) {
        const milestoneText = voice.sayStreakMilestone(streak.value, charId, isMuted.value)
        idleMessage.value = milestoneText
        clearTimeout(idleClearTimer)
        idleClearTimer = setTimeout(() => { idleMessage.value = '' }, 3000)
        playStreak()
      }
    } else {
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#E52521', '#4CAF50', '#F8A5C2', '#FFB300'],
        shapes: ['star', 'circle'],
      })
      voice.sayCorrect(charId, isMuted.value)
    }

    playCorrect()

    setTimeout(() => {
      if (!showLevelVictory.value && !showLevelUp.value && !showLevelIntro.value && !showTutorial.value) generateProblem()
    }, 1400)
  } else {
    playWrong()
    voice.sayWrong(charId, isMuted.value)
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
  resetIdleTimer()
}

// Watch for victory to stop music, play fanfare, and have character speak
watch(showLevelVictory, (val) => {
  if (val) {
    showShop.value = false
    stopThemeMusic()
    playLevelUp()
    const charId = selectedCharacter.value?.id
    setTimeout(() => voice.sayLevelUp(charId, isMuted.value), 800)
  }
})
</script>

<template>
  <!-- Streak milestone screen flash (sits above everything) -->
  <Transition name="flash-fade">
    <div
      v-if="streakFlash"
      class="fixed inset-0 pointer-events-none z-[500]"
      :class="streakFlash"
    />
  </Transition>

  <div
    id="app-root"
    class="relative z-10 flex flex-col min-h-dvh max-w-lg mx-auto px-3 py-3 gap-3 select-none"
  >
    <!-- Character Select Overlay -->
    <Transition name="fade">
      <CharacterSelect
        v-if="!selectedCharacter"
        @select="onSelectCharacter"
        @open-shop="onOpenShop"
      />
    </Transition>

    <!-- Mode Select — shown after character pick, before game starts -->
    <Transition name="fade">
      <ModeSelect
        v-if="selectedCharacter && !selectedMode"
        :character="selectedCharacter"
        @select="onSelectMode"
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

    <!-- Sound Settings Overlay -->
    <Transition name="fade">
      <SoundSettingsOverlay
        v-if="showSoundSettings"
        :show="showSoundSettings"
        :is-muted="isMuted"
        :volume="volume"
        @close="onCloseSoundSettings"
        @toggle-mute="toggleMute"
        @set-volume="onSetVolume"
      />
    </Transition>

    <!-- Timer Results Overlay -->
    <TimerResultsOverlay
      :show="showTimerResults"
      :coins="timer.stars.value"
      :correct-count="timer.correctCount.value"
      :high-score="timer.highScore.value"
      :is-new-high-score="timer.isNewRecord.value"
      @close="onTimerResultsClose"
    />

    <!-- PWA Install Prompt (appears after 60s if installable) -->
    <PWAInstallPrompt
      :show="showPWAPrompt"
      @install="onPWAInstall"
      @dismiss="onPWADismiss"
    />

    <!-- ★ Score Header -->
    <ScoreHeader
      :stars="stars"
      :is-muted="isMuted"
      :is-timer-mode="isTimerMode"
      :time-left="timer.timeLeft.value"
      @open-sound-settings="onOpenSoundSettings"
      @go-home="onGoHome"
    />

    <!-- Middle: Challenge -->
    <div class="flex flex-1 gap-3 items-stretch min-h-0">
      <ChallengeZone
        v-if="selectedCharacter"
        :num1="isTimerMode ? timer.currentProblem.value.a : currentProblem.a"
        :num2="isTimerMode ? timer.currentProblem.value.b : currentProblem.b"
        :operator="isTimerMode ? timer.currentProblem.value.operator : currentProblem.operator"
        :answer="answer"
        :feedback="feedback"
        :problem-key="problemKey"
        :character="selectedCharacter"
        :variant-src="equippedVariantSrc"
        :zero-hint="zeroHint"
        :idle-message="idleMessage"
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

<style scoped>
/* ── Streak screen flash ─────────────────────────────────────── */
.flash-gold { background: rgba(255, 215, 0, 0.35); }
.flash-star { background: rgba(255, 140, 0, 0.28); }

.flash-fade-enter-active { transition: opacity 0s; }
.flash-fade-leave-active { transition: opacity 0.65s ease-out; }
.flash-fade-enter-from   { opacity: 1; }
.flash-fade-leave-to     { opacity: 0; }
</style>
