# Feature Spec: Character Themes & Victory Screens

## Overview

Two interconnected features:
1. **Background Music** — Each character gets a unique looping theme song that plays during gameplay, synthesized via Web Audio API
2. **Character Victory Screens** — Each character gets a unique "Beat World" celebration screen instead of the current Peach-only flagpole scene

---

## Current State (What Exists)

### Characters (defined in `CharacterSelect.vue` lines 11-47)
| ID | Name | Asset | Color Tokens |
|----|------|-------|-------------|
| `peach` | Princess Peach | `mascot.png` | `peach`, `peach-dark`, `peach-light` |
| `daisy` | Princess Daisy | `daisy.png` | `daisy`, `daisy-dark`, `daisy-light` |
| `rosalina` | Rosalina | `rosalina.png` | `rosalina`, `rosalina-dark` |
| `toad` | Toad | `toad.png` | `mario-red`, `mario-red-dark` |

### Current LevelUpModal Problems
- **Hardcoded Peach**: Line 4 imports `mascotUrl` (Peach) directly
- **Hardcoded castle**: Uses `castle.png` for all characters
- **No character prop**: The component (line 9-12) only accepts `show` and `stars`
- **Generic text**: "Princess Mathematician" and "LEVEL COMPLETE!" regardless of character

### App.vue Integration Gap
- Line 102-107: `<LevelUpModal>` does NOT receive `selectedCharacter` as a prop
- `selectedCharacter` is a `ref` (line 27) set by `onSelectCharacter` (line 29)

---

## Part 1: Character Background Music

### Goal
Each character plays a distinct looping background melody during gameplay. The music is synthesized (Web Audio API) — no MP3 files needed. Music starts after character selection and loops until muted or the app closes.

### Design: Music Personalities

Each theme should be ~8 bars, looping, using the existing `playTone()` function pattern from `useSound.js`. Use different waveforms and tempos to differentiate:

#### 🍑 Princess Peach — "Royal Garden Waltz"
- **Tempo**: 100 BPM (graceful, 3/4 time feel)
- **Waveform**: `triangle` (soft, warm)
- **Key**: C Major
- **Feel**: Gentle, musical-box waltz. Light and airy.
- **Notes pattern** (melody): `C5 E5 G5 | E5 C5 G4 | A4 C5 E5 | D5 G4 - |` (repeat)
- **Frequencies**: C5=523.25, E5=659.25, G5=783.99, A4=440, G4=392, D5=587.33

#### 🌼 Princess Daisy — "Sunshine Sprint"
- **Tempo**: 130 BPM (upbeat, bouncy)
- **Waveform**: `square` (punchy, 8-bit)
- **Key**: G Major
- **Feel**: Energetic, sporty, adventurous. Like a Mario Kart track.
- **Notes pattern**: `G4 B4 D5 G5 | D5 B4 G4 - | E5 D5 C5 B4 | A4 B4 D5 - |` (repeat)
- **Frequencies**: G4=392, B4=493.88, D5=587.33, G5=783.99, E5=659.25, C5=523.25, A4=440

#### ✨ Rosalina — "Cosmic Lullaby"
- **Tempo**: 80 BPM (slow, dreamy)
- **Waveform**: `sine` (pure, ethereal)
- **Key**: Eb Major (sounds spacey/mysterious)
- **Feel**: Floaty, celestial, like drifting through space. Gentle reverb feel via overlapping long notes.
- **Notes pattern**: `Eb4 G4 Bb4 | Eb5 - Bb4 | Ab4 G4 Eb4 | F4 - - |` (repeat)
- **Frequencies**: Eb4=311.13, G4=392, Bb4=466.16, Eb5=622.25, Ab4=415.30, F4=349.23

#### 🍄 Toad — "Mushroom Bounce"
- **Tempo**: 150 BPM (fast, hyperactive)
- **Waveform**: `square` (chiptune)
- **Key**: C Major
- **Feel**: Quirky, bouncy, cartoonish. High-pitched. Like classic NES menu music.
- **Notes pattern**: `C5 C5 E5 G5 | G5 E5 C5 - | F5 E5 D5 C5 | G4 C5 - - |` (repeat)
- **Frequencies**: C5=523.25, E5=659.25, G5=783.99, F5=698.46, D5=587.33, G4=392

### Implementation

#### [NEW] `src/composables/useBackgroundMusic.js`

