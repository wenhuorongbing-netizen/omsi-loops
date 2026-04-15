# Content Helpers

Entry points: `src/content/helpers/exploration-helpers.js`, `src/content/helpers/runtime-adjustment-helpers.js`

This directory owns extracted helper families that are shared across multiple zones or runtime shells.

Current explicit helper entry:
- `IdleLoopsContentHelperRegistry.getExplorationHelpers()` exposes the shared survey/exploration aggregation helpers and also restores the legacy globals they historically provided
- `IdleLoopsContentHelperRegistry.getRuntimeAdjustmentHelpers()` exposes the shared driver-facing adjustment helpers and also restores the legacy globals they historically provided

This directory does not own:
- zone-specific action registration blocks
- rule/effect/story hook families
- save/load policy
