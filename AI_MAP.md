# AI Map

## Fast Answers

- App bootstrap: `src/app/bootstrap.js`
- Legacy binding bridge: `src/app/legacy-globals.js`
- Explicit app context scaffold: `src/app/app-context.js`
- Explicit session scaffold: `src/app/game-session.js`
- Browser session entry: `IdleLoopsBootstrap.getGameSession()`
- Save-facing global bridge: `IdleLoopsAppContext.getLegacyAppContext()`
- Runtime content truth today: `actionList.js`
- Save compatibility today: `saving.js`
- Predictor worker entry: `predictor-worker.js`
- Smoke regression entry: `tools/run-smoke.mjs`
- Fixture/baseline entry: `tests/fixtures/saves/manifest.json`

## Current Boundaries

- `src/app/*` owns startup and explicit access points into the legacy global runtime.
- `actionList.js` is still the live runtime action registry.
- `saving.js` is still the save/load compatibility boundary, but core save scalars now bridge through `LegacyAppContext`.
- `views/main.view.js` is still the dominant UI composition layer.

## Not Moved Yet

- action rules and effects are not in `src/core/` yet
- save migrations are not split from `saving.js` yet
- XML/editor content is not the runtime source of truth yet
- predictor still depends on legacy game scripts
