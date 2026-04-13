import { ref, computed, reactive } from 'vue'

/**
 * Core math game composable.
 *
 * Manages problem generation, answer checking, scoring,
 * streak tracking, and adaptive difficulty.
 */
export function useMathGame () {
  /* ── Score & Streak ─────────────────────────────────────────── */
  const stars      = ref(Number(localStorage.getItem('emma-stars')) || 0)
  const streak     = ref(Number(localStorage.getItem('emma-streak')) || 0)
  const level      = ref(Number(localStorage.getItem('emma-level')) || 1)
  const problemKey = ref(0) // bumped on each new problem for transition animations

  // Track the last star count we showed a celebration for to avoid re-triggering
  const lastMilestone = ref(Math.floor(stars.value / 10) * 10)
  const showLevelUp   = ref(false)

  /* ── Current Problem ────────────────────────────────────────── */
  const currentProblem = reactive({
    a:        0,
    b:        0,
    operator: '+',
  })

  const answer   = ref('')
  const feedback = ref('')   // 'correct' | 'wrong' | ''

  /* ── Adaptive Difficulty ────────────────────────────────────── */
  const difficulty = reactive({
    maxOperand:  5,       // start easy (Kindergarten level)
    history:     [],      // rolling window of true/false results
    historySize: 10,
  })

  const successRate = computed(() => {
    if (difficulty.history.length === 0) return 1
    const correct = difficulty.history.filter(Boolean).length
    return correct / difficulty.history.length
  })

  /** Adjust difficulty to maintain ~80% success rate (Vygotsky ZPD) */
  function adjustDifficulty () {
    if (difficulty.history.length < 5) return  // need enough data

    if (successRate.value >= 0.9 && difficulty.maxOperand < 20) {
      difficulty.maxOperand = Math.min(difficulty.maxOperand + 1, 20)
    } else if (successRate.value < 0.6 && difficulty.maxOperand > 3) {
      difficulty.maxOperand = Math.max(difficulty.maxOperand - 1, 3)
    }
  }

  /* ── Derived ────────────────────────────────────────────────── */
  const correctAnswer = computed(() => {
    if (currentProblem.operator === '+') return currentProblem.a + currentProblem.b
    return currentProblem.a - currentProblem.b
  })

  /* ── Problem Generation ─────────────────────────────────────── */
  function generateProblem () {
    const ops = ['+', '-']
    currentProblem.operator = ops[Math.floor(Math.random() * ops.length)]
    const max = difficulty.maxOperand

    if (currentProblem.operator === '+') {
      currentProblem.a = Math.floor(Math.random() * max) + 1
      currentProblem.b = Math.floor(Math.random() * max) + 1
    } else {
      // Constraint: a >= b to avoid negative results
      const a = Math.floor(Math.random() * max) + 1
      const b = Math.floor(Math.random() * (a + 1))
      currentProblem.a = a
      currentProblem.b = b
    }

    answer.value   = ''
    feedback.value = ''
    problemKey.value++
  }

  /* ── Answer Checking ────────────────────────────────────────── */

  /**
   * Check the user's answer against the correct answer.
   * @returns {'correct'|'wrong'|null} — null if input is empty or locked
   */
  function checkAnswer () {
    if (answer.value === '' || feedback.value) return null

    const isCorrect = Number(answer.value) === correctAnswer.value

    // Record in difficulty history
    difficulty.history.push(isCorrect)
    if (difficulty.history.length > difficulty.historySize) {
      difficulty.history.shift()
    }

    if (isCorrect) {
      feedback.value = 'correct'
      stars.value++
      streak.value++

      // persistence
      localStorage.setItem('emma-stars', stars.value)
      localStorage.setItem('emma-streak', streak.value)

      // Milestone check: every 10 stars (10, 20, 30...)
      if (stars.value > 0 && stars.value % 10 === 0 && stars.value > lastMilestone.value) {
        showLevelUp.value = true
        lastMilestone.value = stars.value
        
        if (level.value < 8) {
          level.value++
          localStorage.setItem('emma-level', level.value)
        }
      }
    } else {
      feedback.value = 'wrong'
      // Pause/reset streak as requested
      streak.value = 0
      localStorage.setItem('emma-streak', streak.value)
    }

    adjustDifficulty()
    return feedback.value
  }

  /** Clear feedback (call after wrong-answer delay) */
  function clearFeedback () {
    feedback.value = ''
  }

  /* ── Input Helpers ──────────────────────────────────────────── */

  function appendDigit (digit) {
    if (feedback.value) return false       // locked during feedback
    if (answer.value.length >= 3) return false  // max 3 digits
    answer.value += String(digit)
    return true
  }

  function backspace () {
    if (feedback.value) return false
    answer.value = answer.value.slice(0, -1)
    return true
  }

  /* ── Cutscene Routing Logic ─────────────────────────────────── */
  function getCutsceneVideoPath (characterId, currentLevel) {
    // Expected future routing: return `/videos/${characterId}_level_${currentLevel}.mp4`
    // Returns our phase 1 placeholder for testing
    return '/videos/hero.mp4'
  }

  /* ── Initialize ─────────────────────────────────────────────── */
  generateProblem()

  return {
    // State
    stars,
    streak,
    level,
    problemKey,
    currentProblem,
    answer,
    feedback,
    correctAnswer,
    showLevelUp,

    // Difficulty info
    difficulty,
    successRate,

    // Actions
    generateProblem,
    checkAnswer,
    clearFeedback,
    appendDigit,
    backspace,
    getCutsceneVideoPath,
  }
}
