# Core

Entry points: `src/core/loop/game-loop.js`, `src/core/loop/restart-coordinator.js`, `src/core/loop/offline-progress.js`, `src/core/loop/game-speed.js`, `src/core/loop/lag-tracker.js`, `src/core/loop/run-budget.js`, `src/core/loop/frame-gate.js`, `src/core/queue/queue-store.js`, `src/core/runner/current-action-state.js`, `src/core/runner/action-failure.js`, `src/core/runner/next-valid-action.js`, `src/core/runner/action-formulas.js`, `src/core/runner/action-tick.js`, `src/core/domain/town-state.js`, `src/core/domain/resource-state.js`, `src/core/progression/world-state.js`, `src/core/progression/town-progress.js`, `src/core/progression/meta-progression.js`, `src/core/progression/prestige-state.js`, `src/core/progression/buff-cap-state.js`, `src/core/progression/runtime-state.js`, `src/core/progression/character-state.js`, `src/core/progression/story-state.js`, `src/core/progression/challenge-state.js`

This directory owns runtime logic that should stay usable without DOM access. The first extracted seams here cover queue storage logic for `actions.next` and current-loop action state assembly for `actions.current`.

This directory does not own:
- page bootstrap
- save serialization shape
- DOM rendering or event wiring