```js
import { ref, watch } from 'vue'

const isPlaying = ref(false)
let audioCtx = null
let loopInterval = null

// Each character's theme definition
const THEMES = {
  peach: {
    tempo: 100,       // BPM
    wave: 'triangle',
    volume: 0.08,     // Background music should be QUIET
    noteDuration: 0.25,
    notes: [523.25, 659.25, 783.99, 659.25, 523.25, 392, 440, 523.25, 659.25, 587.33, 392, 0],
    // 0 = rest
  },
  daisy: {
    tempo: 130,
    wave: 'square',
    volume: 0.06,
    noteDuration: 0.18,
    notes: [392, 493.88, 587.33, 783.99, 587.33, 493.88, 392, 0, 659.25, 587.33, 523.25, 493.88, 440, 493.88, 587.33, 0],
  },
  rosalina: {
    tempo: 80,
    wave: 'sine',
    volume: 0.07,
    noteDuration: 0.35,
    notes: [311.13, 392, 466.16, 622.25, 0, 466.16, 415.30, 392, 311.13, 349.23, 0, 0],
  },
  toad: {
    tempo: 150,
    wave: 'square',
    volume: 0.05,
    noteDuration: 0.12,
    notes: [523.25, 523.25, 659.25, 783.99, 783.99, 659.25, 523.25, 0, 698.46, 659.25, 587.33, 523.25, 392, 523.25, 0, 0],
  },
}

export function useBackgroundMusic(isMuted) {
  function getContext() { /* same pattern as useSound.js */ }

  function playNote(freq, wave, duration, volume) {
    if (freq === 0 || isMuted.value) return // 0 = rest
    // Use playTone pattern from useSound.js
  }

  function startMusic(characterId) {
    stopMusic()
    const theme = THEMES[characterId]
    if (!theme) return

    let noteIndex = 0
    const msPerBeat = 60000 / theme.tempo

    // Play the first note immediately, then loop
    loopInterval = setInterval(() => {
      if (isMuted.value) return
      const freq = theme.notes[noteIndex % theme.notes.length]
      playNote(freq, theme.wave, theme.noteDuration, theme.volume)
      noteIndex++
    }, msPerBeat)

    isPlaying.value = true
  }

  function stopMusic() {
    if (loopInterval) clearInterval(loopInterval)
    loopInterval = null
    isPlaying.value = false
  }

  // Auto-stop when muted
  watch(isMuted, (muted) => {
    // Don't stop the interval — just skip notes (so it resumes on unmute in sync)
  })

  return { isPlaying, startMusic, stopMusic, THEMES }
}
```

#### [MODIFY] `src/App.vue`

**Import and wire up** (in `<script setup>`):
```js
import { useBackgroundMusic } from './composables/useBackgroundMusic.js'
const { startMusic, stopMusic } = useBackgroundMusic(isMuted)
```

**Start music on character select** — update `onSelectCharacter`:
```js
function onSelectCharacter(char) {
  selectedCharacter.value = char
  playTap()
  startMusic(char.id)  // ← ADD THIS
}
```

**Stop music on level-up modal** (optional, so the victory jingle plays clean):
```js
function closeLevelUp() {
  showLevelUp.value = false
  generateProblem()
  startMusic(selectedCharacter.value.id) // resume after victory
}
```

In the `onSubmit` correct branch where `showLevelUp` triggers, add:
```js
if (showLevelUp.value) {
  stopMusic() // pause during victory scene
}
```

### Key Constraints
- Volume must be **very low** (0.05–0.08) — this is background ambiance, not the foreground
- Music must **respect the mute toggle** — skip notes when `isMuted` is true
- Music must **not interfere** with SFX (correct/wrong/tap sounds are foreground)
- The `setInterval` approach is simple but has timing drift — this is fine for a children's game. A more precise approach would use `AudioContext.currentTime` scheduling, but that's overkill here.

---

## Part 2: Character Victory Cutscenes (Video-Based)

### Goal
When the player beats a world (every 10 stars), play a **pre-made video cutscene** as the fullscreen background, with the score/text/button overlaid on top via Vue. This replaces the current CSS-only flagpole scene and produces a dramatically more polished result.

### Why Video Instead of CSS
- **Visual quality**: A 6-year-old will be far more engaged by a real animation than CSS shapes
- **Code simplicity**: The current Peach-only scene is 453 lines. Four CSS scenes would be ~1,500 lines of brittle scoped CSS. Video approach = ~50 lines of code total.
- **Maintainability**: Update a visual by swapping a file, not debugging keyframe timing
- **Consistency**: Looks identical on every device and browser

### Architecture: Video Background + Vue Overlay

