# Phase 2: Multiplication & Division - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Extend `useMathGame.js` to unlock the `×` operator at level 3 and `÷` operator at level 5, each with independent per-operator difficulty scaling (`maxOperandByOperator` object). Includes a one-time animated tutorial overlay per new operator and a mascot speech bubble hint when zero appears in any problem.

</domain>

<decisions>
## Implementation Decisions

### Operator Selection
- **D-01:** When multiple operators are unlocked, operator selection is **pure random** — equal probability among all currently-unlocked operators. No weighting or rotation logic.
- **D-02:** Unlock thresholds: `×` unlocks at level 3, `÷` unlocks at level 5. These gates are evaluated at problem-generation time using the current `level` ref.

### Per-Operator Difficulty Scaling
- **D-03:** Each operator maintains its own `maxOperand` value independently via a `maxOperandByOperator` object (e.g., `{ '+': 10, '-': 8, '×': 3, '÷': 2 }`). The existing shared `difficulty.maxOperand` is replaced by this structure.
- **D-04:** When a new operator first unlocks, its starting `maxOperand` is **conservative: 2 or 3** (planner's discretion on exact value). This reflects that × and ÷ are conceptually harder.
- **D-05:** `×` and `÷` have a **maximum operand cap of 10** (10×10=100 max). Addition and subtraction retain their existing cap of 20.
- **D-06:** localStorage keys for per-operator difficulty use the `emma-*` prefix (e.g., `emma-maxOperand-multiply`, `emma-maxOperand-divide`), written on every difficulty adjustment.

### Division Problem Generation
- **D-07:** Division problems must always produce whole-number answers with no remainder. Use the **quotient-first approach**: pick divisor `b` (1–maxOperand, never 0) and quotient `c` (1–maxOperand), compute `a = b × c`, present `a ÷ b = ?`. This guarantees clean division without retry loops.
- **D-08:** Divisor is never 0. Quotient is never 0 (minimum 1). This also prevents trivially-easy `a ÷ 1 = a` type problems if desired — planner may add a minimum divisor of 2, Claude's discretion.

### Zero Handling
- **D-09:** Zero **is allowed** as an operand for all operators (including +, -, ×, ÷).
- **D-10:** When a problem contains a zero operand (either `a` or `b` is 0), the **mascot displays a speech bubble hint** appropriate to the operator:
  - `×`: "Anything times zero is zero!"
  - `+`: "Adding zero doesn't change a number!"
  - `-`: "Subtracting zero leaves it the same!"
  - `÷`: (avoid dividing BY zero per D-07; if dividend is 0, hint "Zero divided by anything is zero!")
- **D-11:** The hint speech bubble disappears automatically after a few seconds (planner decides duration — ~3s is reasonable).

### Operator Introduction Tutorial
- **D-12:** A one-time **animated step-through tutorial overlay** fires the first time each new operator becomes available (level 3 for ×, level 5 for ÷). It shows a step-by-step animation (e.g., 3 rows of 4 dots collapsing to show 3×4=12). Child taps to proceed.
- **D-13:** The tutorial overlay fires **before the first problem of that operator is served**, not during gameplay.
- **D-14:** Tutorial shown-state is persisted in localStorage (e.g., `emma-tutorial-multiply-seen`, `emma-tutorial-divide-seen`) so it fires exactly once per operator, even across sessions.
- **D-15:** This is a **new overlay component** (e.g., `OperatorTutorialOverlay.vue`), following the established overlay pattern (fixed inset-0, z-layer, fade Transition from `CharacterSelect.vue`).

### Unlock Announcement
- **D-16:** The **LevelIntroModal** (which already fires at each level-up) includes an extra line announcing the new operator when level 3 or level 5 is reached (e.g., "New move unlocked: ×!"). This is additive to the existing modal — no new modal required for the announcement itself. The full animated tutorial fires separately after the modal is dismissed.

### Claude's Discretion
- Exact starting `maxOperand` value for new operators (2 or 3 — conservative either way)
- Whether to enforce a minimum divisor of 2 in division problems to avoid trivial `a ÷ 1` cases
- Animation style for the step-through tutorial (dot arrays, number line, repeated-addition visual, etc.)
- Exact speech bubble duration for zero hints (3s suggested)
- Exact hint text per operator (wording above is a guide, not locked)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — MATH-01, MATH-02, MATH-03 are the acceptance criteria for this phase

### Codebase Patterns
- `.planning/codebase/CONVENTIONS.md` — naming conventions, component patterns, import style
- `.planning/codebase/ARCHITECTURE.md` — data flow, overlay pattern, composable singleton pattern
- `.planning/codebase/STRUCTURE.md` — where to add new files

### Core File to Modify
- `src/composables/useMathGame.js` — the single file that drives all math logic; contains `generateProblem()`, `correctAnswer` computed, `difficulty.maxOperand`, and level/milestone tracking

### Existing Overlay Pattern (read before building OperatorTutorialOverlay)
- `src/components/CharacterSelect.vue` — full-screen overlay with fade Transition, z-200
- `src/components/LevelUpModal.vue` — full-screen overlay
- `src/components/LevelIntroModal.vue` — the modal to extend with unlock announcement

### Existing Composable Pattern
- `src/composables/useMathGame.js` — flat return object pattern, localStorage helpers (`getStorage`/`setStorage`)

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useMathGame.js` `getStorage`/`setStorage` helpers — reuse for new per-operator localStorage keys
- `LevelIntroModal.vue` — extend with a conditional unlock announcement line (level 3 → ×, level 5 → ÷)
- `CharacterSelect.vue` overlay pattern — template for `OperatorTutorialOverlay.vue`
- `MascotPanel.vue` — likely has a speech bubble mechanism or can be extended for zero hints

### Established Patterns
- `difficulty.maxOperand` (currently a single number) → becomes `maxOperandByOperator: { '+': N, '-': N, '×': N, '÷': N }`
- `ops` array in `generateProblem()` currently `['+', '-']` → extended to include `'×'` and `'÷'` based on current level
- `correctAnswer` computed handles `+` and `-` only → needs `×` and `÷` branches
- Division by zero is not yet guarded — must be added

### Integration Points
- `useMathGame.js`: All math changes live here; no new composable needed
- `App.vue`: Wire `OperatorTutorialOverlay` visibility (likely a `showTutorial` ref + `tutorialOperator` ref exposed from composable)
- `LevelIntroModal.vue`: Add prop or slot for unlock announcement text

</code_context>

<specifics>
## Specific Ideas

- Child is 6 years old — all number ranges are chosen with that in mind (max 10×10=100 for multiplication)
- Child struggles with zero concepts — the mascot hint system is specifically designed to scaffold understanding, not just avoid confusion
- The animated tutorial for × could show repeated-addition visually (3+3+3 = 3×3) since that's how kids learn multiplication
- Division tutorial could show sharing/grouping (12 dots split into 3 groups of 4)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-multiplication-division*
*Context gathered: 2026-04-20*
