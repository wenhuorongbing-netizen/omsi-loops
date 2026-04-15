# Action Authoring

## Scope

This document describes how to add or migrate actions safely in the current hybrid architecture.

It is intentionally conservative. Runtime truth is still `actionList.js`, so authoring work must preserve current behavior first and structure second.

## Current Truth

Today, a gameplay action is still live when it exists in `actionList.js` as `Action.* = new Action(...)`.

There is now also a generated metadata seam:

- metadata build entry: `tools/build-content.mjs`
- committed runtime metadata: `generated/action-metadata-registry.js`
- runtime metadata lookup: `src/content/action-metadata-registry.js`
- runtime hook lookup: `src/content/runtime-hook-registry.js`
- runtime hook-family adapters: `src/content/rules/legacy-action-rules.js`, `src/content/effects/legacy-action-effects.js`, `src/content/stories/legacy-story-hooks.js`
- extracted shared definition factories: `src/content/definitions/legacy-shared-actions.js`
- extracted cross-zone helper registry: `src/content/helpers/exploration-helpers.js`
- extracted runtime-adjustment helper registry: `src/content/helpers/runtime-adjustment-helpers.js`
- extracted zone registration modules: `src/content/definitions/beginnersville-actions.js`
- additional extracted zone registration modules: `src/content/definitions/forest-path-actions.js`
- additional extracted zone registration modules: `src/content/definitions/merchanton-actions.js`
- additional extracted zone registration modules: `src/content/definitions/olympus-actions.js`
- additional extracted zone registration modules: `src/content/definitions/valhalla-actions.js`
- additional extracted zone registration modules: `src/content/definitions/startington-actions.js`
- additional extracted zone registration modules: `src/content/definitions/jungle-path-actions.js`
- additional extracted zone registration modules: `src/content/definitions/commerceville-actions.js`
- additional extracted zone registration modules: `src/content/definitions/valley-of-olympus-actions.js`

This means:

- XML/editor content is not yet sufficient to make an action playable.
- New runtime actions still require a runtime definition in `actionList.js`.
- New reusable legacy definition families should land in `src/content/definitions/*` instead of being re-inlined into `actionList.js`.
- New cross-zone helper families should land in `src/content/helpers/*` instead of being hidden inside a specific zone module.
- Driver-facing content recalculation helpers should land in `src/content/helpers/*` instead of staying embedded inside late-game zone files.
- New zone-scale extraction work should prefer `src/content/definitions/*` registration modules over leaving large town blocks inline in `actionList.js`.
- Refactor work should extract metadata/rules/effects around that runtime definition, not silently invent a second truth source.
- Metadata-only changes should be rebuilt with `npm run content:build`.
- Hook-backed metadata changes should continue to preserve the existing hook ids such as `legacy:ActionId:visible`.
- New extraction work should land in the correct hook family seam first, then later move deeper into pure core modules.

## Target Direction

The long-term target is:

- authoring truth: XML + schema + editor
- runtime truth: generated JS registry
- executable behavior: rule/effect ids resolved by core modules

That target is not complete yet. New work must be compatible with the current hybrid state.

## Minimum Action Metadata

When extracting or documenting an action, keep this shape stable even if the runtime still uses legacy constructors:

- `id`
- `name`
- `varName`
- `type`
- `zoneId`
- `category`
- `tags`
- `visibleKey`
- `unlockedKey`
- `costKey`
- `rewardKey`
- `progressKey`
- `storySetId`
- `runtimeHookIds`

Not every field is fully implemented as a separate registry yet, but new extraction work should think in this schema.

## Authoring Rules

- Do not change `action id`.
- Do not change `varName`.
- Do not change story-flag semantics as part of refactor work.
- Do not change formulas or balance while moving code.
- Do not add new gameplay logic straight into UI/controller files.
- Do not add new save behavior directly into action definitions if a progression/domain seam already exists.

## Where Logic Should Go

Use the smallest explicit seam that matches the behavior:

- queue behavior: `src/core/queue/*`
- execution/tick behavior: `src/core/runner/*`
- town/domain state: `src/core/domain/*`
- progression/meta/prestige/story/challenge/runtime mutation: `src/core/progression/*`
- save/options/cloud behavior: `src/services/*`
- browser-only presentation: `src/ui/*`

## What Should Stay Out Of Action Definitions

Avoid adding more of these inline if there is a seam available:

- open-coded global mutation
- DOM access
- `localStorage` access
- worker/message handling
- browser dialog/confirm/prompt behavior
- reusable shared content constructors/factories that could live under `src/content/definitions/*`

Legacy inline functions still exist, but new work should not deepen that pattern unless there is no extracted home yet.

## Safe Workflow For Existing Actions

When touching an existing action:

1. Identify whether the change is metadata, formula, effect, or UI text.
2. Keep runtime behavior identical first.
3. If the behavior belongs to an extracted seam, move only that piece.
4. Preserve current localization keys and story references.
5. Run smoke/regression after the change.

## Safe Workflow For New Actions

Until generated registries exist, the safest current workflow is:

1. Add runtime definition in `actionList.js`.
2. Keep ids, `varName`, and story keys explicit and stable.
3. Put any new reusable formula/effect into the appropriate seam instead of embedding more ad hoc logic.
4. Add/update localization entries.
5. Verify save/load, predictor, and queue behavior through smoke/regression.

## Migration Guidance

The intended migration order for content is still:

1. extract metadata
2. extract formulas/effects/rule references
3. generate runtime registries from authoring truth

Do not skip straight to "XML is truth" while runtime still depends on inline constructors and closures.

## Review Checklist

Before considering action work done, verify:

- runtime action still appears and executes
- queue insertion/reordering still works
- save/load still preserves the relevant state
- predictor still runs
- localization keys still resolve
- no new browser-only dependencies leaked into core logic
