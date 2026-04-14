# App

Entry points: `src/app/bootstrap.js`, `src/app/app-context.js`, `src/app/game-session.js`

This directory owns application startup sequencing and explicit access into the legacy runtime. It provides the browser bootstrap, the predictor worker bootstrap, and the first `AppContext/GameSession` scaffolds without changing behavior yet.

Current explicit runtime entry:
- `IdleLoopsBootstrap.getGameSession()` returns the browser-side session after startup
- `LegacyAppContext.captureGlobalState/applyGlobalState()` is the current bridge for save-facing scalar globals

This directory does not own:
- game rules or action formulas
- full save serialization shape or migrations
- DOM rendering logic beyond invoking the existing startup chain
