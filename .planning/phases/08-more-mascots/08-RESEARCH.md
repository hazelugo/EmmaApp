# Phase 8: More Mascots — Research

**Researched:** 2026-05-16
**Domain:** Vue 3 component data modeling + runtime unlock computation
**Confidence:** HIGH

## Summary

Phase 8 adds 6 new Nintendo-inspired mascot characters to the CharacterSelect screen. Characters unlock at star thresholds computed at runtime from the `stars` ref — no additional localStorage keys. The existing character array in CharacterSelect.vue is self-contained (no composable, no prop); it must be refactored to accept star-count-aware unlock state. The `stars` ref lives in `useMathGame.js` and is exposed from App.vue.

The central design question is **data flow**: `stars` is owned by `useMathGame` but CharacterSelect currently has no visibility into it. Two valid approaches exist — prop-threading from App.vue or calling `useMathGame` directly inside CharacterSelect. The established project pattern (composables called in App.vue, state passed as props) should be followed for consistency.

Each new character needs: a PNG image, Tailwind theme colors (bg + border), an icon emoji, and optionally a BGM theme MP3 and level-theme entries in `useLevelTheme.js`. Characters without full artwork can use emoji-only display (Toad precedent). Characters without MP3 themes can fall back to an existing track.

**Primary recommendation:** Add a `stars` prop to CharacterSelect.vue; compute `isUnlocked` inline per character using a threshold field; display locked characters as greyed-out with star cost badge. No new composable needed — pure data + template work.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MASCOT-01 | Additional mascot characters unlock at star thresholds | Unlock computed from `stars` ref passed as prop; threshold field on each character object; no extra localStorage keys |
</phase_requirements>

## Standard Stack

No new packages needed. All capabilities are already in the project.

### Core (all already installed)
| Library | Version | Purpose | Note |
|---------|---------|---------|------|
| Vue 3 | 3.5.32 | Reactivity, template rendering | `computed`, `ref`, `v-for` |
| Tailwind CSS v4 | 4.2.2 | Utility classes for locked/unlocked states | `@theme` tokens in style.css |
| Vite | 8.0.4 | Static asset import via `import.meta.glob` or direct import | Used for PNG imports |

**No new npm packages are required for this phase.** [VERIFIED: package.json]

## Architecture Patterns

### Current CharacterSelect Data Flow
[VERIFIED: direct codebase read]

```
CharacterSelect.vue
  ├── characters[] — hardcoded array (4 items), no prop
  ├── emits('select', char)
  └── No star/unlock awareness

App.vue
  ├── useMathGame() → stars ref
  └── <CharacterSelect @select="onSelectCharacter" />
       (currently passes NO props)
```

### Recommended Data Flow (Post-Phase)

```
App.vue
  ├── useMathGame() → stars
  └── <CharacterSelect :stars="stars" @select="onSelectCharacter" />

CharacterSelect.vue
  ├── props: { stars: Number }
  ├── characters[] — 10 items, each has `unlockAt` field (0 = always unlocked)
  ├── computed isUnlocked(char) → stars >= char.unlockAt
  └── Locked display: greyed out button + star badge overlay
```

### Character Object Schema

Current schema (4 characters):
```js
{
  id: 'peach',
  name: 'Princess Peach',
  src: peachSrc,        // imported PNG or null for emoji-only
  bg: 'bg-peach/60',    // Tailwind utility referencing @theme token
  border: 'border-peach-dark',
  icon: '👑',
}
```

Extended schema (new field):
```js
{
  id: 'waluigi',
  name: 'Waluigi',
  src: null,            // null = emoji-only (Toad precedent)
  emoji: '🎭',
  bg: 'bg-luigi/60',   // reuse existing or add new @theme token
  border: 'border-luigi-dark',
  icon: '🎭',
  unlockAt: 50,         // stars required; 0 for always-unlocked
}
```

### Existing 4 Characters (always unlocked, unlockAt: 0)
[VERIFIED: CharacterSelect.vue]

| id | name | src | colors |
|----|------|-----|--------|
| peach | Princess Peach | mascot.png | bg-peach, border-peach-dark |
| daisy | Princess Daisy | daisy.png | bg-daisy, border-daisy-dark |
| rosalina | Rosalina | rosalina.png | bg-rosalina, border-rosalina-dark |
| toad | Toad | toad.png | bg-mario-red, border-mario-red-dark |

### Toad Precedent: Emoji-Only Characters
[VERIFIED: useLevelTheme.js — all TOAD_THEMES have `enemyImage: null, victoryImage: null`]

Toad demonstrates the pattern for characters without battle artwork:
- LevelIntroModal and LevelVictoryModal handle `null` image gracefully (gradient background only)
- CharacterSelect already handles `v-if="char.src"` / `v-else` emoji fallback
- New emoji-only characters need zero image assets to function; can be added incrementally

