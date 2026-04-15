# Save Fixtures

Format: JSON with `name`, `description`, and `localStorage` keys.

The fixture manifest is `tests/fixtures/saves/manifest.json`.

Current Phase 0 coverage includes:
- `new-game`
- `forest-midgame`
- `merchanton-midgame`
- `valhalla-startington-branch`
- `endgame`

Synthetic mid/late-game fixtures are generated with `npm run fixtures:phase0` from scripted runtime scenarios in `tests/fixtures/saves/phase0-presets.mjs`.

Review screenshots for all active fixtures can be refreshed with `npm run fixtures:review`.

This directory does not own:
- exported screenshots
- expected metric snapshots
- migration logic
