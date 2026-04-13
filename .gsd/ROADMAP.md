# ROADMAP.md

> **Current Phase**: Phase 1 (Completed)
> **Milestone**: v1.0

## Must-Haves (from SPEC)
- [x] Implement video playback component overlay.
- [ ] Build logic to select correct video based on character and level.
- [ ] Implement "Level 8" villain defeat state.
- [ ] Handle UI transitions between game, cutscenes, and next levels.

## Phases

### Phase 1: Video Playback Foundation
**Status**: ✅ Complete
**Objective**: Build a reusable Vue video component that overlays the screen, plays a given video source (placeholders), and emits an event when playback ends.

### Phase 2: Cutscene Routing & State Logic
**Status**: ⬜ Not Started
**Objective**: Update `useMathGame.js` to track levels up to 8. Create a matching logic to route character mascot + level state to a specific video file path.

### Phase 3: Integration & Clean Up
**Status**: ⬜ Not Started
**Objective**: Wire the video system into the main gameplay loop. Remove the old `LevelUpModal.vue` and `ConfettiBurst.vue` logic. Ensure clean transitions so the game resumes smoothly after a cutscene.
