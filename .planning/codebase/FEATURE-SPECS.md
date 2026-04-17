# Emma's Star World — Feature Implementation Specs

These are standalone feature specs you can hand to another AI or developer. Each spec is self-contained with context, file paths, exact code locations, acceptance criteria, and implementation guidance.

> [!IMPORTANT]
> **Current Stack**: Vue 3 (Composition API, `<script setup>`), Vite 8, Tailwind CSS v4 (`@theme` tokens), `canvas-confetti`. All state lives in composables under `src/composables/`. The theme is Mario/Nintendo-inspired with a custom `Gamtex` pixel font and color tokens like `mario-red`, `pipe`, `luigi`, `star-gold`, etc.

---

## Feature 1: Timer Mode (60-Second Blitz)

### Goal
A timed challenge where Emma solves as many problems as possible in 60 seconds. Shows a countdown timer, tracks problems solved, and displays a results screen at the end.

### Files to Modify

#### [NEW] `src/composables/useTimerMode.js`
Create a composable that manages timer state:

```js
import { ref, computed } from 'vue'

export function useTimerMode () {
  const isTimerMode    = ref(false)
  const timeRemaining  = ref(60)     // seconds
  const timerActive    = ref(false)
  const solvedCount    = ref(0)
  const timerResults   = ref(null)   // { solved, accuracy, bestStreak }
  let intervalId       = null

  function startTimer () { /* set isTimerMode=true, timerActive=true, reset counters, start setInterval that decrements timeRemaining every 1s, call endTimer() when it hits 0 */ }
  function endTimer ()   { /* clear interval, set timerActive=false, populate timerResults */ }
  function resetTimer () { /* reset everything to defaults */ }

  const timeDisplay = computed(() => {
    const m = Math.floor(timeRemaining.value / 60)
    const s = timeRemaining.value % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  })

  return { isTimerMode, timeRemaining, timerActive, solvedCount, timerResults, timeDisplay, startTimer, endTimer, resetTimer }
}
```

#### [NEW] `src/components/TimerBar.vue`
A horizontal progress bar that sits below the `ScoreHeader`:
- Full width, height ~12px, rounded
- Background: `bg-dark/30`
- Fill: `bg-star-gold` that shrinks from 100% → 0% over 60s (use `width: ${(timeRemaining/60)*100}%` with CSS transition)
- When ≤ 10 seconds: fill turns `bg-mario-red` and pulses (use the existing `pulse-glow` class or add a `bg-pulse` animation)
- Show `timeDisplay` text centered on the bar in bold white, large enough for a 6-year-old

#### [NEW] `src/components/TimerResults.vue`
A modal/overlay shown when the timer ends (similar to `LevelUpModal`):
- Display: "⏱️ TIME'S UP!", solved count with coin icon, accuracy percentage, and best streak
- Use the existing `block-border` style, `flagpole-sky` background
- "PLAY AGAIN" button that calls `resetTimer()` + `startTimer()`
- "BACK" button that calls `resetTimer()` (returns to normal mode)

#### [MODIFY] `src/App.vue`
- Import and destructure `useTimerMode()`
- Pass `solvedCount` increment into the `onSubmit` correct-answer branch
- Conditionally render `<TimerBar>` between `ScoreHeader` and the challenge area when `isTimerMode` is true
- Show `<TimerResults>` when `timerResults` is not null
- Add a way to enter timer mode — either a button in the `ScoreHeader` or a small toggle/icon

#### [MODIFY] `src/components/ScoreHeader.vue`
- Add a timer icon button (⏱️) next to the mute toggle
- Emit `@start-timer` event when clicked
- When timer mode is active, maybe change the header background to `bg-mario-red` for visual distinction

### Acceptance Criteria
- [ ] Countdown from 60 to 0, displayed as `1:00` → `0:00`
- [ ] Visual progress bar shrinks smoothly
- [ ] Bar turns red + pulses when ≤ 10s
- [ ] Problems auto-advance on correct (no confetti in timer mode — keep it fast)
- [ ] Results screen shows solved count, accuracy, best streak
- [ ] Can replay or exit back to normal mode
- [ ] Timer state does not persist to localStorage (session only)

