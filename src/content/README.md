# Content

Entry points: `src/content/zone-registry.js`, `src/content/action-metadata-registry.js`, `src/content/runtime-hook-registry.js`, `src/content/content-registry.js`, `src/content/definitions/legacy-shared-actions.js`, `src/content/rules/legacy-action-rules.js`, `src/content/effects/legacy-action-effects.js`, `src/content/stories/legacy-story-hooks.js`, `generated/action-metadata-registry.js`

This directory owns explicit content metadata seams for the legacy runtime. It is the home for stable zone definitions, generated action metadata, and future authored content definitions.

Current explicit content entry:
- `IdleLoopsZoneRegistry` exposes stable zone ids and town-number mapping
- `IdleLoopsActionMetadataRegistry` exposes generated action metadata with stable lookup helpers
- `IdleLoopsRuntimeHookRegistry` exposes stable legacy hook ids backed by the live runtime
- `IdleLoopsLegacyDefinitionFactories` exposes extracted shared content definition factories used by `actionList.js`
- `IdleLoopsLegacyActionRules`, `IdleLoopsLegacyActionEffects`, and `IdleLoopsLegacyStoryHooks` split content execution adapters by family
- `IdleLoopsContentRegistry` exposes the combined runtime-facing content entry

This directory does not own:
- final extracted action formulas or balance ownership
- DOM rendering or localization side effects
- save/load persistence rules
- the live runtime execution truth, which is still `actionList.js`