```
┌───────────────────────────────────┐
│  ▶ VIDEO (fullscreen, muted)      │  ← <video> element, absolutely positioned
│                                   │
│     ┌───────────────────────┐     │
│     │   LEVEL COMPLETE!     │     │  ← Vue-rendered overlay (dynamic text)
│     │   Princess Mathematician │  │
│     │   ⭐ Emma ⭐           │     │
│     │   🪙 30 COINS          │     │  ← Dynamic star count from props
│     │                       │     │
│     │   [ NEXT WORLD → ]    │     │  ← Button emits @close
│     └───────────────────────┘     │
│                                   │
└───────────────────────────────────┘
```

The video handles all visual spectacle. Vue handles all dynamic content. Clean separation.

### Video Asset Specifications

#### Format & Sizing
- **Format**: WebM (VP9) primary, MP4 (H.264) fallback
- **Resolution**: 720×1280 (portrait 9:16, matches mobile viewport)
- **Duration**: 5–8 seconds
- **File size target**: < 2MB each (4 videos ≈ 6-8MB total)
- **Loop**: Either seamlessly loopable, or hold on a clean final frame
- **Audio**: None — video must be muted. Music comes from `useBackgroundMusic` or `useSound`

#### Asset Prompts for Cutscene Tool

> [!IMPORTANT]
> These are suggested prompts for whatever tool is creating the cutscene videos. Adjust to match the tool's capabilities.

**🍑 Peach — "Castle Celebration"**
```
A pixel-art animated cutscene for a children's math game. Night sky with
twinkling stars over a pink Mushroom Kingdom castle. Fireworks burst in
gold, pink, and green. A green flagpole with a flag sliding down. Princess
Peach character celebrates at the bottom. Nintendo/Mario inspired style.
Portrait orientation (720x1280). 6 seconds. Vibrant, celebratory mood.
```

**🌼 Daisy — "Stadium Victory"**
```
A pixel-art animated cutscene for a children's math game. A bright sunset
stadium scene with a winner's podium (gold/silver/bronze). Orange and gold
confetti rains down. A golden trophy descends from above and lands on the
podium. Crowd silhouettes cheer in the foreground. Mario sports game
inspired style. Portrait orientation (720x1280). 6 seconds. Triumphant,
energetic mood.
```

**✨ Rosalina — "Galaxy Observatory"**
```
A pixel-art animated cutscene for a children's math game. Deep space scene
with swirling galaxies and nebulae in blues, purples, and silvers. Shooting
stars streak across the screen with glowing trails. A cosmic observatory
dome glows in the center. Stars orbit gently. Mario Galaxy inspired style.
Portrait orientation (720x1280). 6 seconds. Dreamy, celestial, magical mood.
```

**🍄 Toad — "Mushroom House Party"**
```
A pixel-art animated cutscene for a children's math game. A bright blue
daytime scene with a large Toad House (mushroom-cap red roof with white
polka dots). The door bursts open and rainbow confetti explodes out.
Mushrooms bounce around playfully. Green hills in the background. Classic
Mario world style. Portrait orientation (720x1280). 6 seconds. Fun,
bouncy, party mood.
```

#### File Naming & Location
```
public/
└── cutscenes/
    ├── peach-victory.webm
    ├── peach-victory.mp4      (fallback)
    ├── daisy-victory.webm
    ├── daisy-victory.mp4
    ├── rosalina-victory.webm
    ├── rosalina-victory.mp4
    ├── toad-victory.webm
    └── toad-victory.mp4
```

Files go in `public/` (not `src/assets/`) so they're served as static files and not processed by Vite's bundler. This keeps bundle size small and allows browser-native video streaming.

### Implementation

#### [MODIFY] `src/components/LevelUpModal.vue`

This is a **major simplification** of the component.

**Step 1: Add character prop and scene config**

Replace the props (line 9-12):
```js
const props = defineProps({
  show: { type: Boolean, default: false },
  stars: { type: Number, default: 0 },
  character: { type: Object, default: null },  // ← ADD
})
```

