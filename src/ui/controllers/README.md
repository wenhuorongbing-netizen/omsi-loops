## UI Controllers

- Entry: `src/ui/controllers/*.js` contains browser-only controllers split out of `views/main.view.js`.
- Depends on: `View` instance methods/state plus stable legacy DOM structure.
- Includes: planner, reading-shell, loadout, cloud-save, town-browser, and accessibility shells.
- Not responsible for: changing balance/content, redefining DOM ids/classes, or owning save/core logic.
