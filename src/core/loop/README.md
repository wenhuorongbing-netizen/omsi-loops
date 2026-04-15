# Loop

Entry points: `src/core/loop/game-loop.js`, `src/core/loop/restart-coordinator.js`, `src/core/loop/offline-progress.js`, `src/core/loop/game-speed.js`, `src/core/loop/lag-tracker.js`, `src/core/loop/run-budget.js`, `src/core/loop/frame-gate.js`

This directory owns runtime loop orchestration helpers: converting realtime backlog into burnable mana budget, consuming that budget until the current frame deadline, coordinating loop completion/restart decisions, resolving offline-time / bonus-speed state changes, and calculating speed / lag / frame-budget state that `driver.js` uses while keeping DOM updates outside core.

This directory does not own:
- queue/current action state
- action formulas or failure analysis
- view updates or DOM state
