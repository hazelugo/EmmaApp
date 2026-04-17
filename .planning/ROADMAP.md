# Roadmap: EmmaApp — Emma's Star World

## Overview

Feature expansion roadmap for Emma's Star World, a Nintendo-inspired children's math game. Phases deliver gameplay enhancements, technical improvements, visual polish, and engagement systems — all built on top of the existing Vue 3 / Vite / Tailwind SPA with the established composable + overlay pattern.

## Phases

- [ ] **Phase 1: Star Shop** — Star-powered reward shop where players spend earned stars on cosmetic items (mascot color variants)
- [ ] **Phase 2: Multiplication & Division** — Unlock multiplication at level 3, division at level 5, with per-operator difficulty scaling
- [ ] **Phase 3: Timer Mode** — 60-second sprint challenge mode accessible from the main game screen
- [ ] **Phase 4: Sound Settings** — Persistent mute state with volume slider; modal from mute button
- [ ] **Phase 5: PWA** — Progressive Web App support for mobile install and offline play
- [ ] **Phase 6: Unit Testing** — Vitest unit tests for useMathGame composable at 85%+ coverage
- [ ] **Phase 7: Themed Backgrounds** — Difficulty-driven background themes (4 CSS gradient themes, 800ms fade)
- [ ] **Phase 8: More Mascots** — Additional characters unlock at star thresholds (6 new Nintendo characters)
- [ ] **Phase 9: Story-Driven Progression** — 7-world arc with text dialogue cutscenes and power-ups
- [ ] **Phase 10: Mini-Games** — 3 mini-games (Math Dash, Shape Match, Jump Sequence) trigger every 5–7 correct answers
- [ ] **Phase 11: Personalized Mascot Interactions** — 9 reaction states, speech bubble pool, CSS filter animations
- [ ] **Phase 12: Reward System & Collectibles** — 10 achievement badges, Question Block chests, Math Museum sticker album
- [ ] **Phase 13: Sound & Haptic Enhancements** — 4 audio composables, hybrid BGM + TTS, 8 new SFX, haptic patterns
- [ ] **Phase 14: Progress Visualization** — Rising Castle map overlay, CSS Grid + SVG connectors, achievement tree

## Phase Details

### Phase 1: Star Shop
**Goal**: Implement a star-powered in-game shop where players spend earned stars on cosmetic items (Tier-1: mascot color variants), with single-tap purchase, 10-second undo, and localStorage persistence.
**Depends on**: Nothing
**Requirements**: SHOP-01, SHOP-02, SHOP-03, SHOP-04, SHOP-05, SHOP-06, SHOP-07, SHOP-08
**Success Criteria** (what must be TRUE):
  1. ShopOverlay renders accessible from main game screen and lists all 5+ Tier-1 items with prices
  2. Tapping an affordable item deducts stars and shows a 10-second undo toast
  3. Purchased/equipped items persist after browser refresh (localStorage `emma-shop-*` keys)
  4. Spending more stars than balance is blocked (button disabled state)
  5. `npm run build` passes with no errors
**Plans**: TBD

### Phase 2: Multiplication & Division
**Goal**: Unlock multiplication at level 3 and division at level 5, with independent per-operator difficulty scaling using a `maxOperandByOperator` object.
**Depends on**: Nothing
**Requirements**: MATH-01, MATH-02, MATH-03
**Success Criteria** (what must be TRUE):
  1. Multiplication problems appear after level 3 threshold is reached
  2. Division problems appear after level 5 threshold is reached
  3. Each operator tracks its own difficulty independently
**Plans**: TBD

### Phase 3: Timer Mode
**Goal**: Add a 60-second sprint challenge mode accessible from the game screen, using a new `useTimer` composable with unified star scoring.
**Depends on**: Nothing
**Requirements**: TIMER-01, TIMER-02
**Success Criteria** (what must be TRUE):
  1. Timer mode is accessible from the main game UI
  2. 60-second countdown runs and ends the session when it hits 0
  3. Stars earned in timer mode use the same scoring as normal mode
**Plans**: TBD

### Phase 4: Sound Settings
**Goal**: Persistent mute state and volume slider accessible from the mute button; separate mute vs volume=0 semantics using master GainNode pattern.
**Depends on**: Nothing
**Requirements**: SOUND-01, SOUND-02
**Success Criteria** (what must be TRUE):
  1. Mute state persists across browser refresh
  2. Volume slider is accessible from the mute button interaction
  3. Mute and volume=0 are handled as distinct states
**Plans**: TBD

