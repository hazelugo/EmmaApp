# Legacy Feature: Video Cutscene System

> **Status:** Paused — Phases 1 & 2 complete, Phase 3 not started.
> Migrated from `.gsd/` on 2026-04-17.

---

## Spec

**Vision:** Enhance the EmmaApp reward system by replacing standard UI level-up modals with character-specific video cutscenes. Short situational videos play on each level up, culminating in a special "villain defeat" cutscene on the 8th level clear.

**Goals:**
1. Video playback system for level completion that dynamically selects video based on current character
2. Replace `ConfettiBurst`/`LevelUpModal` CSS animations with video cutscenes
3. Track progress to trigger a unique "villain defeat" final cutscene at level 8

**Non-Goals:**
- Generating final video/art assets (placeholders wired up for future drop-in)
- Modifying core math gameplay, questions, or answer validation

**Constraints:**
- Must remain client-side Vite/Vue application
- Cutscenes: small `.mp4`/`.webm` files stored locally or served statically
- Architecture must make swapping assets trivially easy

**Success Criteria:**
- [ ] At level completion, UI switches to video player instead of old CSS modal
- [ ] Video played corresponds to the chosen character
- [ ] At level 8, app plays a special "villain defeat" video
- [ ] Dummy video files successfully play and transition back to the game when finished

---

## Architecture Decision: Global Overlay

**ADR 1: Cutscene Video Implementation**
- **Decision:** HTML5 `<video>` tags via a Vue component overlay, `.mp4`/`.webm` formats, video source paths managed dynamically from state (`selectedCharacter + currentLevel`)
- **Status:** Accepted

**Phase 1 Decisions (2026-04-12):**
- **Video Sizing:** Fullscreen layout (optimized for mobile web)
- **Skips:** Users are allowed to skip the cutscene by clicking/tapping
- **Chosen Approach:** Option A — Global Overlay (`<CutsceneOverlay />` mounted at root as a fixed-position overlay). Avoids z-index and overflow issues from deeply nested mounting.
- **Placeholders:** Small local script generates actual `.mp4` placeholder files to validate loading performance directly
- **Constraint:** Testing must prove `<video>` plays on mobile without strict user-interaction blocks. Since it fires *after* answering a math question, the browser interaction requirement is met.

---

## Roadmap

### Phase 1: Video Playback Foundation ✅ Complete
Build a reusable Vue video component that overlays the screen, plays a given video source (placeholders), and emits an event when playback ends.
- Plan 1.1: Generate placeholder videos → `scripts/generate-videos.js`, `public/videos/hero.mp4`
- Plan 1.2: Build `CutsceneOverlay.vue` — fixed z-50 overlay, `videoSrc` prop, `@ended` emit, skip button

### Phase 2: Cutscene Routing & State Logic ✅ Complete
Update `useMathGame.js` to track levels up to 8. Create matching logic to route `characterId + level` to a specific video file path.
- Plan 2.1: Updated composable with `level` ref (persisted to `localStorage`), exported `getCutsceneVideoPath(characterId, currentLevel)`

### Phase 3: Integration & Clean Up ⬜ Not Started
Wire the video system into the main gameplay loop. Remove old `LevelUpModal.vue` and `ConfettiBurst.vue` logic. Ensure clean transitions so the game resumes smoothly after a cutscene.

**Remaining TODOs (from paused work):**
- [ ] Source placeholder short video files for testing
- [ ] Check how Vite handles dynamic asset URLs for conditional videos
