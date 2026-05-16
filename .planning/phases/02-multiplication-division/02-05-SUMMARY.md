# 02-05 SUMMARY — Wave 3: App.vue + ChallengeZone Wiring

## App.vue changes
1. `import OperatorTutorialOverlay from './components/OperatorTutorialOverlay.vue'`
2. Destructured `showTutorial`, `tutorialOperator`, `zeroHint`, `dismissTutorial` from `useMathGame()`
3. Added `unlockedOperator` computed: returns '×' at pendingLevel 3, '÷' at pendingLevel 5, null otherwise
4. `LevelIntroModal` now receives `:unlocked-operator="unlockedOperator"`
5. `ChallengeZone` now receives `:zero-hint="zeroHint"`
6. `OperatorTutorialOverlay` mounted after LevelIntroModal: `:show="showTutorial"`, `:operator="tutorialOperator"`, `@done="dismissTutorial"`
7. `onSubmit` setTimeout guard: added `&& !showTutorial.value`
8. `closeLevelUp` guard: added `&& !showTutorial.value`

## ChallengeZone.vue changes
- Added `zeroHint: { type: String, default: '' }` prop
- Added `import { ref, watch, onUnmounted } from 'vue'`
- Speech bubble positioned above character image: same bubble-fade pattern as MascotPanel
- Added `<style scoped>` with `.bubble-fade-*` transitions

## Note on MascotPanel
- MascotPanel is NOT in the render tree (App.vue → ChallengeZone path confirmed)
- Per plan: bubble implemented directly in ChallengeZone
- MascotPanel extension (Plan 04) remains as reference implementation

## Human-verify checkpoint
Task 3 of Plan 05 requires human verification in dev mode.
- Test 1: Level 3 → LevelIntroModal shows "New move unlocked: ×!" + tutorial fires → × problems appear
- Test 2: Level 5 → same for ÷, all division problems are whole-number integer
- Test 3: Zero-operand bubble appears and auto-dismisses in ~3s
- Test 4: Per-operator difficulty independence via localStorage inspection
- Test 5: `npm run build` exits 0 ✅ (automated — PASSED)

## Build & test status
- `npm run build` exits 0 ✅
- `npm test` exits 0 (11/11) ✅
