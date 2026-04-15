## Predictor Services

- Entry: `src/services/predictor/predictor-bridge.js` and `src/services/predictor/predictor-worker-service.js`.
- Depends on: browser Worker APIs, snapshot exports, and the legacy predictor core in `predictor.js`.
- Not responsible for: prediction formulas, DOM rendering, or save compatibility rules.
