# Architecture

## Current Phase Snapshot

- `Phase 0` complete: fixtures, smoke, baselines, screenshots
- `Phase 1` complete: shared bootstrap entry for browser and predictor worker
- `Phase 2` complete: `AppContext/GameSession` is the explicit runtime-access seam
- `Phase 3` complete: loop, queue, runner, failure, selection, and tick seams exist under `src/core/*`
- `Phase 4` complete: world/town/resource/runtime/character/story/challenge/prestige/buff-cap state mutation now has explicit seams
- `Phase 5` complete: local save/options/cloud behavior now has service seams under `src/services/*`
- `Phase 6` complete: major browser-only UI shells moved into `src/ui/controllers/*`
- `Phase 7` complete: predictor bridge and worker-service seams exist under `src/services/predictor/*`
- `Phase 8` complete: architecture/runtime/save/content terminology contracts are now documented in `docs/*`
- `Phase 9` complete: baseline accessibility shells now cover keyboard tooltip access, ARIA syncing, live regions, and reduced-motion support
- `Phase 10` complete: generated content metadata registry and explicit content entry points now exist under `src/content/*` and `generated/*`
- `Phase 11` complete: runtime hook ids from content metadata now resolve through an explicit hook registry under `src/content/*`
- `Phase 12` complete: content execution hooks are now split into explicit `rule / effect / story` adapter seams under `src/content/*`
- `Phase 13` complete: first shared content definitions now execute through `src/content/definitions/*` instead of living only inline in `actionList.js`
- `Phase 14` complete: the first zone-sized action block now executes through `src/content/definitions/*` instead of being registered inline in `actionList.js`
- `Phase 15` complete: the second zone-sized action block now executes through `src/content/definitions/*` instead of being registered inline in `actionList.js`
- `Phase 16` complete: the third zone-sized action block now executes through `src/content/definitions/*` instead of being registered inline in `actionList.js`
- `Phase 17` complete: the fourth zone-sized action block now executes through `src/content/definitions/*` instead of being registered inline in `actionList.js`

## Stable Entry Points

- Browser app startup: `src/app/bootstrap.js` via `IdleLoopsBootstrap.bootstrapGame()`
- Predictor worker startup: `src/app/bootstrap.js` via `IdleLoopsBootstrap.bootstrapPredictorWorker()`
- Browser session access: `IdleLoopsBootstrap.getGameSession()`
- Runtime content metadata access: `IdleLoopsBootstrap.getContentRegistry()`
- Shared content definition factories: `IdleLoopsLegacyDefinitionFactories.registerSharedActionFactories(...)`
- Zone action definition factories: `IdleLoopsZoneDefinitionFactories.registerBeginnersvilleActions(...)`
- Forest Path action definition factories: `IdleLoopsZoneDefinitionFactories.registerForestPathActions(...)`
- Merchanton action definition factories: `IdleLoopsZoneDefinitionFactories.registerMerchantonActions(...)`
- Olympus action definition factories: `IdleLoopsZoneDefinitionFactories.registerOlympusActions(...)`
- Legacy runtime bridge: `IdleLoopsAppContext.getLegacyAppContext()`
- Runtime action truth today: `actionList.js`
- Runtime action-hook truth today: `src/content/runtime-hook-registry.js`
- Runtime content hook family seams today: `src/content/rules/*`, `src/content/effects/*`, `src/content/stories/*`
- Save/load compatibility boundary today: `saving.js`
- Mega-view shell today: `views/main.view.js`

## Layer Boundaries

- `src/app/*`
  - Owns startup sequencing, explicit legacy bridges, and app/session entry points.
  - Does not own formulas, save serialization, or DOM-heavy rendering.
- `src/core/*`
  - Owns loop, queue, runner, domain, and progression logic that should remain usable without DOM access.
  - Does not own browser persistence, worker bootstrapping, or localized copy.
- `src/services/*`
  - Owns persistence-facing and integration-facing behavior: local saves, options, cloud-save orchestration, predictor bridge, worker message handling.
  - Does not own gameplay rules or state mutation formulas.
- `src/ui/*`
  - Owns browser-only controllers, panel shells, DOM composition, and UI wiring.
  - Does not own game rules, save persistence, or predictor computation.
