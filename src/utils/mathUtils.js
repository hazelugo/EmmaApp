/**
 * Pure math utility functions shared across composables.
 *
 * Extracted from useMathGame.js to allow reuse in useTimer.js
 * and any future composables that need problem generation.
 */

/**
 * Generate operands `{ a, b }` for a given operator and maxOperand cap.
 *
 * Rules per-operator:
 *   '+' — both operands in [1, max]
 *   '-' — a in [1, max], b in [0, a] so result is never negative
 *   '×' — both operands in [0, max] (zero allowed per D-09)
 *   '÷' — quotient-first (D-07): guarantees integer result, min divisor 2 (D-08)
 *
 * @param {string} operator - One of '+', '-', '×', '÷'
 * @param {number} maxOperand - Upper bound for operand generation
 * @returns {{ a: number, b: number }}
 */
export function generateOperands (operator, maxOperand) {
  const max = maxOperand

  if (operator === '+') {
    return {
      a: Math.floor(Math.random() * max) + 1,
      b: Math.floor(Math.random() * max) + 1,
    }
  }

  if (operator === '-') {
    // Constraint: a >= b to avoid negative results
    const a = Math.floor(Math.random() * max) + 1
    const b = Math.floor(Math.random() * (a + 1))
    return { a, b }
  }

  if (operator === '×') {
    // Zero is allowed per D-09 — hint will fire via zeroHint computed
    return {
      a: Math.floor(Math.random() * (max + 1)),  // 0..max
      b: Math.floor(Math.random() * (max + 1)),
    }
  }

  if (operator === '÷') {
    // Quotient-first (D-07): guarantees clean integer result, no retry loop.
    // Min divisor 2 (per D-08) — avoids trivial a÷1 problems.
    const divisor  = Math.floor(Math.random() * Math.max(1, max - 1)) + 2  // 2..max (or at least 2 when max<3)
    const quotient = Math.floor(Math.random() * max) + 1                   // 1..max
    return {
      a: divisor * quotient,
      b: divisor,
    }
  }

  // Unknown operator — return safe defaults
  return { a: 1, b: 1 }
}
