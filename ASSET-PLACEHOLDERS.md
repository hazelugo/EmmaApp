# EmmaApp Asset Placeholders & Directory Map

**Purpose**: Quick reference for where to place generated assets for Phase 4 Engagement Features.

---

## 📁 Directory Structure

```
src/assets/
├── worlds/                          # World backgrounds for Story-Driven Progression
│   ├── world-1-grassland.png
│   ├── world-2-desert.png
│   ├── world-3-ice.png
│   ├── world-4-lava.png
│   ├── world-5-castle.png
│   └── world-6-space.png
│
├── minigames/                       # Mini-Games & Variety Breaks assets
│   ├── minigame-dash-icon.png
│   ├── minigame-match-icon.png
│   ├── falling-number.png
│   └── shape-icons.png
│
├── rewards/                         # Reward System & Collectibles assets
│   ├── badge-gold.png
│   ├── badge-silver.png
│   ├── badge-bronze.png
│   ├── icon-star-badge.png
│   ├── icon-speed-badge.png
│   ├── icon-streak-badge.png
│   ├── treasure-chest-closed.png
│   ├── treasure-chest-open.png
│   └── math-museum-bg.png
│
├── map/                             # Progress Visualization (Math Map) assets
│   ├── map-tile-Forest.png
│   ├── map-tile-Desert.png
│   ├── map-tile-Ice.png
│   ├── map-tile-Volcano.png
│   ├── map-tile-Castle.png
│   ├── map-tile-Space.png
│   ├── map-path-connector.png
│   ├── map-character-marker.png
│   └── achievement-star-icon.png
│
├── mascots/                         # Personalized Mascot Interactions assets
│   ├── mascot-peach-happy.png
│   ├── mascot-peach-thinking.png
│   ├── mascot-peach-celebrating.png
│   ├── mascot-daisy-happy.png
│   ├── mascot-daisy-thinking.png
│   ├── mascot-daisy-celebrating.png
│   ├── mascot-rosalina-happy.png
│   ├── mascot-rosalina-thinking.png
│   ├── mascot-rosalina-celebrating.png
│   ├── mascot-toad-happy.png
│   ├── mascot-toad-thinking.png
│   ├── mascot-toad-celebrating.png
│   ├── speech-bubble-happy.png
│   └── speech-bubble-hint.png
│
└── sfx/                             # Sound Effects & Audio assets (Music)
    ├── sfx-badge-unlock.mp3
    ├── sfx-chest-open.mp3
    ├── sfx-level-complete.mp3
    ├── sfx-mini-game-start.mp3
    ├── sfx-mini-game-success.mp3
    ├── sfx-map-navigate.mp3
    ├── music-world-1-grassland.mp3
    ├── music-world-2-desert.mp3
    ├── music-world-3-ice.mp3
    ├── music-world-4-lava.mp3
    ├── music-minigame-dash.mp3
    ├── music-museum.mp3
    │
    ├── peach/
    │   ├── voice-correct-1.mp3
    │   ├── voice-correct-2.mp3
    │   ├── voice-correct-3.mp3
    │   ├── voice-wrong-1.mp3
    │   ├── voice-wrong-2.mp3
    │   ├── voice-streak-5.mp3
    │   ├── voice-streak-10.mp3
    │   └── voice-achievement.mp3
    │
    ├── daisy/
    │   ├── voice-correct-1.mp3
    │   ├── voice-correct-2.mp3
    │   ├── voice-correct-3.mp3
    │   ├── voice-wrong-1.mp3
    │   ├── voice-wrong-2.mp3
    │   ├── voice-streak-5.mp3
    │   ├── voice-streak-10.mp3
    │   └── voice-achievement.mp3
    │
    ├── rosalina/
    │   ├── voice-correct-1.mp3
    │   ├── voice-correct-2.mp3
    │   ├── voice-correct-3.mp3
    │   ├── voice-wrong-1.mp3
    │   ├── voice-wrong-2.mp3
    │   ├── voice-streak-5.mp3
    │   ├── voice-streak-10.mp3
    │   └── voice-achievement.mp3
    │
    └── toad/
        ├── voice-correct-1.mp3
        ├── voice-correct-2.mp3
        ├── voice-correct-3.mp3
        ├── voice-wrong-1.mp3
        ├── voice-wrong-2.mp3
        ├── voice-streak-5.mp3
        ├── voice-streak-10.mp3
        └── voice-achievement.mp3
```

---

## 📋 Asset Summary by Feature

| Feature                          | Directory    | Asset Count   | Type          |
| -------------------------------- | ------------ | ------------- | ------------- |
| Story-Driven Progression         | `worlds/`    | 6             | Images (PNG)  |
| Mini-Games & Variety Breaks      | `minigames/` | 4             | Images (PNG)  |
| Reward System & Collectibles     | `rewards/`   | 9             | Images (PNG)  |
| Progress Visualization           | `map/`       | 9             | Images (PNG)  |
| Personalized Mascot Interactions | `mascots/`   | 14            | Images (PNG)  |
| Sound & Haptic Enhancements      | `sfx/`       | 38+           | Audio (MP3)   |
| **TOTAL**                        | **6 dirs**   | **~80 files** | **PNG + MP3** |

---

## 🎨 Image Specifications

| Category           | Recommended Size | Format | Notes                               |
| ------------------ | ---------------- | ------ | ----------------------------------- |
| World Backgrounds  | 1280x720px+      | PNG    | Full-screen, responsive scaling     |
| Mini-Game Icons    | 128x128px        | PNG    | High contrast, clear at small sizes |
| Badges/Icons       | 128x128px        | PNG    | Square aspect, transparent BG       |
| Treasure Chests    | 256x256px        | PNG    | Animated frames optional            |
| Map Tiles          | 128x128px        | PNG    | Consistent sizing for grid          |
| Map Markers        | 64x64px          | PNG    | Small, easily visible               |
| Mascot Expressions | 256x256px        | PNG    | Match existing mascot.png style     |
| Speech Bubbles     | 128x128px        | PNG    | Should include text space           |

---

## 🎵 Audio Specifications

| Category         | Count            | Duration          | Bitrate | Format |
| ---------------- | ---------------- | ----------------- | ------- | ------ |
| Sound Effects    | 6                | 0.5-2s            | 128kbps | MP3    |
| Background Music | 6                | 30-60s (loopable) | 128kbps | MP3    |
| Voice Lines      | 32 (8 × 4 chars) | 1-2s              | 128kbps | MP3    |

---

## ✅ Generation Checklist

**Phase 1 (Highest Priority):**

- [ ] Mascot voice lines (8 scenarios × 4 characters = 32 files)
- [ ] Badge graphics (3-4 designs)
- [ ] World backgrounds (3-4 core worlds)

**Phase 2 (Medium Priority):**

- [ ] Sound effects (6 key effects)
- [ ] Map tiles (6 world tiles)
- [ ] Mini-game icons & sprites (4 files)

**Phase 3 (Nice-to-Have):**

- [ ] Mascot expressions (12 images)
- [ ] Background music (6 tracks)
- [ ] Museum background
- [ ] Treasure chests

---

## 📝 Usage

When you have a generated asset, simply:

1. Find the corresponding subfolder above
2. Name the file exactly as listed
3. Place it in the directory
4. The app will automatically import and use it

No additional config needed — the directory structure is self-documenting!
