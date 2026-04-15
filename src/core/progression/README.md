# Progression

Entry points: `src/core/progression/world-state.js`, `src/core/progression/town-progress.js`, `src/core/progression/meta-progression.js`, `src/core/progression/prestige-state.js`, `src/core/progression/buff-cap-state.js`, `src/core/progression/runtime-state.js`, `src/core/progression/character-state.js`, `src/core/progression/story-state.js`, `src/core/progression/challenge-state.js`

This directory owns progression/domain helpers that mutate town-facing state, runtime carry-over state, story-state collections, and cross-loop progression state without touching DOM updates directly.

This directory does not own:
- action queue execution
- save serialization
- view rendering or localization
