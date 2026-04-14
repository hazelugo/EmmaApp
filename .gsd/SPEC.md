# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
Enhance the EmmaApp math game's reward system by replacing standard UI level-up modals with character-specific video cutscenes. The system will play short situational videos on each standard level up, culminating in a special "villain defeat" cutscene on the 8th level clear, creating a more narrative and engaging progression.

## Goals
1. Implement a video playback system for level completion that dynamically selects the video based on the current character.
2. Replace current CSS/Modal animations (e.g. ConfettiBurst/LevelUpModal) with video cutscenes.
3. Track overall progress to trigger a unique "villain defeat" final cutscene at level 8.

## Non-Goals (Out of Scope)
- Generating final video/art assets (placeholders will be used and wired up for future drop-in).
- Modifying the core math gameplay, questions, or answer validation logic.

## Users
Kids playing the math game who need visual engagement and narrative rewards to stay motivated.

## Constraints
- Must remain a client-side Vite/Vue application.
- Cutscenes will be small video files (e.g., mp4, webm) stored locally or served statically.
- The playback architecture must make swapping assets in the future extremely easy.

## Success Criteria
- [ ] At level completion, the UI switches to a video player instead of the old CSS modal.
- [ ] The video played corresponds to the chosen character.
- [ ] At level 8, the app plays a special "villain defeat" video.
- [ ] Dummy video files successfully play and transition back to the game when finished.
