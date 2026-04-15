# Runner

Entry points: `src/core/runner/current-action-state.js`, `src/core/runner/action-failure.js`, `src/core/runner/next-valid-action.js`, `src/core/runner/action-formulas.js`, `src/core/runner/action-tick.js`

This directory owns current-loop runtime helpers: creating `actions.current` entries from the queue, resetting per-loop action state, calculating remaining ticks, classifying why an action cannot currently run, scanning forward to the next runnable action, applying tick-step execution updates, and computing action timing/xp formulas.

This directory does not own:
- queue ordering and zone-span logic
- action execution formulas in `tick()`
- view updates or DOM state
