# Phase 1: Star Shop - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 01-star-shop
**Areas discussed:** Shop entry point, Item layout & cards, Color variant approach, Post-purchase UX

---

## Shop Entry Point

| Option | Description | Selected |
|--------|-------------|----------|
| ScoreHeader — next to coin count | Shop icon in top bar, emits @open-shop to App.vue | ✓ |
| Floating action button | Fixed bottom-right button, always visible | |
| Tap on the coin/star count | Star count becomes tappable to open shop | |

**User's choice:** ScoreHeader — next to coin count
**Notes:** Natural pairing with coin display; reuses existing button row.

---

## Item Layout & Cards

| Option | Description | Selected |
|--------|-------------|----------|
| Grid of cards — 2 per row | Cards with preview, name, price, state | ✓ |
| Horizontal scroll row | Single scrollable row | |
| Vertical list | One item per row with larger previews | |

**User's choice:** Grid of cards — 2 per row
**Notes:** Familiar from CharacterSelect; large enough cards for young players.

---

## Color Variant Approach

| Option | Description | Selected |
|--------|-------------|----------|
| CSS filter (hue-rotate) on existing PNGs | No new assets, CSS only | |
| Separate PNG files per variant | Full control, requires image assets | ✓ |
| CSS color overlay with blend mode | Intermediate complexity | |

**User's choice:** Separate PNG files per variant
**Notes:** Placeholder PNGs acceptable for this phase; 5 variants × 4 characters = 20 items.

### Asset handling follow-up

| Option | Selected |
|--------|----------|
| Use colored placeholder PNGs for now | ✓ |
| Scope includes generating real variants | |
| You decide | |

### Variant count follow-up

| Option | Selected |
|--------|----------|
| 5 variants (one per item slot) | |
| 5 variants × all 4 characters | ✓ |
| 5 variants for selected character only | |

---

## Post-Purchase UX

| Option | Description | Selected |
|--------|-------------|----------|
| Immediately equip + 10s undo toast inside shop | Optimistic purchase, toast in overlay | ✓ |
| Show undo toast on game screen, close shop | Shop closes on purchase | |
| Confirm first, then equip | Two-step with confirmation | |

**User's choice:** Immediately equip + show 10s undo toast inside the shop
**Notes:** No confirmation dialog — undo window covers that need.

### Shop close behavior

| Option | Selected |
|--------|----------|
| Stay open | ✓ |
| Close automatically after purchase | |

---

## Claude's Discretion

- Shop overlay visual design (colors, layout chrome)
- Star prices per variant
- Placeholder PNG generation method
- Equip animation

## Deferred Ideas

None.
