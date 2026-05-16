# Phase 9: Story-Driven Progression - Research

**Researched:** 2026-05-16
**Domain:** Vue 3 composable design, game state management, overlay sequencing, power-up mechanics
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STORY-01 | Story-driven progression with 7-world arc and text dialogue cutscenes | useStory.js composable pattern, DialogueCutsceneOverlay.vue overlay, power-up integration with useMathGame |
</phase_requirements>

---

## Summary

Phase 9 adds a narrative layer on top of the existing 7-level progression. The game already has a level system (levels 1–7, 10 stars per level), character-specific enemies per level in `useLevelTheme.js`, and two overlay modals that bookend each level (`LevelIntroModal` before, `LevelVictoryModal` after). Phase 9 inserts a **text dialogue cutscene** into the existing flow and adds **world-scoped power-ups** that affect gameplay in `useMathGame.js`.

The codebase follows a strict pattern: overlays are `v-if + <Transition>` with no router, state lives in composables with localStorage persistence, and all wiring happens in `App.vue`. This phase should follow those conventions exactly. No new routing, no video assets — text-only dialogue panels with mascot flavor, fitting the project's lightweight approach.

The 7-world arc maps directly onto the existing 7 levels. `useStory.js` should be a standalone composable that tracks story state (which world the player is on, which power-up is active, whether the cutscene has been seen) using localStorage, and exposes reactive refs that App.vue uses to show `DialogueCutsceneOverlay.vue` and pass the active power-up into `useMathGame`.

**Primary recommendation:** Build `useStory.js` as a flat composable (same shape as `useShop.js`), show the dialogue cutscene between the victory modal close and the intro modal open, and integrate power-ups as a multiplier/modifier passed into `checkAnswer()` or applied as a wrapper around it in App.vue.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 `ref` / `reactive` / `computed` / `watch` | ^3.5.32 [VERIFIED: package.json] | Reactive state for composable | Already used throughout |
| localStorage | Browser native | Persist story progress and power-up state | Same pattern as `emma-stars`, `emma-level`, etc. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | ^3.2.4 [VERIFIED: package.json] | Unit tests for useStory.js | Required — nyquist_validation is enabled |
| canvas-confetti | ^1.9.4 [VERIFIED: package.json] | Optional: small confetti burst on cutscene close | Already wired in App.vue, no install needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Text dialogue panel | Video cutscenes (CutsceneOverlay.vue exists) | Video needs large assets, was moved to legacy; text is lighter and matches requirements |
| Flat world data in useStory.js | Extending useLevelTheme.js | Keeps story concerns separated from visual themes; easier to test |
| Power-up ref passed as prop | Global provide/inject | Props are simpler, already established pattern for cross-composable communication in this codebase |

**Installation:** No new packages needed. [VERIFIED: package.json — all required libs already present]

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── composables/
│   └── useStory.js              # NEW — 7-world arc, cutscene state, power-up grants
├── components/
│   └── DialogueCutsceneOverlay.vue  # NEW — text dialogue overlay (v-if + Transition)
└── App.vue                      # MODIFIED — wire useStory, show cutscene, pass power-up
```

### Pattern 1: useStory.js Composable Shape

**What:** Standalone composable that owns all story state. Returns refs that App.vue binds to. Mirrors the shape of `useShop.js` and `useTimer.js`.

**When to use:** Any story/narrative state needed by App.vue or components.

**Example:**
```javascript
// Source: mirrors src/composables/useShop.js pattern [VERIFIED: codebase read]
import { ref, computed } from 'vue'

const WORLD_DATA = [
  // index 0 = World 1 = Level 1
  {
    worldNum: 1,
    dialogueLines: [
      'The adventure begins! Bowser has stolen the math scrolls!',
      'Emma, you must answer correctly to win them back!',
    ],
    powerUp: { type: 'doubleStars', label: '2x Stars', worldNum: 1 },
  },
  // ... worlds 2-7
]

