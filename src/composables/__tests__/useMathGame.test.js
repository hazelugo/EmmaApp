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
})
