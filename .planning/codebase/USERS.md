# Emma's Math Quest — Research Notes

## Target Audience

### Primary User: Emma (6 years old)
- **Grade level**: Kindergarten / 1st Grade
- **Cognitive stage**: Piaget's Concrete Operational (emerging) — learns best through hands-on, visual, and interactive experiences
- **Attention span**: ~10–15 minutes of focused activity
- **Motor skills**: Developing fine motor — needs large touch targets (60px+), generous spacing
- **Reading level**: Pre-reader to early reader — UI must be icon/emoji-driven, minimal text

### Secondary User: Parent / Guardian
- Needs visibility into progress (scores, streaks)
- May want to configure difficulty
- Values screen time that is educational

---

## Educational Research

### Math Skills for Age 5–7 (Common Core K–1 Standards)

| Domain | K Standard | 1st Grade Standard |
|--------|-----------|-------------------|
| **Counting** | Count to 100 by 1s and 10s | Count to 120 |
| **Addition** | Add within 5, fluently within 10 | Add within 20, fluently within 10 |
| **Subtraction** | Subtract within 5, fluently within 10 | Subtract within 20, fluently within 10 |
| **Place Value** | Compose/decompose 11–19 | Understand tens and ones |
| **Comparison** | Compare numbers 1–10 | Compare two-digit numbers |

> [!IMPORTANT]
> Current implementation covers **addition and subtraction with operands 1–10**. This aligns with Kindergarten fluency goals. Expansion to 1st Grade standards (within 20) should be a configurable difficulty level.

### Gamification Principles (Research-Backed)

1. **Immediate Feedback** — Kids need to know right/wrong within 1 second ([Hattie, 2007](https://visible-learning.org/))
2. **Variable Ratio Reinforcement** — Random rewards (bonus stars, animations) maintain engagement longer than fixed schedules
3. **Scaffolded Difficulty** — Vygotsky's Zone of Proximal Development: problems should be ~80% success rate to maintain motivation
4. **Mastery-Based Progression** — Don't advance until a skill is solid (≥ 90% accuracy on a level)
5. **Growth Mindset Messaging** — "Try again!" > "Wrong!" ([Dweck, 2006](https://mindsetworks.com/))

### Competitor / Inspiration Analysis

| App | Strengths | Weaknesses | Takeaway |
|-----|-----------|------------|----------|
| **Khan Academy Kids** | Adaptive difficulty, rich curriculum | Complex, overwhelming for youngest users | Keep it simple, one thing at a time |
| **Todo Math** | Beautiful UI, daily challenges | Subscription model, heavy app | Free and lightweight wins |
| **Moose Math** | Exploration-based, narrative | No focused drill mode | Drill + reward loop is effective |
| **Minecraft Education** | Beloved aesthetic, exploration | Not math-focused | Borrow the visual language, not the complexity |
| **Prodigy Math** | RPG elements, engaging | Too game-heavy, distracting | Balance fun and focus |

---

## Design Research

### Color Psychology for Children
- **Green** — Associated with safety, nature, "go" signals → Primary action color ✅
- **Purple** — Creativity, magic, special → Highlight/accent color ✅
- **Gold/Yellow** — Achievement, warmth, happiness → Reward/score color ✅
- **Red** — Alert, stop, correction → Error/backspace only (used sparingly) ✅
- **Brown/Earth** — Grounding, comfort, familiar (Minecraft dirt!) → Background/surface ✅

> [!TIP]
> Avoid blue as a primary — it reads as "cold" and "passive" for this age group. Our current palette avoids this correctly.

### Typography for Early Readers
- **Sans-serif fonts only** — Serif fonts confuse letter recognition
- **Minimum 24px** for body text, **48px+** for numbers in problems
- **High contrast** — WCAG AAA (7:1) where possible
- **Outfit font** — Geometric, friendly, excellent numeral legibility ✅

### Touch Target Guidelines
| Source | Minimum Touch Target |
|--------|---------------------|
| Apple HIG | 44×44 pt |
| Material Design | 48×48 dp |
| WCAG 2.2 (AAA) | 44×44 CSS px |
| **Our standard** | **60×60 px** (exceeds all guidelines) ✅ |

---

## Technical Research

### Stack Decision

| Choice | Rationale |
|--------|-----------|
| **Vue 3 (Composition API)** | Simpler mental model than React for a focused app; `<script setup>` is concise |
| **Vite** | Fastest dev experience, native ESM, hot reload |
| **Tailwind CSS v4** | `@theme` tokens keep design system in CSS, not scattered in configs |
| **No router needed** | Single-screen app (for now) — add Vue Router if/when we add levels/settings |
| **No state management lib** | `ref`/`computed` in App.vue sufficient for current scope; consider Pinia if state grows |

### Performance Considerations
- **Target device**: Budget Android tablet or hand-me-down iPhone
- **Bundle size goal**: < 100KB gzipped (currently well under)
- **No heavy dependencies** — zero runtime deps beyond Vue
- **Preload font** to avoid FOUT on slow connections

### Accessibility Checklist (WCAG 2.2 Level AA+)
- [x] All interactive elements ≥ 60px touch target
- [x] No text below 24px
- [x] `aria-label` on icon-only buttons (backspace, submit)
- [x] Semantic HTML (`header`, `nav`, `section`, `aside`)
- [x] Color is not the only indicator (text + color for feedback)
- [ ] Keyboard navigation support (future)
- [ ] Screen reader testing (future)
- [ ] Reduced motion media query (future)

---

## Open Research Questions

1. **Sound effects** — Should we add audio feedback? (Correct ding, wrong buzz, button click). Research says yes for engagement, but parent control is essential (mute toggle).
2. **Haptic feedback** — `navigator.vibrate()` on wrong answers? Engaging but battery cost.
3. **Session length** — Should we enforce a "take a break" after N minutes?
4. **Data persistence** — localStorage for progress? Or keep it session-only for now?
5. **Offline support** — PWA / service worker for use without internet?
