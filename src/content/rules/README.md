# Content Rules

Entry point: `src/content/rules/legacy-action-rules.js`

This directory owns content-facing rule adapters. At the current refactor stage they still delegate to the live legacy action methods, but they provide the stable seam where future pure rule implementations should land.

This directory does not own:
- browser DOM behavior
- save/load behavior
- action side effects such as resource mutation or story unlocks