Add scene configuration:
```js
const scenes = {
  peach: {
    videoWebm: '/cutscenes/peach-victory.webm',
    videoMp4:  '/cutscenes/peach-victory.mp4',
    title: 'LEVEL COMPLETE!',
    subtitle: 'Princess Mathematician',
    button: 'NEXT WORLD →',
    confettiColors: ['#FFD700', '#E52521', '#4CAF50', '#F8A5C2', '#80D8FF'],
    fallbackBg: 'linear-gradient(180deg, #1a1a4e 0%, #2a2a7a 30%, #4a3a9a 60%, #3a2a6a 100%)',
  },
  daisy: {
    videoWebm: '/cutscenes/daisy-victory.webm',
    videoMp4:  '/cutscenes/daisy-victory.mp4',
    title: 'CHAMPION!',
    subtitle: 'Sports Star',
    button: 'NEXT MATCH →',
    confettiColors: ['#F5A623', '#FFD700', '#FF6B35', '#FFA07A', '#FFB300'],
    fallbackBg: 'linear-gradient(180deg, #FF6B35 0%, #FFA07A 40%, #FFD700 100%)',
  },
  rosalina: {
    videoWebm: '/cutscenes/rosalina-victory.webm',
    videoMp4:  '/cutscenes/rosalina-victory.mp4',
    title: 'STELLAR!',
    subtitle: 'Cosmic Scholar',
    button: 'NEXT GALAXY →',
    confettiColors: ['#80D8FF', '#FFFFFF', '#CE93D8', '#E1BEE7', '#B3E5FC'],
    fallbackBg: 'radial-gradient(ellipse at 50% 30%, #1a1a4e 0%, #0a0a2e 40%, #000011 100%)',
  },
  toad: {
    videoWebm: '/cutscenes/toad-victory.webm',
    videoMp4:  '/cutscenes/toad-victory.mp4',
    title: 'WAHOO!',
    subtitle: 'Mushroom Master',
    button: 'NEXT HOUSE →',
    confettiColors: ['#E53935', '#FFD700', '#4CAF50', '#F8A5C2', '#FFB300'],
    fallbackBg: 'linear-gradient(180deg, #4A90D9 0%, #87CEEB 40%, #7ADB7E 100%)',
  },
}

const scene = computed(() => {
  const id = props.character?.id || 'peach'
  return scenes[id]
})
```

**Step 2: Replace the template's background with a `<video>` element**

Remove ALL of the CSS-drawn scene content (the flagpole, castle, flag, peach-slider, ground, etc.) and replace with:

```html
<Transition name="scene-fade">
  <div v-if="show" class="fixed inset-0 z-[100] overflow-hidden">

    <!-- ═══ Video Background ═══ -->
    <video
      ref="videoRef"
      class="absolute inset-0 w-full h-full object-cover"
      :style="{ background: scene.fallbackBg }"
      autoplay
      muted
      playsinline
      loop
      :key="scene.videoWebm"
    >
      <source :src="scene.videoWebm" type="video/webm" />
      <source :src="scene.videoMp4"  type="video/mp4" />
    </video>

    <!-- ═══ Text & Button Overlay ═══ -->
    <div class="text-overlay">
      <div v-if="showText" class="text-content">
        <h2 class="title-text">{{ scene.title }}</h2>
        <p class="sub-text">
          {{ scene.subtitle }}<br/>
          <span class="emma-line">
            <img :src="starSrc" alt="star" class="w-7 h-7 mx-1 inline-block star-bounce" style="image-rendering: pixelated;" />
            <span class="emma-name">Emma</span>
            <img :src="starSrc" alt="star" class="w-7 h-7 mx-1 inline-block star-bounce" style="image-rendering: pixelated;" />
          </span>
        </p>

        <div class="coin-box">
          <img :src="marioCoinSrc" alt="coin" class="w-8 h-8 modal-coin-anim" style="image-rendering: pixelated;" />
          <span class="coin-num">{{ stars }}</span>
          <span class="coin-lbl">COINS</span>
        </div>
      </div>

      <button v-if="showButton" @click="emit('close')" class="continue-btn">
        {{ scene.button }}
      </button>
    </div>

  </div>
</Transition>
```

**Step 3: Simplify `startScene()`**

The scene timing stays the same, but you can remove the flagpole/castle animation timers (`flagDown`, `sceneReady`). The video handles all visual choreography. Keep only:

```js
function startScene () {
  showText.value = false
  showFireworks.value = false
  showButton.value = false
  clearTimers()

  // Confetti still overlays on top of the video
  timers.push(setTimeout(() => {
    showFireworks.value = true
    fireFireworks()
  }, 2200))
  timers.push(setTimeout(() => { showText.value = true }, 2600))
  timers.push(setTimeout(() => { showButton.value = true }, 3400))
}
```

**Step 4: Use character-specific confetti colors in `fireFireworks()`**

Change line 47 from hardcoded `marioColors` to:
```js
function fireFireworks () {
  const colors = scene.value.confettiColors  // ← dynamic
  // ... rest unchanged, just replace marioColors with colors
}
```

**Step 5: Remove dead CSS**