---

## Feature 2: Multiplication & Division

### Goal
Expand the math engine to support `×` and `÷` operators. These should unlock progressively — either after reaching a certain star count, or via a manual toggle.

### Files to Modify

#### [MODIFY] `src/composables/useMathGame.js`

**Changes to `generateProblem()`** (around line 60):

Currently the ops array is `['+', '-']`. Expand it conditionally:

```js
function generateProblem () {
  // Unlock multiplication at 30 stars, division at 50
  const ops = ['+', '-']
  if (stars.value >= 30) ops.push('×')
  if (stars.value >= 50) ops.push('÷')

  currentProblem.operator = ops[Math.floor(Math.random() * ops.length)]
  const max = difficulty.maxOperand

  if (currentProblem.operator === '+') {
    // existing addition logic (lines 65-67)
  } else if (currentProblem.operator === '-') {
    // existing subtraction logic (lines 69-73)
  } else if (currentProblem.operator === '×') {
    // Keep factors small: 1-10 × 1-10 (never exceed 100)
    currentProblem.a = Math.floor(Math.random() * Math.min(max, 10)) + 1
    currentProblem.b = Math.floor(Math.random() * Math.min(max, 10)) + 1
  } else if (currentProblem.operator === '÷') {
    // Generate a valid division: pick b first, then a = b * quotient
    const b = Math.floor(Math.random() * Math.min(max, 10)) + 1
    const quotient = Math.floor(Math.random() * 10) + 1
    currentProblem.a = b * quotient
    currentProblem.b = b
  }
  // rest of function unchanged...
}
```

**Changes to `correctAnswer` computed** (around line 54):

```js
const correctAnswer = computed(() => {
  switch (currentProblem.operator) {
    case '+': return currentProblem.a + currentProblem.b
    case '-': return currentProblem.a - currentProblem.b
    case '×': return currentProblem.a * currentProblem.b
    case '÷': return currentProblem.a / currentProblem.b
    default:  return 0
  }
})
```

#### [MODIFY] `src/components/ChallengeZone.vue`
No changes needed — the operator is already displayed dynamically from the prop.

#### [OPTIONAL] `src/components/ScoreHeader.vue`
Show a small badge or indicator of which operators are unlocked. For example, below the title, something like: `+ − ×` where unlocked operators are bright and locked ones are dimmed/gray.

### Constraints
- Division must always produce whole-number results (integer quotients)
- Multiplication factors should stay ≤ 10 regardless of maxOperand
- Division dividend never exceeds 100

### Acceptance Criteria
- [ ] `×` appears in problem generation after 30 stars
- [ ] `÷` appears after 50 stars
- [ ] Division always produces whole numbers
- [ ] `correctAnswer` computed handles all 4 operators
- [ ] Adaptive difficulty still works correctly with new operators
- [ ] Existing addition/subtraction behavior is unchanged

---

## Feature 3: Progressive Web App (PWA)

### Goal
Make the app installable on mobile devices and playable offline. No service worker framework needed — keep it vanilla.

### Files to Create/Modify

#### [NEW] `public/manifest.json`
```json
{
  "name": "Emma's Star World",
  "short_name": "Star World",
  "description": "A fun math game for kids in the Mushroom Kingdom!",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#4A90D9",
  "theme_color": "#E52521",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

#### [NEW] `public/sw.js`
A simple cache-first service worker:
```js
const CACHE_NAME = 'emma-star-world-v1'
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  )
})
```

> [!TIP]
> After building with `npm run build`, the Vite output in `dist/` includes hashed asset filenames. The service worker should cache `/` and the built assets. For a more robust approach, consider using `vite-plugin-pwa` (`npm install -D vite-plugin-pwa`) which auto-generates the SW with Workbox and handles asset hashing. But the manual approach above works for simple offline caching.

#### [NEW] `public/icons/`
Generate 3 PNG icons:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `icon-maskable-512.png` (512×512 with extra safe-zone padding — ~80% centered content)

Use any of the existing character assets (e.g., `mascot.png`) as the base. Can be created with an image editor or AI image generation.

#### [MODIFY] `index.html`
Add these two lines inside `<head>`:
```html
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

