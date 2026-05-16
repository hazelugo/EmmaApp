# Requirements: EmmaApp — Emma's Star World

**Defined:** 2026-04-17
**Core Value:** A Nintendo-inspired children's math game that rewards correct answers with engaging character cutscenes, a star economy, and progressive gameplay mechanics.

## Gameplay Enhancements

- [ ] **SHOP-01**: Player can open a Star Shop from the main game screen
- [ ] **SHOP-02**: Star Shop displays available items with their star costs
- [ ] **SHOP-03**: Player can purchase items using earned stars (stars deducted on purchase)
- [ ] **SHOP-04**: Purchased items persist across browser refreshes (localStorage)
- [ ] **SHOP-05**: Player cannot purchase items they cannot afford (button disabled)
- [ ] **SHOP-06**: Purchase supports a 10-second undo window before finalizing
- [ ] **SHOP-07**: At least 5 Tier-1 items are available (e.g., mascot color variants)
- [ ] **SHOP-08**: Active/equipped item is visually indicated in the shop

- [ ] **MATH-01**: Multiplication operator unlocks at level 3
- [ ] **MATH-02**: Division operator unlocks at level 5
- [ ] **MATH-03**: Per-operator difficulty scaling is independent (separate maxOperand tracking)

- [ ] **TIMER-01**: Timer mode challenge (60-second sprint) is accessible from game screen
- [ ] **TIMER-02**: Timer mode uses unified star scoring consistent with normal mode

- [ ] **SOUND-01**: Player can mute/unmute with persistent state across sessions
- [ ] **SOUND-02**: Volume slider is accessible from mute button interaction

## Technical Improvements

- [ ] **PWA-01**: App can be installed on mobile devices for offline play
- [ ] **TEST-01**: useMathGame composable has Vitest unit tests at 85%+ coverage

## Visual Polish

- [ ] **THEME-01**: Background changes based on current difficulty/streak (4 themes)
- [ ] **MASCOT-01**: Additional mascot characters unlock at star thresholds

## Engagement Enhancements

- [ ] **STORY-01**: Story-driven progression with 7-world arc and text dialogue cutscenes
- [ ] **MINI-01**: Mini-games appear between problem sets every 5–7 correct answers
- [ ] **REACT-01**: Dynamic mascot reactions based on performance (9 reaction states)
- [ ] **REWARD-01**: Achievement badges and collectibles system (Math Museum)
- [ ] **HAPTIC-01**: Haptic feedback patterns on Android; graceful degradation on iOS
- [ ] **MAP-01**: Progress visualization map showing unlocked areas and achievement trees
