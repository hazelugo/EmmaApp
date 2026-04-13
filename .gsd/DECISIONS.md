# Architecture Decisions

## ADR 1: Cutscene Video Implementation
**Context**: We need character-specific video cutscenes for level ups.
**Decision**: We will use HTML5 `<video>` tags via a Vue component overlay, prioritizing `.mp4` or `.webm` formats, and manage video source paths dynamically based on application state (selected character + current level).
**Status**: Accepted.
