# Content Definitions

Target location for authored content modules such as:

- chapter definitions
- zone definitions
- action definitions
- story-set definitions

This directory is not the live runtime truth yet. The current refactor stage only establishes metadata and registry seams so future extraction can move here without inventing a second hidden truth source.

Current extracted legacy content:

- `legacy-shared-actions.js` owns shared action factories and helper definitions for survey/ruins/haul/assassin content that used to live inline in `actionList.js`
- `actionList.js` now consumes those factories at runtime instead of duplicating the same implementations inline
- `beginnersville-actions.js` owns the first zone-sized action registration module extracted from `actionList.js`; it now registers the full Beginnersville block through `IdleLoopsZoneDefinitionFactories.registerBeginnersvilleActions(...)`
- `forest-path-actions.js` owns the second zone-sized action registration module extracted from `actionList.js`; it now registers the full Forest Path block through `IdleLoopsZoneDefinitionFactories.registerForestPathActions(...)`
- `merchanton-actions.js` owns the third zone-sized action registration module extracted from `actionList.js`; it now registers the full Merchanton block through `IdleLoopsZoneDefinitionFactories.registerMerchantonActions(...)`
- `olympus-actions.js` owns the fourth zone-sized action registration module extracted from `actionList.js`; it now registers the full Mt. Olympus block through `IdleLoopsZoneDefinitionFactories.registerOlympusActions(...)`

Do not put browser-only logic here.
Do not put save migration logic here.
Do not move formulas here unless they are being extracted into explicit core rule/effect seams.
