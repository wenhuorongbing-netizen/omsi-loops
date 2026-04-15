# Queue

Entry point: `src/core/queue/queue-store.js`

This directory owns queue-list storage helpers: action ids, snapshots, zone spans, move/remove/update, and closest-valid-index logic for `actions.next`.

This directory does not own:
- action execution or tick formulas
- failure attribution
- view updates or DOM state