Delete all scoped CSS that was only used for the flagpole/castle scene:
- `.flagpole-sky`, `.ground-bricks`, `.ground-fill`
- `.castle-wrap`, `.castle-visible`, `.castle-img`
- `.flagpole-wrap`, `.pole-visible`, `.pole-green`, `.pole-ball-gold`
- `.flag-slider`, `.flag-descend`, `.flag-shape`, `@keyframes flag-flutter`
- `.peach-slider`, `.peach-slide-down`, `.peach-img`, `@keyframes peach-wiggle`

Keep: `.text-overlay`, `.text-content`, `.title-text`, `.sub-text`, `.emma-line`, `.emma-name`, `.coin-box`, `.coin-num`, `.coin-lbl`, `.continue-btn`, `.fireworks-layer`, `.fw`, `.scene-fade-*`

**Step 6: Remove dead imports**

Remove from the `<script setup>`:
```js
// DELETE these:
import mascotUrl from '../assets/mascot.png'   // line 4
import castleSrc from '../assets/castle.png'     // line 6
```

Keep `marioCoinSrc` and `starSrc` — they're still used in the text overlay.

**Step 7: Add a ref for the video element (for replay control)**

```js
const videoRef = ref(null)

// When the scene starts, restart the video
watch(() => props.show, (val) => {
  if (val) {
    startScene()
    // Restart video from beginning
    nextTick(() => {
      if (videoRef.value) {
        videoRef.value.currentTime = 0
        videoRef.value.play().catch(() => {})
      }
    })
  } else {
    clearTimers()
  }
})
```

#### [MODIFY] `src/App.vue`

Pass the selected character to LevelUpModal (line 102-107):

```html
<LevelUpModal 
  :show="showLevelUp" 
  :stars="stars" 
  :character="selectedCharacter"
  @close="closeLevelUp" 
/>
```

That's it for App.vue — just one added `:character` prop.

### Video Preloading Strategy

After character selection, preload that character's cutscene in the background so it's ready when they hit a milestone.

#### [MODIFY] `src/App.vue`

Add preloading in `onSelectCharacter`:

```js
function onSelectCharacter(char) {
  selectedCharacter.value = char
  playTap()
  startMusic(char.id)

  // Preload victory cutscene for this character
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'video'
  link.href = `/cutscenes/${char.id}-victory.webm`
  document.head.appendChild(link)
}
```

### Fallback Handling

If the video fails to load (offline, unsupported format, etc.), the `fallbackBg` gradient set via `:style="{ background: scene.fallbackBg }"` on the `<video>` element ensures the scene still has a themed backdrop. The text/confetti/button overlay works regardless.

### Net Result

**Before**: 453 lines of complex scoped CSS/HTML for ONE character's scene.
**After**: ~80 lines of template + config for ALL FOUR characters, with dramatically better visuals.

---

## Implementation Order

1. **Generate the 4 cutscene videos** using your animation tool (use the prompts above)
2. **Place videos** in `public/cutscenes/` (WebM + MP4 fallback for each)
3. **Refactor LevelUpModal** — add character prop, scene config, video element, remove CSS scene code
4. **Wire App.vue** — pass `:character="selectedCharacter"` to LevelUpModal, add preloading
5. **Test** each character's victory screen
6. **Then implement Part 1** (Background Music) — it's independent

---

## Acceptance Criteria

### Background Music
- [ ] Each character plays a distinct looping melody after selection
- [ ] Music volume is noticeably lower than SFX (≤ 0.08 gain)
- [ ] Music respects the mute toggle
- [ ] Music stops during victory screen
- [ ] Music resumes after dismissing victory screen
- [ ] No audio glitches on character re-select

### Victory Screen Cutscenes
- [ ] LevelUpModal receives and uses the `character` prop
- [ ] Video plays fullscreen as background when victory triggers
- [ ] Each character has a unique video: Peach (castle), Daisy (stadium), Rosalina (galaxy), Toad (mushroom house)
- [ ] Text overlay displays character-specific: title, subtitle, button text
- [ ] Star/coin count displays correctly over the video
- [ ] canvas-confetti fires with character-specific colors over the video
- [ ] Timing structure preserved: video starts → confetti at 2.2s → text at 2.6s → button at 3.4s
- [ ] `fallbackBg` gradient shows if video fails to load
- [ ] Videos are `muted`, `playsinline`, `autoplay`, `loop`
- [ ] Video restarts from beginning on each trigger (not mid-playback from last time)
- [ ] Preloading works after character selection
- [ ] Dead CSS/imports from old flagpole scene are removed
- [ ] Total video asset size ≤ 8MB across all four characters

