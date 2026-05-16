# Phase 2: Multiplication & Division - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 02-multiplication-division
**Areas discussed:** Operator mix, Starting difficulty, Number ceiling, Unlock announcement, Operator intro tutorial, Zero handling

---

## Operator Mix

| Option | Description | Selected |
|--------|-------------|----------|
| Pure random | Equal chance among all unlocked operators | ✓ |
| Weighted toward newest | Recently unlocked operators appear more often (50% new, 25%/25% older) | |
| Operator focus rounds | Each set focuses on one operator for N problems, then rotates | |

**User's choice:** Pure random  
**Notes:** Simple, fair distribution — per-operator difficulty adapts independently anyway.

---

## Starting Difficulty

| Option | Description | Selected |
|--------|-------------|----------|
| Conservative start at 2–3 | Each new operator begins at maxOperand 2 or 3 | ✓ |
| Start at 5 (same as + baseline) | Mirrors initial + starting difficulty | |
| Inherit current +/- maxOperand | Whatever difficulty + has reached by level 3/5 | |

**User's choice:** Conservative start at 2–3  
**Notes:** × and ÷ are conceptually harder for a 6-year-old; starting conservative lets the ZPD system ramp up naturally.

---

## Number Ceiling

| Option | Description | Selected |
|--------|-------------|----------|
| Cap at 10 | 10×10=100 max, round and kid-friendly | ✓ |
| Cap at 12 (times tables) | Standard school ceiling, 12×12=144 | |
| Same as +/- (20) | 20×20=400 — too hard for age 6 | |

**User's choice:** Cap at 10  
**Notes:** Keeps multiplication answers under 100, division problems manageable.

---

## Unlock Announcement

| Option | Description | Selected |
|--------|-------------|----------|
| LevelIntroModal announcement | Extend existing modal with operator unlock line | ✓ |
| Toast / badge | Brief toast when first × problem is served | |
| Silent | New operator just starts appearing | |

**User's choice:** LevelIntroModal announcement  
**Notes:** Zero new components needed for the announcement itself. The full animated tutorial fires separately after the modal.

---

## Operator Introduction Tutorial

| Option | Description | Selected |
|--------|-------------|----------|
| Mascot + 2–3 worked examples | Mascot explains with solved problems, tap to proceed | |
| Single worked example + try it | One solved example then a guided practice problem | |
| Animated step-through | Step-by-step animation (dot arrays, repeated-addition) | ✓ |

**User's choice:** Animated step-through  
**Notes:** User wants the child "eased in" before facing the new operator. Animated visual (e.g., 3 rows of 4 dots → 3×4=12) is most effective for age 6. Fires once per operator, gated by localStorage flag. New `OperatorTutorialOverlay.vue` component required.

---

## Zero Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Exclude zero from all operands | No zero on either side of any operator | |
| Exclude only for × and ÷ | +/- can use zero, × and ÷ cannot | |
| Allow zero with mascot hint | Zero allowed; mascot shows contextual speech bubble hint | ✓ |

**User's choice:** Allow zero with mascot hint  
**Notes:** User explicitly said the child struggles with zero in all four operations. Rather than hiding zero, the mascot scaffolds understanding with a contextual tip (e.g., "Anything times zero is zero!"). Speech bubble auto-dismisses after a few seconds.

---

## Claude's Discretion

- Exact starting maxOperand for new operators (2 or 3)
- Minimum divisor for division problems (possibly 2 to avoid trivial ÷1)
- Exact animation style for tutorial (dot arrays, repeated-addition, number line)
- Speech bubble duration for zero hints (~3s suggested)
- Exact hint wording per operator

## Deferred Ideas

None — discussion stayed within phase scope.
