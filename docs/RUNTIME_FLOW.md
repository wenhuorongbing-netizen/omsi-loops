# Runtime Flow

## Browser Boot Flow

1. `index.html` loads legacy scripts plus extracted seams.
2. `src/app/bootstrap.js` becomes the explicit startup entry.
3. `IdleLoopsBootstrap.bootstrapGame()` preserves the existing runtime order:
   - load defaults
   - wait for localization readiness
   - draw views
   - localize page
   - start game
4. Browser-side session access is exposed through `IdleLoopsBootstrap.getGameSession()`.

## Predictor Worker Boot Flow

1. `predictor-worker.js` loads the legacy runtime bundle plus predictor service seams.
2. `IdleLoopsBootstrap.bootstrapPredictorWorker()` creates a worker-safe runtime.
3. `IdleLoopsPredictorWorkerService` handles worker-side message orchestration.
4. The main thread talks to the worker through `IdleLoopsPredictorBridge`.

## Main Runtime Loop

High-level flow today:

1. `driver.js` owns the legacy browser tick shell.
2. `src/core/loop/frame-gate.js` decides whether the frame should execute.
3. `src/core/loop/game-loop.js` coordinates the loop execution shell.
4. `src/core/loop/game-speed.js`, `lag-tracker.js`, and `run-budget.js` handle timing, lag, and budget decisions.
5. `actions.js` orchestrates queue execution with extracted runner seams.
6. `src/core/runner/*` handles queue state, selection, failure analysis, formulas, and tick mutation.
7. UI refresh remains in the shell layer after runner results are known.

## Queue And Runner Flow

Queue/runtime action flow today:

1. Queue editing works against `actions.next`.
2. `src/core/queue/queue-store.js` owns structural queue mutation.
3. `src/core/runner/current-action-state.js` assembles `actions.current`.
4. `src/core/runner/next-valid-action.js` scans for the next executable action.
5. `src/core/runner/action-failure.js` classifies why an action cannot proceed.
6. `src/core/runner/action-formulas.js` owns adjusted tick and XP helper formulas.
7. `src/core/runner/action-tick.js` applies one execution step.
8. Shell code still formats some localized messages and triggers UI updates.

## State Mutation Flow

The dominant rule now is:

- core/progression/domain seams mutate state
- shell layers observe results and trigger DOM/UI work

Examples:

- `town.js` delegates state math to `src/core/domain/town-state.js` and `src/core/progression/town-progress.js`
- `driver.js` delegates resource/runtime state changes to `src/core/domain/resource-state.js` and `src/core/progression/runtime-state.js`
- `stats.js` delegates stat/skill/buff mutation to `src/core/progression/character-state.js`
- `prestige.js` delegates prestige mutation to `src/core/progression/prestige-state.js`

## Save And Load Flow

1. Browser-facing save actions still enter through `saving.js`.
2. `saving.js` coordinates payload conversion and compatibility.
3. Save/options/cloud operations route through `src/services/save/*` and `src/services/options/*`.
4. Runtime-owned collections/scalars bridge through `LegacyAppContext`.
5. Explicit progression/domain seams apply or snapshot parts of runtime state where possible.

## UI Flow

1. `views/main.view.js` remains the legacy mega-view shell.
2. Browser-only controller seams now own several composition-heavy slices:
   - cloud save UI
   - loadout controller
   - town browser
   - planner controller
   - reading shell
3. Render surfaces still mostly live in `views/main.view.js`.
4. No UI seam should own gameplay rules or persistence policy.

## Content Flow

Today:

- runtime content truth is `actionList.js`
- first shared runtime definition factories now live in `src/content/definitions/legacy-shared-actions.js` and are consumed back into `actionList.js`
- the full Beginnersville action-registration block now lives in `src/content/definitions/beginnersville-actions.js` and is consumed back into `actionList.js`
- the full Forest Path action-registration block now lives in `src/content/definitions/forest-path-actions.js` and is consumed back into `actionList.js`
- the full Merchanton action-registration block now lives in `src/content/definitions/merchanton-actions.js` and is consumed back into `actionList.js`
- the full Mt. Olympus action-registration block now lives in `src/content/definitions/olympus-actions.js` and is consumed back into `actionList.js`
- generated runtime metadata truth is `generated/action-metadata-registry.js`
- `src/content/zone-registry.js` and `src/content/action-metadata-registry.js` provide stable lookup APIs for zones and actions
- `src/content/runtime-hook-registry.js` resolves content-facing hook ids back into the live legacy action methods
- `src/content/rules/*`, `src/content/effects/*`, and `src/content/stories/*` now classify those legacy hook adapters by ownership family
- localized copy comes from XML/localization assets
- editor XML/schema is not yet the runtime content truth

Target direction:

- authoring truth: schema-backed content definitions
- runtime truth: generated registries plus explicit rule/effect ids

## Current Choke Points

These files are still major runtime choke points:

- `actionList.js`
- `saving.js`
- `views/main.view.js`

They are no longer the only places where behavior lives, but they still coordinate large surfaces.

## Post-Phase Focus

The next runtime-facing work is no longer a single seam-extraction phase. It is a sustainment track:

- unify content truth without breaking runtime behavior
- extract rule/effect/story ids behind the generated metadata layer
- continue replacing legacy hook adapters with explicit core rule/effect implementations
- start moving selected hook families out of `actionList.js` and into real extracted modules instead of adapter delegation
- keep shrinking the remaining legacy choke points
- only then consider optional tooling modernization