Add this script at the end of `<body>` (after the existing `<script>` tag):
```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
  }
</script>
```

### Acceptance Criteria
- [ ] Lighthouse PWA audit passes (installable, has manifest, has SW)
- [ ] App can be "Add to Home Screen" on iOS Safari and Android Chrome
- [ ] App loads offline after first visit
- [ ] App opens in standalone mode (no browser chrome)
- [ ] Portrait orientation is enforced

---

## Feature 4: Unit Testing with Vitest

### Goal
Add automated tests for the `useMathGame` composable to prevent regressions as features are added.

### Setup

```bash
npm install -D vitest @vue/test-utils happy-dom
```

#### [MODIFY] `package.json`
Add a test script:
```json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run"
}
```

#### [MODIFY] `vite.config.js`
Add test configuration:
```js
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  test: {
    environment: 'happy-dom',
  },
})
```

#### [NEW] `src/composables/__tests__/useMathGame.test.js`

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { useMathGame } from '../useMathGame.js'

// Mock localStorage
const localStorageMock = { getItem: () => null, setItem: () => {} }
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('useMathGame', () => {
  let game

  beforeEach(() => {
    game = useMathGame()
  })

  describe('generateProblem', () => {
    it('generates a problem with valid operands', () => {
      const { currentProblem } = game
      expect(currentProblem.a).toBeGreaterThanOrEqual(0)
      expect(currentProblem.b).toBeGreaterThanOrEqual(0)
      expect(['+', '-']).toContain(currentProblem.operator)
    })

    it('ensures a >= b for subtraction', () => {
      // Generate many problems and verify constraint
      for (let i = 0; i < 100; i++) {
        game.generateProblem()
        if (game.currentProblem.operator === '-') {
          expect(game.currentProblem.a).toBeGreaterThanOrEqual(game.currentProblem.b)
        }
      }
    })

    it('resets answer and feedback on new problem', () => {
      game.appendDigit(5)
      game.generateProblem()
      expect(game.answer.value).toBe('')
      expect(game.feedback.value).toBe('')
    })
  })

  describe('checkAnswer', () => {
    it('returns null when answer is empty', () => {
      expect(game.checkAnswer()).toBeNull()
    })

    it('returns "correct" for right answer', () => {
      const correct = game.correctAnswer.value
      game.answer.value = String(correct)
      expect(game.checkAnswer()).toBe('correct')
    })

    it('increments stars on correct answer', () => {
      const before = game.stars.value
      game.answer.value = String(game.correctAnswer.value)
      game.checkAnswer()
      expect(game.stars.value).toBe(before + 1)
    })

    it('increments streak on correct, resets on wrong', () => {
      game.answer.value = String(game.correctAnswer.value)
      game.checkAnswer()
      expect(game.streak.value).toBe(1)

      game.generateProblem()
      game.answer.value = '9999' // wrong
      game.checkAnswer()
      expect(game.streak.value).toBe(0)
    })

    it('returns "wrong" for incorrect answer', () => {
      game.answer.value = '9999'
      expect(game.checkAnswer()).toBe('wrong')
    })

    it('locks input during feedback', () => {
      game.answer.value = '9999'
      game.checkAnswer() // now feedback is 'wrong'
      expect(game.checkAnswer()).toBeNull() // locked
    })
  })

  describe('input helpers', () => {
    it('appendDigit adds to answer', () => {
      game.appendDigit(3)
      expect(game.answer.value).toBe('3')
      game.appendDigit(7)
      expect(game.answer.value).toBe('37')
    })

    it('appendDigit caps at 3 digits', () => {
      game.appendDigit(1)
      game.appendDigit(2)
      game.appendDigit(3)
      expect(game.appendDigit(4)).toBe(false)
      expect(game.answer.value).toBe('123')
    })

    it('backspace removes last digit', () => {
      game.appendDigit(5)
      game.appendDigit(6)
      game.backspace()
      expect(game.answer.value).toBe('5')
    })
  })

  describe('adaptive difficulty', () => {
    it('increases maxOperand after sustained success', () => {
      const initial = game.difficulty.maxOperand
      // Simulate 10 correct answers
      for (let i = 0; i < 10; i++) {
        game.answer.value = String(game.correctAnswer.value)
        game.checkAnswer()
        game.clearFeedback()
        game.generateProblem()
      }
      expect(game.difficulty.maxOperand).toBeGreaterThan(initial)
    })
  })
})
```

### Run Command
```bash
npm run test:run
```

### Acceptance Criteria
- [ ] All tests pass with `npm run test:run`
- [ ] Tests cover: problem generation constraints, answer checking, scoring, input helpers, adaptive difficulty
- [ ] Tests mock `localStorage` to avoid side effects
- [ ] No flaky tests (subtraction constraint tested with 100 iterations)

---

## Feature 5: Themed Backgrounds (Worlds)

### Goal
Change the background gradient and ambient decorations based on the current difficulty level or star count, creating a sense of progression through "worlds."

### World Definitions

| World | Star Range | Background Gradient | Decoration |
|-------|-----------|-------------------|------------|
| **Mushroom Kingdom** | 0–19 | Current sky → green → brown | ☁️ clouds (existing) |
| **Desert Land** | 20–39 | `#F4A460` → `#DEB887` → `#D2691E` | 🌵 cacti, sun |
| **Ocean World** | 40–59 | `#006994` → `#40E0D0` → `#0077B6` | 🐠 fish, 🫧 bubbles |
| **Nether / Lava** | 60–79 | `#8B0000` → `#FF4500` → `#2C2C2C` | 🔥 flames, 💀 lava |
| **Rainbow Road** | 80+ | Animated rainbow gradient | ⭐ sparkles |

