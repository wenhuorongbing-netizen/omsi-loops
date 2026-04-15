# Save Services

Entry points: `src/services/save/save-service.js`, `src/services/save/save-migrations.js`, `src/services/save/cloud-save-service.js`

This directory owns local save-slot persistence, save import/export encoding, save file naming, migration helpers, and cloud-save orchestration wrappers.

This directory does not own:
- save-schema compatibility transforms
- gameplay state mutation
- Google auth/transport primitives
