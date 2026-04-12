# Emma's Math Quest — Implementation Plan

## Vision

A delightful, Minecraft-themed math practice app that makes Emma *excited* to do math. Mobile-first, ultra-accessible, zero-friction. The app should feel like a game, not homework.

---

## Phase 1: Foundation ✅ (Complete)

> Scaffold the core layout and interaction loop.

### Completed Work
- [x] Vue 3 + Vite + Tailwind CSS v4 project setup
- [x] Minecraft-inspired design token system (`@theme` in `style.css`)
- [x] `ScoreHeader` — star count, game title, streak badge
- [x] `MascotPanel` — AI-generated fox wizard with float animation + speech bubbles
- [x] `ChallengeZone` — problem display with answer box, glow/shake feedback
- [x] `NumberPad` — touch-friendly 0–9, backspace, GO! (all buttons ≥ 60px)
- [x] Game loop: generate problem → input answer → check → feedback → next
- [x] Mobile-first responsive layout (mascot hidden < 640px)
- [x] SEO, Outfit font, viewport meta

### Current Component Tree
```
App.vue (game state)
├── ScoreHeader.vue (stars, title, streak)
├── MascotPanel.vue (mascot image + speech bubble)
├── ChallengeZone.vue (problem + answer box)
└── NumberPad.vue (digit grid + backspace + submit)
```

---

## Phase 2: Polish & Game Feel

> Make it feel *magical* — sound, animation, difficulty tuning.

### 2.1 — Animation & Juice
| File | Change |
|------|--------|
| [ChallengeZone.vue](file:///Users/hector/Developer/EmmaApp/src/components/ChallengeZone.vue) | Add confetti/particle burst on correct answer |
| [ScoreHeader.vue](file:///Users/hector/Developer/EmmaApp/src/components/ScoreHeader.vue) | Animate star count with a rolling number effect |
| [NumberPad.vue](file:///Users/hector/Developer/EmmaApp/src/components/NumberPad.vue) | Add subtle haptic-style bounce on button press |
| [style.css](file:///Users/hector/Developer/EmmaApp/src/style.css) | Add `@keyframes confetti`, `@keyframes pop-in` |

### 2.2 — Sound Effects
| File | Change |
|------|--------|
| [NEW] `src/composables/useSound.js` | Composable for playing sound effects (correct, wrong, tap, streak) |
| [NEW] `public/sounds/` | Audio assets: `correct.mp3`, `wrong.mp3`, `tap.mp3`, `streak.mp3` |
| [App.vue](file:///Users/hector/Developer/EmmaApp/src/App.vue) | Integrate `useSound` on answer check and button press |
| [ScoreHeader.vue](file:///Users/hector/Developer/EmmaApp/src/components/ScoreHeader.vue) | Add mute/unmute toggle button |

### 2.3 — Difficulty Tuning
| File | Change |
|------|--------|
| [App.vue](file:///Users/hector/Developer/EmmaApp/src/App.vue) | Adaptive difficulty: track success rate, auto-adjust operand range |
| [App.vue](file:///Users/hector/Developer/EmmaApp/src/App.vue) | Ensure ~80% success rate target (ZPD) |

---

## Phase 3: Progression & Persistence

> Give Emma a reason to come back.

### 3.1 — Level System
| File | Change |
|------|--------|
| [NEW] `src/composables/useProgression.js` | Level definitions, XP thresholds, unlock logic |
| [NEW] `src/components/LevelBadge.vue` | Visual level indicator (Level 1: Seedling → Level 5: Diamond) |
| [App.vue](file:///Users/hector/Developer/EmmaApp/src/App.vue) | Integrate progression system |

### 3.2 — Local Persistence
| File | Change |
|------|--------|
| [NEW] `src/composables/useSaveData.js` | `localStorage` wrapper for stars, level, settings |
| [App.vue](file:///Users/hector/Developer/EmmaApp/src/App.vue) | Load/save game state on mount/change |

### 3.3 — Session Management
| File | Change |
|------|--------|
| [NEW] `src/components/BreakReminder.vue` | "Time for a break!" modal after 15 min |
| [App.vue](file:///Users/hector/Developer/EmmaApp/src/App.vue) | Track session duration, trigger break reminder |

---

## Phase 4: Content Expansion

> More math, more fun.

### 4.1 — Problem Types
| Type | Operand Range | Phase |
|------|--------------|-------|
| Addition (1–10) | K level | ✅ Done |
| Subtraction (no negatives) | K level | ✅ Done |
| Addition (1–20) | 1st Grade | Phase 4 |
| Subtraction (1–20) | 1st Grade | Phase 4 |
| Missing addend (? + 3 = 7) | 1st Grade | Phase 4 |
| Counting (what comes next?) | Pre-K/K | Phase 4 |
| Comparison (> < =) | K/1st | Phase 4 |

### 4.2 — Themed Challenges
| File | Change |
|------|--------|
| [NEW] `src/components/ThemeSelector.vue` | Pick a world: Forest, Cave, Nether, End |
| [style.css](file:///Users/hector/Developer/EmmaApp/src/style.css) | Theme-specific color overrides via CSS custom properties |

---

## Phase 5: Platform & Distribution

> Get it into Emma's hands.

### 5.1 — PWA (Progressive Web App)
| File | Change |
|------|--------|
| [NEW] `public/manifest.json` | App name, icons, theme color, display: standalone |
| [NEW] `public/sw.js` | Service worker for offline caching |
| [index.html](file:///Users/hector/Developer/EmmaApp/index.html) | Link manifest, register SW |
| [NEW] `public/icons/` | App icons (192px, 512px) |

### 5.2 — Capacitor (Native Wrapper) — Optional
- Wrap as iOS/Android app via Capacitor
- Enables haptic feedback API, native splash screen
- App Store / Play Store distribution

---

## Verification Plan

### Automated
- `npm run build` — Ensure zero build errors after each phase
- Lighthouse audit — Target ≥ 95 Performance, 100 Accessibility
- Viewport testing at 320px, 390px, 768px, 1024px

### Manual
- Have Emma (or age-equivalent) play-test after Phase 2
- Parent feedback on progress visibility after Phase 3
- Offline testing after Phase 5.1

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Font fails to load (slow network) | Numbers look wrong | System font fallback stack; preload hint |
| Child rage-taps during feedback lockout | Frustration | Shorten lockout to 800ms; visual countdown |
| Problems too easy / too hard | Boredom / frustration | Adaptive difficulty (Phase 2.3) |
| localStorage wiped (private browsing) | Progress lost | Graceful fallback; future cloud save |
| Screen too small for problem display | Unreadable | Flex-wrap problem layout at 320px |
