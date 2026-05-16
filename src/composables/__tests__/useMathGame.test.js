import { describe, it, expect, beforeEach } from 'vitest'
import { useMathGame } from '../useMathGame.js'

beforeEach(() => {
  // jsdom localStorage — clear all keys set during tests
  const keys = Object.keys(localStorage)
  keys.forEach(k => localStorage.removeItem(k))
})

describe('useMathGame', () => {
  /* ── Helpers ─────────────────────────────────────────────────── */

  function seedLevel (n, { multiplySeen = false, divideSeen = false } = {}) {
    localStorage.setItem('emma-level', String(n))
    if (multiplySeen) localStorage.setItem('emma-tutorial-multiply-seen', '1')
    if (divideSeen)   localStorage.setItem('emma-tutorial-divide-seen',   '1')
  }

  function collectOperators (game, n) {
    const seen = new Set()
    for (let i = 0; i < n; i++) {
      game.generateProblem()
      seen.add(game.currentProblem.operator)
    }
    return seen
  }

  /* ── MATH-01: × operator gate ─────────────────────────────── */

  it('MATH-01: × does not appear when level < 3', () => {
    seedLevel(2, { multiplySeen: true, divideSeen: true })
    const game = useMathGame()
    const ops = collectOperators(game, 200)
    expect(ops.has('×')).toBe(false)
    expect(ops.has('÷')).toBe(false)
  })

  it('MATH-01: × appears when level >= 3 (and tutorial already seen)', () => {
    seedLevel(3, { multiplySeen: true, divideSeen: true })
    const game = useMathGame()
    const ops = collectOperators(game, 200)
    expect(ops.has('×')).toBe(true)
    expect(ops.has('÷')).toBe(false)
  })

  /* ── MATH-02: ÷ operator gate ─────────────────────────────── */

  it('MATH-02: ÷ does not appear when level < 5', () => {
    seedLevel(4, { multiplySeen: true, divideSeen: true })
    const game = useMathGame()
    const ops = collectOperators(game, 200)
    expect(ops.has('×')).toBe(true)
    expect(ops.has('÷')).toBe(false)
  })

  it('MATH-02: ÷ appears when level >= 5 (and tutorials already seen)', () => {
    seedLevel(5, { multiplySeen: true, divideSeen: true })
    const game = useMathGame()
    const ops = collectOperators(game, 200)
    expect(ops.has('÷')).toBe(true)
  })

  it('MATH-02: every ÷ problem produces a whole-number answer and divisor >= 2', () => {
    seedLevel(5, { multiplySeen: true, divideSeen: true })
    const game = useMathGame()
    for (let i = 0; i < 500; i++) {
      game.generateProblem()
      if (game.currentProblem.operator === '÷') {
        const { a, b } = game.currentProblem
        expect(b).toBeGreaterThanOrEqual(2)
        expect(a % b).toBe(0)
        expect(a / b).toBeGreaterThanOrEqual(1)
      }
    }
  })

  /* ── MATH-03: per-operator difficulty ─────────────────────── */

  it('MATH-03: maxOperandByOperator is an object with all four operator keys', () => {
    const game = useMathGame()
    const mxo = game.difficulty.maxOperandByOperator
    expect(typeof mxo).toBe('object')
    for (const op of ['+', '-', '×', '÷']) {
      expect(typeof mxo[op]).toBe('number')
    }
  })

  it('MATH-03: × and ÷ cap at 10; + caps at 20', () => {
    seedLevel(5, { multiplySeen: true, divideSeen: true })
    const game = useMathGame()

    // Force-set × maxOperand to 10 (already at cap) and a 90%+ history
    game.difficulty.maxOperandByOperator['×'] = 10
    game.difficulty.history = [true, true, true, true, true, true, true, true, true, true]

    // Generate a × problem and set answer correctly so adjustDifficulty fires with the × operator in context
    game.currentProblem.operator = '×'
    game.currentProblem.a = 3
    game.currentProblem.b = 3
    game.answer.value = String(game.correctAnswer.value)
    game.checkAnswer()

    // × must not exceed 10
    expect(game.difficulty.maxOperandByOperator['×']).toBeLessThanOrEqual(10)

    // Same for +: set to 20, ensure it stays at 20 (cap)
    game.difficulty.maxOperandByOperator['+'] = 20
    game.difficulty.history = [true, true, true, true, true, true, true, true, true, true]
    game.currentProblem.operator = '+'
    game.currentProblem.a = 5
    game.currentProblem.b = 3
    game.answer.value = String(game.correctAnswer.value)
    game.checkAnswer()

    expect(game.difficulty.maxOperandByOperator['+']).toBeLessThanOrEqual(20)
  })

  /* ── D-08: divisor safety ─────────────────────────────────── */

  it('D-08: divisor is never 0 and quotient is never 0', () => {
    seedLevel(5, { multiplySeen: true, divideSeen: true })
    const game = useMathGame()
    for (let i = 0; i < 500; i++) {
      game.generateProblem()
      if (game.currentProblem.operator === '÷') {
        const { a, b } = game.currentProblem
        expect(b).not.toBe(0)
        expect(a / b).not.toBe(0)
      }
    }
  })

  /* ── D-10: zero hint ─────────────────────────────────────── */

  it('D-10: zeroHint returns a non-empty string when an operand is 0', () => {
    const game = useMathGame()

    // × with a=0 → hint
    game.currentProblem.operator = '×'
    game.currentProblem.a = 0
    game.currentProblem.b = 5
    expect(game.zeroHint.value).toBeTruthy()
    expect(game.zeroHint.value.length).toBeGreaterThan(0)

    // + with b=0 → hint
    game.currentProblem.operator = '+'
    game.currentProblem.a = 3
    game.currentProblem.b = 0
    expect(game.zeroHint.value).toBeTruthy()

    // × with no zero → empty
    game.currentProblem.operator = '×'
    game.currentProblem.a = 3
    game.currentProblem.b = 4
    expect(game.zeroHint.value).toBe('')
  })

  /* ── D-14: tutorial single-fire ──────────────────────────── */

  it('D-14: tutorial fires once then is suppressed after dismissal', () => {
    // Fresh start at level 3 — tutorial not yet seen
    seedLevel(3)
    const game = useMathGame()

    // generateProblem is called in useMathGame() init; tutorial should have fired
    expect(game.showTutorial.value).toBe(true)
    expect(game.tutorialOperator.value).toBe('×')

    // Dismiss tutorial
    game.dismissTutorial()
    expect(game.showTutorial.value).toBe(false)
    expect(localStorage.getItem('emma-tutorial-multiply-seen')).toBeTruthy()

    // Second init (simulating refresh) — tutorial must NOT re-fire
    const game2 = useMathGame()
    expect(game2.showTutorial.value).toBe(false)
  })

  /* ── correctAnswer: × and ÷ ─────────────────────────────── */

  it('correctAnswer: × multiplies operands and ÷ divides operands', () => {
    const game = useMathGame()

    game.currentProblem.operator = '×'
    game.currentProblem.a = 3
    game.currentProblem.b = 4
    expect(game.correctAnswer.value).toBe(12)

    game.currentProblem.operator = '÷'
    game.currentProblem.a = 12
    game.currentProblem.b = 4
    expect(game.correctAnswer.value).toBe(3)
  })

  /* ── checkAnswer: core paths ─────────────────────────────── */

  it('checkAnswer: returns null when answer is empty', () => {
    const game = useMathGame()
    game.answer.value = ''
    expect(game.checkAnswer()).toBeNull()
  })

  it('checkAnswer: returns null when feedback is already set (locked)', () => {
    const game = useMathGame()
    game.currentProblem.operator = '+'
    game.currentProblem.a = 2
    game.currentProblem.b = 2
    game.answer.value = '4'
    game.checkAnswer()                   // sets feedback='correct'
    game.answer.value = '4'
    expect(game.checkAnswer()).toBeNull() // still locked
  })

  it('checkAnswer: correct answer increments stars, streak, and returns "correct"', () => {
    const game = useMathGame()
    game.currentProblem.operator = '+'
    game.currentProblem.a = 3
    game.currentProblem.b = 4
    game.answer.value = '7'
    const result = game.checkAnswer()
    expect(result).toBe('correct')
    expect(game.stars.value).toBe(1)
    expect(game.streak.value).toBe(1)
    expect(localStorage.getItem('emma-stars')).toBe('1')
  })

  it('checkAnswer: wrong answer resets streak, sets feedback="wrong"', () => {
    const game = useMathGame()
    game.streak.value = 5
    game.currentProblem.operator = '+'
    game.currentProblem.a = 2
    game.currentProblem.b = 2
    game.answer.value = '99'
    const result = game.checkAnswer()
    expect(result).toBe('wrong')
    expect(game.streak.value).toBe(0)
    expect(game.feedback.value).toBe('wrong')
  })

  it('checkAnswer: triggers level victory at every 10-star milestone', () => {
    const game = useMathGame()
    game.stars.value = 9
    game.lastMilestone = 0
    // Force a correct answer at star #10
    game.currentProblem.operator = '+'
    game.currentProblem.a = 3
    game.currentProblem.b = 4
    game.answer.value = String(game.correctAnswer.value)
    game.checkAnswer()
    expect(game.showLevelVictory.value).toBe(true)
    expect(game.level.value).toBe(2)          // advanced from 1 → 2
  })

  /* ── clearFeedback ─────────────────────────────────────── */

  it('clearFeedback: resets feedback to empty string', () => {
    const game = useMathGame()
    game.currentProblem.operator = '+'
    game.currentProblem.a = 1
    game.currentProblem.b = 1
    game.answer.value = '99'
    game.checkAnswer()
    expect(game.feedback.value).toBe('wrong')
    game.clearFeedback()
    expect(game.feedback.value).toBe('')
  })

  /* ── appendDigit & backspace ───────────────────────────── */

  it('appendDigit: appends digits up to 3 characters', () => {
    const game = useMathGame()
    expect(game.appendDigit(1)).toBe(true)
    expect(game.appendDigit(2)).toBe(true)
    expect(game.appendDigit(3)).toBe(true)
    expect(game.appendDigit(4)).toBe(false)   // max 3
    expect(game.answer.value).toBe('123')
  })

  it('appendDigit: returns false and does nothing while feedback is set', () => {
    const game = useMathGame()
    game.currentProblem.operator = '+'
    game.currentProblem.a = 1
    game.currentProblem.b = 1
    game.answer.value = '9'
    game.checkAnswer()                        // sets feedback='wrong'
    expect(game.appendDigit(5)).toBe(false)
  })

  it('backspace: removes last character; returns false when feedback locked', () => {
    const game = useMathGame()
    game.answer.value = '42'
    expect(game.backspace()).toBe(true)
    expect(game.answer.value).toBe('4')

    // Lock via feedback
    game.currentProblem.operator = '+'
    game.currentProblem.a = 1
    game.currentProblem.b = 1
    game.answer.value = '9'
    game.checkAnswer()
    expect(game.backspace()).toBe(false)
  })

  /* ── creditTimerCoins ──────────────────────────────────── */

  it('creditTimerCoins: adds coins to stars and persists', () => {
    const game = useMathGame()
    game.creditTimerCoins(5)
    expect(game.stars.value).toBe(5)
    expect(localStorage.getItem('emma-stars')).toBe('5')
  })

  it('creditTimerCoins: skips when amount <= 0', () => {
    const game = useMathGame()
    game.creditTimerCoins(0)
    game.creditTimerCoins(-3)
    expect(game.stars.value).toBe(0)
  })

  it('creditTimerCoins: triggers level victory at 10-star milestone', () => {
    const game = useMathGame()
    game.stars.value = 9
    game.creditTimerCoins(1)
    expect(game.showLevelVictory.value).toBe(true)
    expect(game.level.value).toBe(2)
  })

  /* ── getCutsceneVideoPath ──────────────────────────────── */

  it('getCutsceneVideoPath: returns a string path', () => {
    const game = useMathGame()
    const path = game.getCutsceneVideoPath('peach', 1)
    expect(typeof path).toBe('string')
    expect(path.length).toBeGreaterThan(0)
  })

  /* ── resetGame ─────────────────────────────────────────── */

  it('resetGame: resets stars, streak, level, and difficulty to defaults', () => {
    const game = useMathGame()
    // Dirty state
    game.stars.value = 42
    game.streak.value = 7
    game.level.value = 5
    game.difficulty.maxOperandByOperator['+'] = 18

    game.resetGame()

    expect(game.stars.value).toBe(0)
    expect(game.streak.value).toBe(0)
    expect(game.level.value).toBe(1)
    expect(game.difficulty.maxOperandByOperator['+']).toBe(10)
    expect(game.difficulty.maxOperandByOperator['×']).toBe(3)
    expect(localStorage.getItem('emma-stars')).toBe('0')
  })

  it('resetGame: clears tutorial flags in localStorage', () => {
    localStorage.setItem('emma-tutorial-multiply-seen', '1')
    localStorage.setItem('emma-tutorial-divide-seen', '1')
    const game = useMathGame()
    game.resetGame()
    // After reset, flags are cleared so tutorials would fire again (falsy)
    expect(localStorage.getItem('emma-tutorial-multiply-seen')).toBeFalsy()
    expect(localStorage.getItem('emma-tutorial-divide-seen')).toBeFalsy()
  })

  /* ── adjustDifficulty: decrease branch ────────────────── */

  it('adjustDifficulty: decreases maxOperand when success rate < 60%', () => {
    const game = useMathGame()
    game.difficulty.maxOperandByOperator['+'] = 10
    // 4 wrong out of 10 → 40% success rate → should decrease
    game.difficulty.history = [false, false, false, false, false, false, true, true, true, true]
    game.currentProblem.operator = '+'
    game.currentProblem.a = 2
    game.currentProblem.b = 3
    game.answer.value = '99' // wrong
    game.checkAnswer()
    expect(game.difficulty.maxOperandByOperator['+']).toBeLessThan(10)
  })
})