export function useStory() {
  // Which world's cutscene has been shown — persisted so replays don't re-show
  const seenWorlds = ref(loadSeenWorlds())  // Set from localStorage
  const showCutscene = ref(false)
  const cutsceneWorld = ref(null)           // WORLD_DATA entry currently showing
  const activePowerUp = ref(null)           // { type, label, worldNum } | null

  function triggerCutscene(levelNum) {
    const worldData = WORLD_DATA[levelNum - 1]
    if (!worldData) return
    cutsceneWorld.value = worldData
    showCutscene.value = true
  }

  function dismissCutscene() {
    if (cutsceneWorld.value) {
      markWorldSeen(cutsceneWorld.value.worldNum)
      activePowerUp.value = cutsceneWorld.value.powerUp ?? null
    }
    showCutscene.value = false
    cutsceneWorld.value = null
  }

  return {
    showCutscene,
    cutsceneWorld,
    activePowerUp,
    triggerCutscene,
    dismissCutscene,
  }
}
```

### Pattern 2: DialogueCutsceneOverlay.vue

**What:** Full-screen overlay using `v-if` + `<Transition>`, identical structural pattern to `LevelVictoryModal.vue`. Renders dialogue lines one at a time with a "tap to continue" or "NEXT" button. Shows the mascot flavor text plus the upcoming power-up reward.

**When to use:** Between `LevelVictoryModal` close and `LevelIntroModal` open.

**Example structure:**
```vue
<!-- Source: pattern from LevelVictoryModal.vue [VERIFIED: codebase read] -->
<Transition name="cutscene-fade">
  <div v-if="show" class="fixed inset-0 z-[250] ...">
    <!-- dialogue line -->
    <p>{{ currentLine }}</p>
    <!-- power-up reveal -->
    <div v-if="isLastLine">Power-up unlocked: {{ powerUp.label }}!</div>
    <button @click="advance">{{ isLastLine ? 'LET\'S GO!' : 'NEXT →' }}</button>
  </div>
</Transition>
```

### Pattern 3: Cutscene Insertion Point in App.vue

**What:** The cutscene fires AFTER victory dismissal and BEFORE intro modal. `onVictoryNext()` in App.vue is the exact hook.

**When to use:** `completedLevel` advances on each victory; that is the trigger.

**Example:**
```javascript
// Source: App.vue onVictoryNext [VERIFIED: codebase read]
function onVictoryNext () {
  showLevelVictory.value = false
  playThemeMusic(selectedCharacter.value.id)
  if (completedLevel.value < 7) {
    // NEW: show cutscene for the upcoming world
    story.triggerCutscene(pendingLevel.value)  // pendingLevel is already incremented
    // showLevelIntro opens AFTER cutscene dismissal
  } else {
    generateProblem()
  }
}

