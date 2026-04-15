# Services

Entry points: `src/services/save/save-service.js`, `src/services/save/save-migrations.js`, `src/services/save/cloud-save-service.js`, `src/services/options/options-store.js`, `src/services/predictor/predictor-bridge.js`, `src/services/predictor/predictor-worker-service.js`

This directory owns persistence-facing and integration-facing runtime services: local save-slot storage, option/UI storage, cloud-save orchestration, and predictor worker bridging/message services.

This directory does not own:
- gameplay rules or progression formulas
- DOM rendering beyond narrow integration callbacks
- save compatibility migrations or runtime state mutation rules
