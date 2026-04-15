# Content Effects

Entry point: `src/content/effects/legacy-action-effects.js`

This directory owns content-facing effect adapters. At the current refactor stage these adapters still delegate to live legacy action methods, but they define the future seam for extracted gameplay effects.

This directory does not own:
- visibility/unlock gating
- cost/progress formulas
- UI rendering concerns
