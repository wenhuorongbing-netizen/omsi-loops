# Save Schema

## Runtime Compatibility Boundary

Legacy save compatibility still lives in `saving.js`, especially:

- `doSave()`: runtime object graph to save payload
- `processSave()`: import entry point for exported saves
- `doLoad()`: save payload back into runtime globals

## Test Fixture Format

Regression fixtures live in `tests/fixtures/saves/` and use a local-storage wrapper:

```json
{
  "name": "new-game",
  "description": "Fresh boot with empty saves.",
  "localStorage": {
    "idleLoops1": "",
    "idleLoopsChallenge": ""
  }
}
```

This keeps fixture loading aligned with how the game actually boots.

## Baseline Metrics

Each active fixture can have a committed runtime baseline JSON next to it. Baselines are generated from the loaded game state, not by parsing the save payload directly.

Current commands:

- `npm run baseline:update`
- `npm run baseline:check`
- `npm run smoke`

## Current Phase 0 Fixture Plan

- `new-game`: active
- `forest-midgame`: planned
- `merchanton-midgame`: planned
- `valhalla-startington-branch`: planned
- `endgame`: planned