### Files to Modify

#### [NEW] `src/composables/useWorldTheme.js`

```js
import { computed } from 'vue'

const WORLDS = [
  { name: 'Mushroom Kingdom', minStars: 0,  gradient: 'linear-gradient(180deg, #4A90D9 0%, #87CEEB 40%, #7ADB7E 75%, #8D6E4C 100%)', decoration: '☁️' },
  { name: 'Desert Land',      minStars: 20, gradient: 'linear-gradient(180deg, #F4A460 0%, #DEB887 50%, #D2691E 100%)',                decoration: '🌵' },
  { name: 'Ocean World',      minStars: 40, gradient: 'linear-gradient(180deg, #006994 0%, #40E0D0 50%, #0077B6 100%)',                decoration: '🐠' },
  { name: 'Lava Land',        minStars: 60, gradient: 'linear-gradient(180deg, #8B0000 0%, #FF4500 50%, #2C2C2C 100%)',                decoration: '🔥' },
  { name: 'Rainbow Road',     minStars: 80, gradient: 'linear-gradient(270deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff)', decoration: '⭐' },
]

export function useWorldTheme (stars) {
  const currentWorld = computed(() => {
    // Find the highest-tier world the player qualifies for
    return [...WORLDS].reverse().find(w => stars.value >= w.minStars) || WORLDS[0]
  })

  return { currentWorld, WORLDS }
}
```

#### [MODIFY] `src/App.vue`
- Import `useWorldTheme` and pass it `stars`
- Apply `currentWorld.gradient` to the root element via a dynamic `:style` binding
- The current background is set on `body` in `style.css` — you'll need to either:
  - **Option A**: Override `body` background from App.vue using a watcher that sets `document.body.style.background`
  - **Option B**: Move the background from `body` CSS to the `#app-root` div and bind it dynamically. This is cleaner.
