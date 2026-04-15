# Domain

Entry points: `src/core/domain/town-state.js`, `src/core/domain/resource-state.js`

This directory owns pure runtime domain helpers that operate on game state without touching DOM or storage directly.

This directory does not own:
- view updates or notifications
- save/load compatibility
- action queue orchestration
