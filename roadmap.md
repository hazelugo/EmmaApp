# EmmaApp - Math Game Roadmap

## 🚀 Current Implementation Status

### Core Logic (`useMathGame.js`)
- [x] **Reactive State**: `currentProblem`, `streak`, `stars`, and `feedback`.
- [x] **Problem Generation**:
    - [x] Addition and Subtraction.
    - [x] Constraints: Numbers 1–10 (starting at 5).
    - [x] Logic: `a >= b` for subtraction to prevent negative results.
- [x] **Answer Checking**: Validates input, updates streak, and handles feedback states.
- [x] **Adaptive Difficulty**: Automatically increases/decreases `maxOperand` based on a rolling success rate (80% target).
- [x] **Input Helpers**: `appendDigit` and `backspace` support.

### UI Components
- [x] **ChallengeZone**: Large font display of the math problem with pop-in animations.
- [x] **NumberPad**: Custom 0-9 input with backspace and submit.
- [x] **ScoreHeader**: Displays stars, streaks, and current difficulty level.
- [x] **Confetti**: Switched to `canvas-confetti` for professional rewards.
- [x] **Level Up Milestone**: Special "Master Mathematician Emma" celebration every 10 stars.

### Design & Polish
- [x] **Aesthetics**: Minecraft-inspired color palette and pixel-art style.
- [x] **Animations**: Floating mascot, shaking for errors, pulsing for success, and "roll-in" numbers.
- [x] **Sound Integration**: Hooked up for correct/wrong answers and streak milestones (plus success MP3 placeholder).

---

## 📅 Upcoming Features & Refined Tasks

### Phase 1: Gameplay Enhancements
- [ ] **Multiplication & Division**: Add a toggle or level progression to unlock these operators.
- [ ] **Timer Mode**: Challenge users to solve as many as possible in 60 seconds.
- [ ] **Sound Settings**: Persistent mute state and volume slider.
- [ ] **Star Shop**: Simple "purchases" using collected stars (e.g., changing mascot colors).

### Phase 2: Technical Improvements
- [x] **Persistent Storage**: Save stars to `localStorage` so they aren't lost on refresh.
- [ ] **Progressive Web App (PWA)**: Allow the app to be installed on mobile devices for offline play.
- [ ] **Unit Testing**: Add Vitest for the `useMathGame` composable logic.

### Phase 3: Visual Polish
- [ ] **Themed Backgrounds**: Change background based on current difficulty or streak (e.g., Forest -> Cave -> Nether).
- [ ] **More Mascots**: Unlock different animals or characters.

### Phase 4: Engagement Enhancements
- [ ] **Story-Driven Progression**: Turn levels into a 'Super Math Quest' with world exploration, cutscenes, and power-ups.
- [ ] **Mini-Games & Variety Breaks**: Quick action games (Math Dash, Shape Match) between problem sets for engagement.
- [ ] **Personalized Mascot Interactions**: Dynamic mascot reactions, voice lines, and speech bubbles based on performance.
- [ ] **Reward System & Collectibles**: Math badges, treasure chests, and a 'Math Museum' for earned items.
- [ ] **Sound & Haptic Enhancements**: More audio feedback, mascot voices, background music, sound effects, and device vibration.
- [ ] **Progress Visualization**: 'Math Map' showing unlocked areas, progress bars, and achievement trees.
