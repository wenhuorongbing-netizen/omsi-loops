# Content Stories

Entry point: `src/content/stories/legacy-story-hooks.js`

This directory owns story-facing content hook adapters. At the current refactor stage they still delegate to legacy action methods, but they define the stable seam for future extracted story gates and story reward handlers.

This directory does not own:
- save serialization
- browser-only chronicle UI
- non-story gameplay formulas
