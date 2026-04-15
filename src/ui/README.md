## UI Layer

- Entry: browser-only UI controllers and panel shells live under `src/ui/*`.
- Depends on: existing DOM ids/classes, `view`, legacy localization helpers, and extracted service/core seams.
- Includes: planner, reading-shell, loadout, cloud-save, town-browser, and accessibility controllers.
- Not responsible for: gameplay rules, save persistence, predictor computation, or direct domain-state mutation outside explicit seams.
