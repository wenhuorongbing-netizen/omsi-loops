# Save Schema

## Scope

This document describes the save compatibility boundary that exists today, not a future idealized save system.

The game still supports legacy save payloads and still routes full compatibility through `saving.js`. What changed during refactor is that many runtime-owned objects now bridge through explicit state seams and services before they are serialized or re-applied.

## Save Boundary Today

Primary compatibility boundary:

- `saving.js`
  - `doSave()`
  - `processSave()`
  - `doLoad()`

Service seams around it:

- `src/services/save/save-service.js`
- `src/services/save/save-migrations.js`
- `src/services/save/cloud-save-service.js`
- `src/services/options/options-store.js`

App/runtime seam under it:

- `src/app/app-context.js`
- `src/app/game-session.js`
- `IdleLoopsAppContext.getLegacyAppContext()`

## Save Payload Layers

The runtime effectively has four layers of save-relevant data:

1. Scalar globals
   - Example: totals, counters, timers, story max, investment counters.
   - These now bridge through `LegacyAppContext.captureGlobalState()/applyGlobalState()`.
2. Collection globals
   - Example: `townsUnlocked`, `completedActions`, `challengeSave`, `storyFlags`, `storyVars`, `totals`, `prestigeValues`, `buffCaps`.
   - These now bridge through `captureCollectionState()/applyCollectionState()`.
3. Registered object graphs
   - `Data.registerAll(...)` still matters for legacy runtime objects.
   - This has not been fully replaced yet.
4. Browser persistence shells
   - Save slots, option storage, cloud handoff, import/export encoding.
   - These now have service seams under `src/services/*`.

## Current Runtime-Owned State Seams

The following groups now have explicit mutation/apply helpers and should no longer be open-coded in new save paths:

- world progression: `src/core/progression/world-state.js`
- town progression: `src/core/progression/town-progress.js`
- runtime carry-over: `src/core/progression/runtime-state.js`
- character progression: `src/core/progression/character-state.js`
- story state: `src/core/progression/story-state.js`
- challenge state: `src/core/progression/challenge-state.js`
- prestige values: `src/core/progression/prestige-state.js`
- buff caps: `src/core/progression/buff-cap-state.js`
- resources: `src/core/domain/resource-state.js`

## Save Compatibility Rules

- Old save fields remain valid unless a migration explicitly rewrites them.
- New code may add fields, but must not silently change existing semantics.
- Collection/object apply must prefer in-place mutation where the legacy runtime expects object identity to survive.
- `saving.js` remains the place where full-payload import/export compatibility is coordinated.
- New save behavior should go through the service seams first, not directly to `localStorage` or Google adapters.

## Fixture Format

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

This format intentionally mirrors browser boot behavior rather than inventing a separate test-only save container.

## Active Regression Fixtures

Current active fixtures:

- `new-game`
- `forest-midgame`
- `merchanton-midgame`
- `valhalla-startington-branch`
- `endgame`

Fixture metadata lives in `tests/fixtures/saves/manifest.json`.

## Baseline Commands

- `npm run smoke`
- `npm run baseline:update`
- `npm run baseline:check`
- `npm run regression`

Baselines are generated from loaded runtime state, not by parsing save payloads directly.

## What This Schema Does Not Mean

- It does not mean the save format is clean or final.
- It does not mean `saving.js` is already small.
- It does not mean `Data.registerAll(...)` has been removed.
- It does mean there is now an explicit place to hook future save refactors without reintroducing open-coded global mutation.