function onCutsceneDismiss () {
  story.dismissCutscene()
  showLevelIntro.value = true
}
```

### Pattern 4: Power-Up Integration with useMathGame

**What:** Active power-up is a ref in `useStory.js`. App.vue passes it into answer checking logic as a modifier. Does not change the internals of `useMathGame.js` — the multiplier is applied in App.vue's `onSubmit()` handler, which already contains the `checkAnswer()` call and `stars.value++` side effects.

**When to use:** When `activePowerUp.value.type === 'doubleStars'`, apply star multiplier on correct answer. When `'extraTime'`, modify timer. When `'hint'`, surface a hint prop in ChallengeZone.

**Example (doubleStars power-up, App.vue):**
```javascript
// Applied in onSubmit() after result === 'correct'
if (story.activePowerUp.value?.type === 'doubleStars') {
  // checkAnswer already added 1 star; add one more
  stars.value++
  setStorage('emma-stars', stars.value)
}
```

Note: `stars` is a ref returned from `useMathGame()` — it is directly mutable from App.vue. [VERIFIED: App.vue uses stars directly for shop, timer, etc.]

### Pattern 5: localStorage Key Naming Convention

Existing keys follow `emma-*` pattern. [VERIFIED: useMathGame.js, useShop.js]

Story keys should be:
- `emma-story-seen-worlds` — JSON array of world numbers whose cutscene has been shown
- `emma-story-active-powerup` — JSON of the current power-up object (or empty)

### Anti-Patterns to Avoid

- **Re-triggering cutscene on page reload:** Guard with `seenWorlds` set. Cutscene fires once per world progression, not every time the page loads.
- **Inserting cutscene before victory modal closes:** The sequence must be: victory shown → player taps NEXT → victory hides → cutscene shows → player dismisses → intro shows. Do not stack modals.
- **Storing power-up effects inside useMathGame.js directly:** Keep concerns separated. useMathGame generates problems and tracks stars; useStory decides if a bonus applies. App.vue is the coordinator.
- **Video assets for cutscenes:** CutsceneOverlay.vue exists from legacy work but was superseded. Use text-only dialogue (requirement says "text dialogue cutscenes"). [VERIFIED: STATE.md notes, CutsceneOverlay.vue is legacy]
- **7 separate z-index layers competing:** All modals in this codebase use `z-[200]` or `z-[250]`. Cutscene overlay should be `z-[225]` — between victory (200) and the streak flash (500).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dialogue typing animation | Custom character-by-character timer loop | Simple CSS opacity transition on each line | Complexity adds bugs; the existing staggered transition pattern (LevelVictoryModal) is proven |
| Power-up persistence | Custom encode/decode logic | `JSON.stringify` / `JSON.parse` with try/catch (same pattern as other keys) | localStorage already used this way throughout |
| Cutscene sequence state machine | Complex multi-step XState or similar | `lineIndex` ref + `advance()` function | Trivially simple — 2-5 lines per world, single direction |

**Key insight:** The existing codebase uses the simplest possible state management that works. A `ref(0)` lineIndex counter and a "NEXT" button is the right scope for this feature.

---

## Common Pitfalls

### Pitfall 1: Cutscene shows again after page refresh
**What goes wrong:** `showCutscene` is a transient ref; on refresh it resets to `false` correctly, but if `seenWorlds` is not persisted, the cutscene re-triggers whenever victory fires.
**Why it happens:** Not persisting the "seen" state to localStorage.
**How to avoid:** On `dismissCutscene()`, immediately write the updated seen-set to `emma-story-seen-worlds`.
**Warning signs:** Cutscene appears every time a level is beaten on the same world number.

### Pitfall 2: Power-up persists across character resets
**What goes wrong:** Emma selects a new character, game resets, but `activePowerUp` still has the old world's power-up.
**Why it happens:** `useStory` is not wired into `resetGame()`.
**How to avoid:** When App.vue calls `resetGame()` (on character change — see `onSelectCharacter`), also call a `resetStory()` function that clears `activePowerUp` and `seenWorlds`, and writes empty values to localStorage.
**Warning signs:** World 1 power-up (doubleStars) active when player is on world 5.

### Pitfall 3: Overlay z-index stacking breaks touch targets
**What goes wrong:** Cutscene overlay at wrong z-index sits beneath victory modal or above streak flash; player can't tap buttons.
**Why it happens:** Copying z-[200] from victory modal; cutscene needs a higher value since it appears after victory closes.
**How to avoid:** Use `z-[225]` for the cutscene. It won't conflict with z-[200] (victory), z-[500] (streak flash), or z-[300] (PWA prompt if shown).
**Warning signs:** Buttons not responding to taps; another overlay visible through the cutscene.

### Pitfall 4: doubleStars power-up double-triggers level progression
**What goes wrong:** Adding a second star via the doubleStars power-up may cross the 10-star milestone a second time, triggering another `showLevelVictory`.
**Why it happens:** The milestone check in `checkAnswer()` fires on every star increment. Manually adding a star outside `checkAnswer()` bypasses it — unless App.vue also runs the milestone check.
**How to avoid:** Use `creditTimerCoins(1)` to add the bonus star, which already has milestone-safe logic. [VERIFIED: useMathGame.js `creditTimerCoins`]
**Warning signs:** Victory screen fires twice in a row for one correct answer.

### Pitfall 5: World data index off-by-one
**What goes wrong:** `WORLD_DATA[levelNum]` instead of `WORLD_DATA[levelNum - 1]` — world 1 gets world 2's dialogue.
**Why it happens:** Levels are 1-indexed; array is 0-indexed.
**How to avoid:** Always use `WORLD_DATA[levelNum - 1]` or key the object as `{ 1: ..., 2: ..., 7: ... }` (same shape as `PEACH_THEMES` in useLevelTheme.js).
**Warning signs:** First world shows wrong character name or power-up.

---

## Code Examples

### useStory.js localStorage helpers (same shape as useMathGame.js)
```javascript
// Source: useMathGame.js lines 17-36 [VERIFIED: codebase read]
function getStorageJSON(key, fallback) {
  try {
    const val = localStorage.getItem(key)
    return val !== null ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

function setStorageJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* quota exceeded or private */ }
}
```

### Overlay transition pattern (proven in codebase)
```css
/* Source: LevelVictoryModal.vue scoped styles [VERIFIED: codebase read] */
.cutscene-fade-enter-active { transition: opacity 0.45s ease; }
.cutscene-fade-leave-active { transition: opacity 0.3s ease; }
.cutscene-fade-enter-from,
.cutscene-fade-leave-to     { opacity: 0; }
```

### Line-advance pattern for dialogue
```javascript
// Simple, proven for this codebase's scope
const lineIndex = ref(0)
const isLastLine = computed(() => lineIndex.value >= props.lines.length - 1)

