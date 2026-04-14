# Architecture

## Current Runtime Shape

The game still runs as a script-global application loaded directly from `index.html`. Core systems, content definitions, saving, and UI are all still legacy globals.

## Stable Entry Points

- Browser app startup: `src/app/bootstrap.js` via `IdleLoopsBootstrap.bootstrapGame()`
- Predictor worker startup: `src/app/bootstrap.js` via `IdleLoopsBootstrap.bootstrapPredictorWorker()`

These two bootstrap functions are the first consolidation seam for the broader refactor. They preserve the current startup order instead of changing behavior.

## Layering Direction

- `src/app/`: startup, orchestration, top-level commands
- `src/core/`: game loop, queue runner, pure domain logic
- `src/content/`: authoring definitions and generated runtime registries
- `src/services/`: saving, predictor bridge, storage, cloud adapters
- `src/ui/`: panels, controllers, DOM-specific behavior
- `src/compat/`: migrations and legacy interop

## Non-Goals For This First Cut

- no formula or balance changes
- no save format changes
- no action id, `varName`, or story flag renames
- no framework rewrite