### Unlock Threshold Strategy

Suggested thresholds (6 new characters, star economy context):
- Stars accumulate at 1 per correct answer
- Level victories occur every 10 stars
- A player reaches ~50-100 stars in first session

| Threshold | Represents |
|-----------|-----------|
| 0 | Always unlocked (original 4) |
| 25 | Early unlock (~2-3 levels) |
 | 50 | Mid unlock (~5 levels) |
| 100 | Late unlock (~10 levels) |
| 150 | Very late |
| 200 | Endgame |

These are `[ASSUMED]` — exact thresholds are a product decision. The code structure supports any integer value.

### Locked Character UI Pattern

Two options:
1. **Greyed-out with lock overlay** — button rendered but visually disabled, shows star cost
2. **Hidden until unlocked** — simpler, but less motivating

Option 1 is recommended (Nintendo-style: show what's coming, motivate the player). Implementation:

```html
<button
  :disabled="!isUnlocked(char)"
  :class="{ 'opacity-40 grayscale': !isUnlocked(char) }"
  @click="isUnlocked(char) ? selectCharacter(char) : null"
>
  <!-- lock badge overlay -->
  <div v-if="!isUnlocked(char)"
       class="absolute top-1 right-1 bg-dark/80 text-star-gold
              text-xs font-bold px-2 py-1 rounded-full z-20">
    ⭐ {{ char.unlockAt }}
  </div>
  ...
</button>
```

### BGM Handling for New Characters

`useSound.js` has `CHARACTER_BGM` lookup:
```js
const CHARACTER_BGM = {
  peach: peachThemeMp3,
  daisy: daisyThemeMp3,
  rosalina: rosalinaThemeMp3,
  toad: toadThemeMp3,
  title: titleThemeMp3,
}
```
[VERIFIED: useSound.js]

`playThemeMusic(charId)` is called in App.vue's `onSelectCharacter`. If a new character's id is not in `CHARACTER_BGM`, the lookup returns `undefined` and `new Audio(undefined)` will silently fail (no crash, no music).

**Options:**
- A. Add MP3 file per new character — requires new audio assets
- B. Fallback to an existing track — safest, no asset dependency
- C. Fallback to `title` theme — consistent, always available

Recommendation: Add a fallback in `playThemeMusic` (e.g., `CHARACTER_BGM[id] || CHARACTER_BGM['title']`) so new characters without dedicated MP3s play the title theme. This is a 1-line code change.

### Level Themes for New Characters

`useLevelTheme.js` has `CHARACTER_THEMES` keyed by character id, with `getLevelTheme` falling back to `peach` if the id is unknown:
```js
export function getLevelTheme (level, characterId = 'peach') {
  const charTheme = CHARACTER_THEMES[characterId] || CHARACTER_THEMES['peach']
  return charTheme[level] ?? charTheme[1]
}
```
[VERIFIED: useLevelTheme.js]

New characters without their own THEMES entry will automatically fall back to Peach's themes — they get valid enemy images and all. This is safe and requires zero additional work for a first implementation.

**To add character-specific themes later:** Add a `NEWCHAR_THEMES` object to `useLevelTheme.js` and register it in `CHARACTER_THEMES`. Completely optional for Phase 8.

### Recommended Project Structure Change

```
src/
├── assets/
│   └── [new character PNGs here if using image assets]
├── components/
│   └── CharacterSelect.vue   ← modify: add stars prop + unlock logic
├── composables/
│   └── useSound.js           ← modify: BGM fallback for unknown charIds
└── App.vue                   ← modify: pass :stars="stars" to CharacterSelect
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Persisting unlock state | New localStorage key | Compute from `stars` ref at runtime | Requirement explicitly prohibits extra keys |
| Asset bundling for new PNGs | Custom loader | Direct `import` at top of file (existing pattern) | Already established in CharacterSelect.vue and useLevelTheme.js |
| Star-count reactivity | Polling/manual refresh | Vue `computed` or inline `:disabled="stars < char.unlockAt"` | Vue's reactivity handles this automatically |
| New composable for unlock | `useCharacterUnlock.js` | Inline computed in CharacterSelect | Overkill — 1 computed covers all characters |

**Key insight:** The unlock feature is pure derived state. `stars >= char.unlockAt` is a one-liner in the template; no composable, no store, no extra state.

## Common Pitfalls

### Pitfall 1: stars reactivity not flowing into CharacterSelect
**What goes wrong:** Character buttons remain locked even after earning stars during play.
**Why it happens:** CharacterSelect is shown when `!selectedCharacter` — this is the initial screen before a character is picked. Stars earned during play don't matter here since the user already selected. However, if they return to character select (e.g., reset), stars must be reactive.
**How to avoid:** Pass `:stars="stars"` as a prop (not a computed snapshot). Vue's reactivity propagates `stars.value` changes to the prop automatically.
**Warning signs:** Lock state doesn't update on star gain during testing.

### Pitfall 2: BGM crash for new character ids
**What goes wrong:** `new Audio(undefined)` or `currentBgmAudio.play()` throws if `CHARACTER_BGM[id]` is undefined.
**Why it happens:** useSound.js's `playThemeMusic` does a direct lookup with no fallback.
**How to avoid:** Add `|| CHARACTER_BGM['title']` fallback in `playThemeMusic`.
**Warning signs:** Console error on character select, no music plays.

### Pitfall 3: New colors not in Tailwind @theme
**What goes wrong:** `bg-waluigi/60` class generates no CSS; button appears transparent.
**Why it happens:** Tailwind v4 uses `@theme` tokens in style.css — unknown tokens produce empty classes.
**How to avoid:** Either reuse existing tokens (luigi, rosalina, mario-red, daisy, peach colors) or add new `@theme` entries to style.css before referencing them in component.
**Warning signs:** Background glow is invisible on hover; border color is wrong.

### Pitfall 4: Level themes showing wrong character artwork
**What goes wrong:** New character plays Peach's battle screens (Goomba, Bowser, etc.).
**Why it happens:** `getLevelTheme` falls back to peach for unknown character ids — this is intentional and safe but may be unexpected.
**How to avoid:** Document the fallback clearly. Peach's artwork still renders valid battle screens. Character-specific themes are deferred to a future phase if desired.
**Warning signs:** None — this is working-as-designed behavior.

### Pitfall 5: CharacterSelect grid layout breaks with 10 characters
**What goes wrong:** 2-column mobile / 4-column desktop grid looks cramped or overflows.
**Why it happens:** Current grid is `grid-cols-2 md:grid-cols-4` — 4 characters = 1 row on desktop, 2 rows on mobile. 10 characters = 3 rows on desktop (awkward), 5 rows on mobile.
**How to avoid:** Consider `md:grid-cols-5` for 10 chars or `md:grid-cols-6` — or group original + unlockable in sections. Design decision required.
**Warning signs:** Characters overflow the modal or wrap badly on small screens.

## Code Examples

### Pass stars prop from App.vue
```html
<!-- App.vue — verified existing pattern location -->
<CharacterSelect
  v-if="!selectedCharacter"
  :stars="stars"
  @select="onSelectCharacter"
/>
```
[ASSUMED pattern — stars currently not passed]

### CharacterSelect unlock logic
```js
// CharacterSelect.vue <script setup>
const props = defineProps({
  stars: { type: Number, default: 0 }
})

// Inline — no separate computed needed
// In template: :disabled="props.stars < char.unlockAt"
```
[ASSUMED]

### BGM fallback in useSound.js
```js
// Before: may silently fail for unknown ids
const src = CHARACTER_BGM[id]
// After: guaranteed fallback
const src = CHARACTER_BGM[id] || CHARACTER_BGM['title']
```
[VERIFIED structure from useSound.js read]

### Reusing existing color tokens for new characters
```js
// Characters can share token names — border/bg picked per visual identity
{ id: 'yoshi',    bg: 'bg-luigi/60',     border: 'border-luigi-dark'      },  // green
{ id: 'waluigi',  bg: 'bg-rosalina/60',  border: 'border-rosalina-dark'   },  // blue/purple
{ id: 'luigi',    bg: 'bg-luigi/60',     border: 'border-luigi-dark'      },  // green
```
[VERIFIED: color tokens confirmed in style.css]

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Separate localStorage key per unlock | Compute from stars at runtime | No storage bloat, no sync bugs |
| Stars only in useMathGame | Stars passed as prop to CharacterSelect | CharacterSelect becomes unlock-aware |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Exact star thresholds (25/50/100/150/200/250) | Architecture Patterns | Planner must confirm with user or pick arbitrary values; code supports any integer |
| A2 | 6 specific Nintendo characters to add (Yoshi, Luigi, Wario, Waluigi, Birdo, etc.) | Entire phase | Character identities affect id naming, color choice, emoji, and whether MP3 assets exist |
| A3 | Locked characters shown as greyed-out (vs. hidden) | Architecture Patterns | Product decision; both are valid; greyed-out is more motivating |
| A4 | New characters use emoji-only display (no PNG images) | Architecture Patterns | If user has or creates PNG art, direct import pattern works; emoji is zero-asset path |
| A5 | BGM falls back to title theme for new characters | Architecture Patterns | Could also fall back to any existing character theme |
| A6 | Grid layout stays at 2-col mobile / adjusts for 10 chars desktop | Common Pitfalls | Layout decision needed; may require CSS change |

## Open Questions

1. **Which 6 characters?**
   - What we know: "Nintendo-inspired"; existing 4 are Peach, Daisy, Rosalina, Toad
   - What's unclear: Exact identities — Yoshi, Luigi, Wario, Waluigi, Birdo, Bowser Jr., Boo, Nabbit, Toadette are all candidates
   - Recommendation: Decide before planning; affects id names, colors, and asset needs

2. **Star thresholds?**
   - What we know: Phase goal says "unlock at star thresholds" — no specific numbers given
   - What's unclear: Target thresholds for each of the 6 new characters
   - Recommendation: Choose simple round numbers; suggest 25/50/75/100/150/200 as a starting point

3. **Will PNG images be provided for new characters?**
   - What we know: Original characters all have PNG imports; Toad has a PNG; emoji fallback exists
   - What's unclear: Whether Hector will generate/provide mascot PNGs for new characters
   - Recommendation: Plan for emoji-only first (zero asset dependency), document as easily upgradeable to PNG

4. **Grid layout for 10 characters?**
   - What we know: Current layout is `grid-cols-2 md:grid-cols-4`
   - What's unclear: Whether 10 characters should be 2 rows of 5, or a different grouping
   - Recommendation: `grid-cols-2 md:grid-cols-5` for 10 items (2 even rows on desktop)

## Environment Availability

Step 2.6: SKIPPED — This phase is purely code/data changes within the existing Vue 3 + Vite SPA. No external dependencies, CLIs, or services are required beyond what's already installed.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | vite.config.js (`test:` block) |
| Quick run command | `npm run test` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MASCOT-01 | Stars threshold gates unlock | manual-only | — | N/A |
| MASCOT-01 | No extra localStorage keys written | manual-only (inspect DevTools) | — | N/A |

**Note on test coverage:** MASCOT-01 is a CharacterSelect UI behavior. CharacterSelect.vue is a pure presentation component; existing tests cover `useMathGame.js` only (`src/composables/__tests__/useMathGame.test.js`). The unlock logic (`stars >= char.unlockAt`) is trivial inline template logic — not worth a unit test. Visual verification (human-verify checkpoint) is appropriate.

### Sampling Rate
- **Per task commit:** `npm run test` (ensure no regression in useMathGame tests)
- **Phase gate:** `npm run build` passes + human-verify character unlock visually

### Wave 0 Gaps
None — no new test files required. Existing 27-test suite covers the composable layer; unlock logic is UI-only.

## Security Domain

`security_enforcement` is enabled. Assessing ASVS applicability for this phase.

### Applicable ASVS Categories

| ASVS Category | Applies | Note |
|---------------|---------|------|
| V2 Authentication | No | No auth in this app |
| V3 Session Management | No | Character selection uses localStorage, already established pattern |
| V4 Access Control | No | Unlock is client-side cosmetic gating only; no server resources protected |
| V5 Input Validation | No | No user text input in CharacterSelect |
| V6 Cryptography | No | No secrets, no encryption |

**Security assessment:** Phase 8 has no meaningful security surface. The unlock check (`stars >= threshold`) is client-side cosmetic gating — it is trivially bypassable by editing localStorage, which is acceptable for a children's game with no server backend. No ASVS controls apply.

## Sources

### Primary (HIGH confidence)
- `src/components/CharacterSelect.vue` — character array structure, template patterns, prop model, grid layout
- `src/composables/useMathGame.js` — `stars` ref, localStorage key inventory, persistence model
- `src/composables/useSound.js` — `CHARACTER_BGM` lookup, `playThemeMusic` implementation
- `src/composables/useLevelTheme.js` — `getLevelTheme` fallback behavior, character theme structure
- `src/App.vue` — data flow from composables to components, existing prop patterns
- `src/style.css` — `@theme` token names for colors
- `package.json` — exact dependency versions

### Secondary (MEDIUM confidence)
- `ASSET-PLACEHOLDERS.md` — mascot asset directory hints; confirms `src/assets/mascots/` exists but is empty

### Tertiary (LOW confidence — [ASSUMED])
- Star threshold values (25/50/100/150/200/250) — no authoritative source; reasonable defaults based on game economy

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified from package.json, no new dependencies
- Architecture: HIGH — all patterns verified from direct codebase reads
- Pitfalls: HIGH — derived from direct code analysis (BGM lookup, Tailwind token system, grid layout)
- Thresholds/character names: LOW — product decisions not specified in REQUIREMENTS.md

**Research date:** 2026-05-16
**Valid until:** 2026-07-01 (stable Vue 3 stack, no external APIs)
