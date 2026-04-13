# Architecture Decisions

## ADR 1: Cutscene Video Implementation
**Context**: We need character-specific video cutscenes for level ups.
**Decision**: We will use HTML5 `<video>` tags via a Vue component overlay, prioritizing `.mp4` or `.webm` formats, and manage video source paths dynamically based on application state (selected character + current level).
**Status**: Accepted.

## Phase 1 Decisions

**Date:** 2026-04-12

### Scope
- **Video Sizing:** Fullscreen layout (optimized for mobile web).
- **Skips:** Users are allowed to skip the cutscene by clicking/tapping.

### Approach
- **Chose:** Option A (Global Overlay)
- **Reason:** For a fullscreen mobile app, a global fixed-position overlay (like `<CutsceneOverlay />` mounted at the root) is significantly more lightweight and reliable. It completely sidesteps potential z-index and overflow issues caused by mounting it deeply inside existing layout containers.
- **Placeholders:** We will build a small local script to generate actual placeholder `.mp4` video files to validate loading performance directly.

### Constraints
- Testing must prove the `<video>` element plays happily on mobile without strict user interaction blocks. Since it happens *after* answering a math question, the browser interaction requirement is met.
