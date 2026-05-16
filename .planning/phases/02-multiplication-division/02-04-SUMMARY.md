# 02-04 SUMMARY — Wave 2: LevelIntroModal + MascotPanel Extensions

## LevelIntroModal.vue changes
- Added `unlockedOperator: { type: String, default: null }` as 5th prop
- Template: `<p v-if="unlockedOperator && showBtn" class="unlock-announce pop-in mb-4">New move unlocked: {{ unlockedOperator }}!</p>` — appears at same phase as the button
- CSS added: `.unlock-announce` — clamp font, gold color, red text-shadow, pop-in via global class

## MascotPanel.vue changes
- Added `zeroHint: { type: String, default: '' }` prop
- Added `import { ref, watch, onUnmounted } from 'vue'`
- Speech bubble: `<Transition name="bubble-fade">` with `v-if="showBubble && zeroHint"`, absolute positioned above character
- Auto-dismiss: `watch(() => props.zeroHint, ..., { immediate: true })` + 3s `setTimeout` + `clearTimeout` on change and `onUnmounted`
- Added `<style scoped>` with `.bubble-fade-*` transition rules

## Existing props unchanged on both components
- All existing LevelIntroModal props preserved in order
- All existing MascotPanel props preserved

## Build & test status
- `npm run build` exits 0 ✅
- `npm test` exits 0 (11/11) ✅
