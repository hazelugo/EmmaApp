import { ref, computed, reactive } from 'vue'
import { generateOperands } from '../utils/mathUtils.js'

/**
 * Core math game composable.
 *
 * Manages problem generation, answer checking, scoring,
 * streak tracking, adaptive difficulty, and level progression.
 *
 * Phase 2 additions:
 *   - maxOperandByOperator: per-operator difficulty tracking
 *   - Operator gate: × at level 3, ÷ at level 5 (quotient-first)
 *   - Tutorial state machine: showTutorial, tutorialOperator, dismissTutorial
 *   - zeroHint computed: operator-specific zero-operand hint text
 */

function getStorage (key, fallback) {
  try {
    const val = localStorage.getItem(key)
    return val !== null ? Number(val) : fallback
  } catch {
    return fallback
  }
}

function setStorage (key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage unavailable (private browsing, quota exceeded)
  }
}

function getStorageBool (key) {
  try { return !!localStorage.getItem(key) } catch { return false }
}

export function useMathGame () {
  /* ── Score & Streak ─────────────────────────────────────────── */
  const stars      = ref(getStorage('emma-stars', 0))
  const streak     = ref(getStorage('emma-streak', 0))
  const level      = ref(getStorage('emma-level', 1))
  const problemKey = ref(0) // bumped on each new problem for transition animations

  // Track the last star count we showed a celebration for to avoid re-triggering
  const lastMilestone    = ref(getStorage('emma-lastMilestone', Math.floor(stars.value / 10) * 10))
  const showLevelUp      = ref(false)
  // Post-level victory screen (Peach wins image)
  const showLevelVictory = ref(false)
  const completedLevel   = ref(level.value) // which level was just beaten
  // Pre-level intro screen (enemy reveal)
  const showLevelIntro   = ref(false)
  const pendingLevel     = ref(level.value) // which level the intro is showing for

  /* ── Tutorial State ─────────────────────────────────────────── */
  const showTutorial     = ref(false)
  const tutorialOperator = ref(null)  // '×' | '÷' | null

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
    maxOperandByOperator: {
      '+': getStorage('emma-maxOperand-add',       10),
      '-': getStorage('emma-maxOperand-subtract',  10),
      '×': getStorage('emma-maxOperand-multiply',   3),
      '÷': getStorage('emma-maxOperand-divide',     3),
    },
    history:     [],      // rolling window of true/false results
    historySize: 10,
  })

  const successRate = computed(() => {
    if (difficulty.history.length === 0) return 1
    const correct = difficulty.history.filter(Boolean).length
    return correct / difficulty.history.length
  })

  function operatorKey (op) {
    return { '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide' }[op]
  }

  /** Adjust difficulty to maintain ~80% success rate (Vygotsky ZPD) — per operator */
  function adjustDifficulty () {
    if (difficulty.history.length < 5) return
    const op    = currentProblem.operator
    const cap   = (op === '×' || op === '÷') ? 10 : 20
    const floor = 3

    if (successRate.value >= 0.9 && difficulty.maxOperandByOperator[op] < cap) {
      difficulty.maxOperandByOperator[op] = Math.min(difficulty.maxOperandByOperator[op] + 1, cap)
      setStorage(`emma-maxOperand-${operatorKey(op)}`, difficulty.maxOperandByOperator[op])
    } else if (successRate.value < 0.6 && difficulty.maxOperandByOperator[op] > floor) {
      difficulty.maxOperandByOperator[op] = Math.max(difficulty.maxOperandByOperator[op] - 1, floor)
      setStorage(`emma-maxOperand-${operatorKey(op)}`, difficulty.maxOperandByOperator[op])
    }
  }

  /* ── Derived ────────────────────────────────────────────────── */
  const correctAnswer = computed(() => {
    if (currentProblem.operator === '+') return currentProblem.a + currentProblem.b
    if (currentProblem.operator === '-') return currentProblem.a - currentProblem.b
    if (currentProblem.operator === '×') return currentProblem.a * currentProblem.b
    if (currentProblem.operator === '÷') return currentProblem.a / currentProblem.b  // integer by construction
    return 0
  })

  /** Operator-specific hint text when a problem contains a zero operand. Empty string when no zero. */
  const zeroHint = computed(() => {
    const { a, b, operator } = currentProblem
    if (a !== 0 && b !== 0) return ''
    if (operator === '×') return 'Anything times zero is zero!'
    if (operator === '+') return 'Adding zero doesn\'t change a number!'
    if (operator === '-') return 'Subtracting zero leaves it the same!'
    if (operator === '÷' && a === 0) return 'Zero divided by anything is zero!'
    return ''
  })

  /** If a newly-unlocked operator has never been seen, set tutorial state and signal caller to skip problem gen. */
  function checkOperatorUnlock () {
    if (level.value >= 3 && !getStorageBool('emma-tutorial-multiply-seen')) {
      tutorialOperator.value = '×'
      showTutorial.value     = true
      return true
    }
    if (level.value >= 5 && !getStorageBool('emma-tutorial-divide-seen')) {
      tutorialOperator.value = '÷'
      showTutorial.value     = true
      return true
    }
    return false
  }

  /** Caller (App.vue) invokes this when the tutorial overlay emits 'done'. Marks seen, clears state, starts problem. */
  function dismissTutorial () {
    if (tutorialOperator.value === '×') setStorage('emma-tutorial-multiply-seen', '1')
    else if (tutorialOperator.value === '÷') setStorage('emma-tutorial-divide-seen', '1')
    showTutorial.value     = false
    tutorialOperator.value = null
    generateProblem()
  }

  /* ── Problem Generation ─────────────────────────────────────── */
  function generateProblem () {
    // Tutorial gate: must run BEFORE any operands are assigned (D-13)
    if (checkOperatorUnlock()) return  // overlay now showing; caller re-triggers via dismissTutorial()

    const ops = ['+', '-']
    if (level.value >= 3) ops.push('×')
    if (level.value >= 5) ops.push('÷')

    currentProblem.operator = ops[Math.floor(Math.random() * ops.length)]
    const max = difficulty.maxOperandByOperator[currentProblem.operator]

    const { a, b } = generateOperands(currentProblem.operator, max)
    currentProblem.a = a
    currentProblem.b = b

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

      // Persistence
      setStorage('emma-stars', stars.value)
      setStorage('emma-streak', streak.value)

      // Milestone check: every 10 stars (10, 20, 30...)
      if (stars.value > 0 && stars.value % 10 === 0 && stars.value > lastMilestone.value) {
        lastMilestone.value = stars.value
        setStorage('emma-lastMilestone', lastMilestone.value)

        // Capture the level that was just beaten, then show victory screen
        completedLevel.value   = level.value
        showLevelVictory.value = true

        // Advance to the next level (capped at 7)
        if (level.value < 7) {
          level.value++
          setStorage('emma-level', level.value)
          // Queue the pre-level intro for when the player dismisses victory
          pendingLevel.value = level.value
        }
      }
    } else {
      feedback.value = 'wrong'
      // Pause/reset streak as requested
      streak.value = 0
      setStorage('emma-streak', streak.value)
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

  /* ── Reset Logic ────────────────────────────────────────────── */
  function resetGame () {
    stars.value          = 0
    streak.value         = 0
    level.value          = 1
    pendingLevel.value   = 1
    completedLevel.value = 1
    lastMilestone.value  = 0
    showLevelUp.value    = false
    showLevelVictory.value = false
    showLevelIntro.value = true
    difficulty.maxOperandByOperator['+'] = 10
    difficulty.maxOperandByOperator['-'] = 10
    difficulty.maxOperandByOperator['×'] = 3
    difficulty.maxOperandByOperator['÷'] = 3
    difficulty.history    = []

    setStorage('emma-stars', 0)
    setStorage('emma-streak', 0)
    setStorage('emma-level', 1)
    setStorage('emma-lastMilestone', 0)
    setStorage('emma-maxOperand-add',      10)
    setStorage('emma-maxOperand-subtract', 10)
    setStorage('emma-maxOperand-multiply', 3)
    setStorage('emma-maxOperand-divide',   3)
    setStorage('emma-tutorial-multiply-seen', '')
    setStorage('emma-tutorial-divide-seen',   '')

    generateProblem()
  }

  /* ── Initialize ─────────────────────────────────────────────── */
  generateProblem()
  // Show the intro for the current level on first load
  showLevelIntro.value = true

  return {
    // State (existing + new)
    stars,
    streak,
    level,
    problemKey,
    currentProblem,
    answer,
    feedback,
    correctAnswer,
    showLevelUp,
    showLevelVictory,
    completedLevel,
    showLevelIntro,
    pendingLevel,
    showTutorial, tutorialOperator,     // NEW (Phase 2)
    zeroHint,                            // NEW (Phase 2)

    // Difficulty info
    difficulty,
    successRate,

    // Actions (existing + new)
    generateProblem,
    checkAnswer,
    clearFeedback,
    appendDigit,
    backspace,
    getCutsceneVideoPath,
    resetGame,
    dismissTutorial,                     // NEW (Phase 2)
  }
}
