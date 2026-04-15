# App

Entry points: `src/app/bootstrap.js`, `src/app/app-context.js`, `src/app/game-session.js`

This directory owns application startup sequencing and explicit access into the legacy runtime. It provides the browser bootstrap, the predictor worker bootstrap, and the first `AppContext/GameSession` scaffolds without changing behavior yet.

Current explicit runtime entry:
- `IdleLoopsBootstrap.getGameSession()` returns the browser-side session after startup
- `IdleLoopsBootstrap.getContentRegistry()` returns the generated runtime content metadata entry after startup
- `LegacyAppContext.captureGlobalState/applyGlobalState()` is the current bridge for save-facing scalar globals
- `LegacyAppContext.captureCollectionState/applyCollectionState()` is the current bridge for save-facing arrays/objects
- Session snapshots now include queue, challenge/progression collections, story/totals save state, prestige state, and buff-cap state

This directory does not own:
- game rules or action formulas
- content authoring definitions or generated content artifacts
- full save serialization shape or migrations
- DOM rendering logic beyond invoking the existing startup chain