### Phase 5: PWA
**Goal**: Progressive Web App support using vite-plugin-pwa; precache all assets; custom install prompt after 60s; offline play.
**Depends on**: Nothing
**Requirements**: PWA-01
**Success Criteria** (what must be TRUE):
  1. App can be installed on mobile devices from the browser
  2. App works offline after first load
**Plans**: TBD

### Phase 6: Unit Testing
**Goal**: Vitest + jsdom unit tests for useMathGame composable; raw composable calls (no vue/test-utils); 10 prioritized test cases; 85% coverage target.
**Depends on**: Nothing
**Requirements**: TEST-01
**Success Criteria** (what must be TRUE):
  1. `npm run test` runs and passes
  2. useMathGame composable is covered at 85%+ line coverage
**Plans**: TBD

### Phase 7: Themed Backgrounds
**Goal**: Difficulty-driven background themes (4 CSS gradient themes mapped to maxOperand ranges) with 800ms fade transitions using pure CSS — no image assets.
**Depends on**: Nothing
**Requirements**: THEME-01
**Success Criteria** (what must be TRUE):
  1. Background changes when difficulty threshold is crossed
  2. Transition is 800ms and smooth
  3. All 4 themes are visually distinct
**Plans**: TBD

### Phase 8: More Mascots
**Goal**: 6 new Nintendo-inspired mascot characters unlock at star thresholds; unlock state computed from stars at runtime (not stored separately).
**Depends on**: Nothing
**Requirements**: MASCOT-01
**Success Criteria** (what must be TRUE):
  1. New characters appear in CharacterSelect at correct star thresholds
  2. Unlock state is recomputed from star count (no extra localStorage keys)
**Plans**: TBD

### Phase 9: Story-Driven Progression
**Goal**: New `useStory.js` composable with 7-world arc; text dialogue cutscenes between levels; power-ups earned per world.
**Depends on**: Nothing
**Requirements**: STORY-01
**Success Criteria** (what must be TRUE):
  1. Story world progression advances as levels are completed
  2. Text dialogue cutscenes display between levels
  3. Power-ups are earned and applied per world
**Plans**: TBD

### Phase 10: Mini-Games
**Goal**: `useMiniGame.js` wrapper with 3 mini-games (Math Dash, Shape Match, Jump Sequence) that trigger every 5–7 correct answers.
**Depends on**: Nothing
**Requirements**: MINI-01
**Success Criteria** (what must be TRUE):
  1. Mini-game triggers after 5–7 consecutive correct answers
  2. All 3 mini-games are playable
  3. Mini-game result feeds back to the main game flow
**Plans**: TBD

### Phase 11: Personalized Mascot Interactions
**Goal**: 9 reaction states in useMathGame.js; `useMascotLines.js` speech bubble pool; CSS filter animations for mascot reactions.
**Depends on**: Nothing
**Requirements**: REACT-01
**Success Criteria** (what must be TRUE):
  1. Mascot displays different reactions for all 9 defined states
  2. Speech bubbles draw from the randomized pool
  3. Reactions are visually animated via CSS filters
**Plans**: TBD

### Phase 12: Reward System & Collectibles
**Goal**: `useAchievements.js` with 10 badges; Question Block chests every 25 stars; Math Museum sticker album display.
**Depends on**: Nothing
**Requirements**: REWARD-01
**Success Criteria** (what must be TRUE):
  1. 10 badges can be earned and persist in localStorage
  2. Question Block chest appears every 25 stars
  3. Math Museum shows collected stickers
**Plans**: TBD

### Phase 13: Sound & Haptic Enhancements
**Goal**: Split audio into 4 composables (useSoundEffects, useMusicManager, useHaptics, useVoiceLines); hybrid BGM + TTS; 8 new SFX; haptic patterns on Android; graceful iOS degradation.
**Depends on**: Nothing
**Requirements**: HAPTIC-01
**Success Criteria** (what must be TRUE):
  1. BGM plays in the background during gameplay
  2. Haptic feedback fires on Android devices
  3. iOS falls back gracefully (no errors)
  4. All 8 new SFX are wired up
**Plans**: TBD

### Phase 14: Progress Visualization
**Goal**: Rising Castle map overlay using CSS Grid + SVG connectors; triggers after LevelVictory; 3-tier achievement tree display.
**Depends on**: Nothing
**Requirements**: MAP-01
**Success Criteria** (what must be TRUE):
  1. Map overlay shows unlocked areas based on progress
  2. SVG connectors render between nodes
  3. Achievement tree shows 3 tiers
**Plans**: TBD