function advance() {
  if (isLastLine.value) {
    emit('done')
  } else {
    lineIndex.value++
  }
}
```

### Safe bonus star credit (avoids milestone double-trigger)
```javascript
// Source: useMathGame.js creditTimerCoins [VERIFIED: codebase read]
// In App.vue onSubmit(), after result === 'correct' with doubleStars active:
creditTimerCoins(1)  // milestone-safe; won't double-fire if the boundary is crossed
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Video cutscenes (CutsceneOverlay.vue) | Text dialogue cutscenes | Before Phase 9 (moved to legacy) | No large video assets needed; lighter, faster |
| Single `maxOperand` scalar | `maxOperandByOperator` object | Phase 2 | Per-operator difficulty; confirmed stable |

**Deprecated/outdated:**
- `CutsceneOverlay.vue`: Present in `src/components/` but considered legacy (STATE.md confirms video cutscene work is in `.planning/legacy/`). Phase 9 should NOT use it. Create `DialogueCutsceneOverlay.vue` instead.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Power-ups are world-scoped (one per world, granted at world start, lasts the whole world) | Architecture Patterns | If power-ups are meant to be temporary (single-level buffs or timed), the persistence model changes |
| A2 | Dialogue cutscene fires once per world on first completion (not every time the level ends) | Architecture Patterns | If it should fire every time, remove the `seenWorlds` guard |
| A3 | The 7 worlds map 1:1 to the 7 existing levels (world N = level N) | Architecture Patterns | If worlds span multiple levels, the trigger point changes |
| A4 | Power-up types to implement: doubleStars, extraTime, hint | Architecture/Power-Ups | Requirements say "power-ups earned per world" but do not enumerate types — these are proposed as Claude's discretion |

---

## Open Questions

1. **Power-up types and balance**
   - What we know: Requirements say "power-ups earned per world" but do not define types
   - What's unclear: Which 7 power-ups (one per world)? Are they cumulative or replaced?
   - Recommendation: Propose concrete set to user before planning: e.g., World 1: 2x Stars, World 2: Hint Bubble, World 3: Skip Problem, World 4: Freeze Timer, World 5: Triple Stars, World 6: Answer Shield, World 7: Super Mode. Planner should leave this as a discretion choice or surface it for user confirmation.