- Display `currentWorld.name` somewhere visible — perhaps below the title in `ScoreHeader`, or as a small badge

#### [MODIFY] `src/style.css`
- Remove the hardcoded `background:` from the `body` rule (lines 81-87), replace with a fallback color: `background-color: var(--color-sky);`
- The world gradient will be applied dynamically via Vue

#### [MODIFY] `src/components/ScoreHeader.vue`
- Accept a new prop: `worldName: { type: String, default: '' }`
- Display it as a small subtitle under "Emma's Star World": `<span class="text-xs opacity-70">{{ worldName }}</span>`

### Acceptance Criteria
- [ ] Background gradient changes based on star count thresholds
- [ ] Transition between worlds is smooth (use CSS `transition: background 1s ease`)
- [ ] World name is displayed somewhere in the UI
- [ ] Default Mushroom Kingdom theme works for 0 stars
- [ ] Rainbow Road has an animated gradient (use `background-size: 400% 400%` with `animation`)

---

## Feature 6: Sound Settings Persistence

### Goal
Remember the mute state across sessions using `localStorage`, and optionally add a simple volume control.

### Files to Modify

#### [MODIFY] `src/composables/useSound.js`

At the top, change the `isMuted` initialization (line 9):
```js
const isMuted = ref(localStorage.getItem('emma-muted') === 'true')
```

In `toggleMute()` (line 103), add persistence:
```js
function toggleMute () {
  isMuted.value = !isMuted.value
  localStorage.setItem('emma-muted', isMuted.value)
}
```

**Optional volume control** — add a `volume` ref:
```js
const volume = ref(Number(localStorage.getItem('emma-volume')) || 0.5)

function setVolume (v) {
  volume.value = Math.max(0, Math.min(1, v))
  localStorage.setItem('emma-volume', volume.value)
}
```

Then update `playTone` to multiply `volume` parameter by `volume.value`:
```js
function playTone (freq, type = 'square', duration = 0.15, vol = 0.2) {
  if (isMuted.value) return
  const effectiveVol = vol * volume.value  // scale by global volume
  // ... use effectiveVol instead of vol in the gain envelope
}
```

### Acceptance Criteria
- [ ] Mute state persists across page reloads
- [ ] Volume level (if implemented) persists across page reloads
- [ ] Default volume is 0.5 on first visit
- [ ] Muting still works instantly (no delay)

---

## General Implementation Notes for the Developer

> [!IMPORTANT]
> **Read these before starting any feature.**

1. **Tailwind v4 `@theme`**: All colors are defined in `src/style.css` under `@theme { }`. Reference them with Tailwind classes like `bg-mario-red`, `text-star-gold`, etc. Do NOT hardcode hex colors in components — add new tokens to `@theme` if needed.

2. **Component pattern**: Every component uses `<script setup>` with `defineProps` and `defineEmits`. No Options API.

3. **Naming**: All composables export a single `useX()` function. Files live in `src/composables/`.

4. **State flow**: Game logic lives in composables. Components are purely presentational + emit events upward. `App.vue` is the orchestration layer that wires composables to components.

5. **Animations**: Custom keyframes go in `style.css`. Utility classes (`.pop-in`, `.shake`, `.block-bump`, etc.) are defined there too. The `prefers-reduced-motion` media query at the end of `style.css` disables all animations globally.

6. **Assets**: Pixel-art PNGs go in `src/assets/`. Always add `style="image-rendering: pixelated;"` to `<img>` tags using pixel art to keep them crisp.

7. **Touch targets**: All interactive elements must be ≥ 60px height with generous padding. This is a game for a 6-year-old.

8. **Testing**: When running the dev server, use `npm run dev` from the project root. Node is at `/Users/hector/.nvm/versions/node/v24.14.0/bin/node` (nvm).
