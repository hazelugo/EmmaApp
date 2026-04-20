import { ref } from 'vue'
import { generateOperands } from '../utils/mathUtils.js'

/**
 * useTimer composable — manages the 60-second sprint challenge state.
 *
 * Timer mode is limited to '+' and '-' only (per CONTEXT.md locked decisions).
 *
 * Currency note: the internal ref is `stars` to match the project-wide naming
 * convention (emma-stars localStorage key, useMathGame pattern). UI displays
 * the value as "coins" using the existing coin image in ScoreHeader.vue.
 *
 * High score tracks highest correct-answer count, stored in localStorage
 * under `emma-timer-best`.
 */

const TIMER_DURATION = 60          // seconds
const TIMER_OPERATORS = ['+', '-'] // timer mode: addition and subtraction only
const LS_HIGH_SCORE   = 'emma-timer-best'

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

export function useTimer () {
  /* ── Reactive State ─────────────────────────────────────────── */
  const isActive     = ref(false)
  const timeLeft     = ref(TIMER_DURATION)
  const stars        = ref(0)          // coins earned this session (UI calls them "coins")
  const correctCount = ref(0)
  const highScore    = ref(getStorage(LS_HIGH_SCORE, 0))

  /* ── Current Problem ────────────────────────────────────────── */
  const currentProblem = ref({ a: 0, b: 0, operator: '+' })

  /* ── Internal interval handle ───────────────────────────────── */
  let _intervalId = null

  /* ── Problem Generation ─────────────────────────────────────── */
  /**
   * Generate a fresh problem using + or - with a fixed maxOperand of 10.
   * Timer mode does not apply the adaptive difficulty system; it uses a
   * fixed operand cap so the sprint stays consistently fast-paced.
   */
  function nextProblem () {
    const operator = TIMER_OPERATORS[Math.floor(Math.random() * TIMER_OPERATORS.length)]
    const { a, b } = generateOperands(operator, 10)
    currentProblem.value = { a, b, operator }
  }

  /* ── Timer Lifecycle ────────────────────────────────────────── */

  /**
   * Start the 60-second countdown.
   * Resets all session state, sets isActive=true, ticks every second,
   * and calls onComplete() when timeLeft reaches 0.
   *
   * @param {Function} onComplete - called with no arguments when time expires
   */
  function startTimer (onComplete) {
    stopTimer()                    // clear any running interval first

    // Reset session state
    timeLeft.value     = TIMER_DURATION
    stars.value        = 0
    correctCount.value = 0
    isActive.value     = true

    nextProblem()

    _intervalId = setInterval(() => {
      timeLeft.value--
      if (timeLeft.value <= 0) {
        stopTimer()
        if (typeof onComplete === 'function') {
          onComplete()
        }
      }
    }, 1000)
  }

  /**
   * Clear the countdown interval without changing isActive.
   * Callers that need to mark the session as inactive should call
   * handleComplete() or set isActive directly.
   */
  function stopTimer () {
    if (_intervalId !== null) {
      clearInterval(_intervalId)
      _intervalId = null
    }
  }

  /**
   * Handle end-of-session logic:
   * - Compare correctCount to highScore; save if improved.
   * - Set isActive to false.
   *
   * Called by the parent (App.vue) when the onComplete callback fires,
   * or when the user dismisses the results overlay.
   */
  function handleComplete () {
    stopTimer()
    if (correctCount.value > highScore.value) {
      highScore.value = correctCount.value
      setStorage(LS_HIGH_SCORE, highScore.value)
    }
    isActive.value = false
  }

  /* ── Scoring Helpers ────────────────────────────────────────── */

  /** Add one star (coin) to the session total. */
  function incrementScore () {
    stars.value++
  }

  /** Record one correct answer for the session. */
  function incrementCorrect () {
    correctCount.value++
  }

  /* ── Public API ─────────────────────────────────────────────── */
  return {
    // State
    isActive,
    timeLeft,
    stars,          // internal name; UI renders as "coins"
    correctCount,
    highScore,
    currentProblem,

    // Actions
    startTimer,
    stopTimer,
    handleComplete,
    incrementScore,
    incrementCorrect,
    nextProblem,
  }
}