2. **Cutscene dialogue content**
   - What we know: 7 worlds, each character has a distinct enemy arc already in useLevelTheme.js
   - What's unclear: Should dialogue be character-specific (Peach says different things than Daisy) or generic?
   - Recommendation: Start with generic world dialogue (not character-specific) to keep `WORLD_DATA` flat. Character name can be injected via a `character` prop on the overlay.

3. **Does cutscene fire on World 7 (final boss)?**
   - What we know: Current `onVictoryNext` in App.vue branches on `completedLevel.value < 7` — level 7 skips to `generateProblem()`
   - What's unclear: Should defeating Bowser show a victory cutscene before "PLAY AGAIN"?
   - Recommendation: Yes — this is the climax. Fire a special "you saved the kingdom!" dialogue before the play-again flow. The planner should add this case.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 9 is purely code/config changes. No external tools, CLI utilities, databases, or services beyond the existing Vue 3 / Vite / Vitest stack, all of which are already confirmed present (package.json verified).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | vite.config.js (test block) |
| Quick run command | `npm run test` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STORY-01a | Story world advances as levels complete | unit | `npm run test -- useStory` | ❌ Wave 0 |
| STORY-01b | Cutscene shows once per world (guarded by seenWorlds) | unit | `npm run test -- useStory` | ❌ Wave 0 |
| STORY-01c | Power-up is granted when cutscene dismissed | unit | `npm run test -- useStory` | ❌ Wave 0 |
| STORY-01d | resetStory() clears power-up and seenWorlds | unit | `npm run test -- useStory` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green (all 27 existing + new story tests) before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/composables/__tests__/useStory.test.js` — covers STORY-01a through STORY-01d
- [ ] No new framework install needed — Vitest already configured

---

## Security Domain

`security_enforcement: true`, `security_asvs_level: 1` per config.json. ASVS Level 1 applies.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes (localStorage reads) | JSON.parse inside try/catch with typed fallback — same as existing pattern in useMathGame.js |
| V6 Cryptography | no | — |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malformed localStorage JSON (user-edited or corrupted) | Tampering | `try/catch` around JSON.parse, fallback to empty default |
| Power-up inflation via localStorage edit | Tampering | [LOW RISK for children's game] No server-side validation needed; data is cosmetic |

**Security assessment:** Phase 9 stores story progress and power-up state in localStorage (client-only, no auth, no PII). Risk level is LOW for a children's single-player game. The only control needed is defensive JSON.parse (already established pattern).

---

## Sources

### Primary (HIGH confidence)
- `src/composables/useMathGame.js` — verified localStorage pattern, milestone logic, `creditTimerCoins` safety
- `src/composables/useLevelTheme.js` — verified 7-world/level structure, CHARACTER_THEMES shape
- `src/components/LevelVictoryModal.vue` — verified overlay pattern, Transition naming, z-index
- `src/components/LevelIntroModal.vue` — verified overlay pattern, prop/emit contract
- `src/App.vue` — verified `onVictoryNext()` hook point, composable wiring pattern, star ref mutability
- `src/components/CutsceneOverlay.vue` — confirmed legacy video approach; NOT the pattern for Phase 9
- `.planning/STATE.md` — confirmed video cutscene is legacy; text dialogue is the new approach
- `package.json` — verified all library versions

### Secondary (MEDIUM confidence)
- ROADMAP.md Phase 9 description — "text dialogue cutscenes" and "power-ups earned per world" define scope

### Tertiary (LOW confidence)
- Power-up type proposals (doubleStars, hint, etc.) — [ASSUMED] based on common game mechanics; not specified in requirements

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified in package.json
- Architecture: HIGH — derived from verified codebase patterns; no new patterns introduced
- Pitfalls: HIGH — derived from actual code paths (milestone logic, z-index values, character reset flow)
- Power-up types: LOW — requirements do not enumerate them; flagged as open question

**Research date:** 2026-05-16
**Valid until:** 2026-06-16 (stable stack, no external dependencies)