- `src/content/*`
  - Owns explicit zone metadata, generated action metadata lookup, runtime hook ids, shared extracted content-definition factories, extracted zone-sized action registration modules, `rule/effect/story` hook-family seams, and the combined runtime-facing content registry entry.
  - Authored content migration is not complete yet; `actionList.js` is still the live execution truth.
- `src/compat/*`
  - Owns temporary interop with the legacy script-global runtime.
  - Must shrink over time; no new product logic should start here.

## Current Runtime Shape

The game still boots as a script-global browser app loaded by `index.html`. The refactor has changed the shape of the codebase without changing the deployment model:

- still a static site
- still no build step required for runtime
- still old save payloads
- still legacy globals at the edges
- now with explicit seams for startup, loop execution, state mutation, services, UI shells, and predictor threading

The practical result is that the runtime is no longer "one giant implicit graph". It is now "legacy runtime plus documented seams".

## Runtime Ownership Today

- Action queue storage: `src/core/queue/queue-store.js`
- Current action state: `src/core/runner/current-action-state.js`
- Failure analysis: `src/core/runner/action-failure.js`
- Next valid action selection: `src/core/runner/next-valid-action.js`
- Tick formulas and tick execution: `src/core/runner/action-formulas.js`, `src/core/runner/action-tick.js`
- Game loop / frame budget / lag / speed / restart / offline: `src/core/loop/*`
- Town/resource/domain helpers: `src/core/domain/*`
- Progression and save-owned state mutation: `src/core/progression/*`
- Save/options/cloud services: `src/services/save/*`, `src/services/options/*`
- Predictor worker lifecycle and worker-side orchestration: `src/services/predictor/*`
- Browser-only view/control shells: `src/ui/controllers/*`

## Source Of Truth Status

Current truth boundaries:

- Runtime action definitions: `actionList.js`
- Extracted shared runtime definition factories: `src/content/definitions/legacy-shared-actions.js`
- Extracted zone registration modules: `src/content/definitions/beginnersville-actions.js`
- Additional extracted zone registration modules: `src/content/definitions/forest-path-actions.js`
- Additional extracted zone registration modules: `src/content/definitions/merchanton-actions.js`
- Additional extracted zone registration modules: `src/content/definitions/olympus-actions.js`
- Runtime action metadata seam: `generated/action-metadata-registry.js` loaded through `src/content/*`
- Runtime action-hook seam: `src/content/runtime-hook-registry.js`
- Runtime content hook-family seams: `src/content/rules/legacy-action-rules.js`, `src/content/effects/legacy-action-effects.js`, `src/content/stories/legacy-story-hooks.js`
- Runtime formulas: mixed, but increasingly routed through `src/core/runner/*` and `src/core/progression/*`
- Save payload compatibility: `saving.js` + `src/services/save/save-migrations.js`
- Browser options persistence: `src/services/options/options-store.js`
- Cloud save behavior: `src/services/save/cloud-save-service.js`
- Predictor bridge behavior: `src/services/predictor/*`

Target truth boundaries:

- Authoring truth: XML/schema/editor plus explicit content definitions
- Runtime truth: generated JS registries + explicit rule/effect ids
- View truth: panel/controller modules, not a single mega-view

## Invariants

These are non-negotiable during refactor work:

- No formula or balance changes as part of code movement.
- No save format breakage.
- No action id, `varName`, or story-flag semantic drift.
- No removal of static-site deployment.
- Predictor must keep a worker-safe, DOM-free execution surface.
- New seams must preserve old browser globals until the old callers are gone.

## Not Moved Yet

- `actionList.js` is still the runtime content registry, even though shared survey/ruins/haul/assassin definitions and the full Beginnersville/Forest Path/Merchanton/Mt. Olympus action blocks now come from `src/content/definitions/*`.
- XML/editor is still not the runtime source of truth.
- `views/main.view.js` still owns a large rendering/update surface.
- `saving.js` is still the compatibility choke point for full save/load.
- Predictor formulas still rely on the legacy runtime bundle.

## Next Focus

The numbered refactor phases are now functionally complete through the first shared content-definition extraction baseline. The next mainline work is post-phase sustainment:

- zone-by-zone content-definition extraction out of `actionList.js`
- continue extracting additional zone registration modules out of `actionList.js`
- content rule/effect/story extraction behind generated metadata and hook ids
- further shrinkage of `views/main.view.js` and `actionList.js`
- optional tooling modernization only after compatibility remains stable
