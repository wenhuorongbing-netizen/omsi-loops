# Options Store

Entry point: `src/services/options/options-store.js`

This directory owns UI/predictor settings that live in browser storage and are not part of gameplay rules.

This directory does not own:
- option side effects on DOM/runtime
- save serialization
- cloud save behavior
