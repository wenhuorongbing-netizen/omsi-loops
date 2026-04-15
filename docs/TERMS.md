# Terms

## Why This Exists

The codebase uses many long-lived terms that were historically implicit. This file fixes the meaning of those terms for maintainers and AI tools.

## Core Terms

- `loop`
  - One full automated run until mana/time/action gating ends and the game restarts or pauses.
- `tick`
  - One execution step in the runtime loop. Not the same thing as a whole loop.
- `frame`
  - One browser update interval that may or may not execute runtime ticks depending on frame gating.
- `offline`
  - Stored budget/time that can be spent to advance the game faster later.
- `budget`
  - Available execution allowance for a frame or update pass.

## Action Terms

- `action`
  - A runtime gameplay activity defined today in `actionList.js`.
- `next`
  - The editable queued action list the player is constructing.
- `current`
  - The currently materialized loop action list derived from `next`.
- `currentPos`
  - The index of the action currently being evaluated/executed in `actions.current`.
- `effectiveTimeElapsed`
  - Progress already spent on the active action after selection/execution decisions.
- `adjustedTicks`
  - Tick count after current modifiers/formulas are applied.
- `failureInfo`
  - Structured explanation of why an action cannot currently proceed.

## Queue Terms

- `queue store`
  - Structural operations on `actions.next`: insert, move, remove, clone, zone span, indexing.
- `runner state`
  - Materialized current-loop execution state derived from queued actions.
- `selection`
  - Picking the next executable action from `actions.current`.

## Progression Terms

- `world state`
  - Global world progression collections like `townsUnlocked` and `completedActions`.
- `town state`
  - Per-town variables, progress bars, multipart state, and action-list arrangement.
- `character state`
  - Stats, skills, buffs, soulstones, and related progression mutation.
- `runtime state`
  - Carry-over values like totals, mana/time budget, offline budget, and loop-adjacent counters.
- `meta progression`
  - Cross-loop advancement that is not raw character XP, such as training limits or investment counters.
- `prestige state`
  - Permanent prestige point values and affordability/spending state.
- `challenge state`
  - Challenge-mode save/progress state.
- `story state`
  - Story flags, story vars, and global story unlock tracking.

## Save Terms

- `save payload`
  - The serialized imported/exported game state shape.
- `save slot`
  - Browser-persisted save location, usually backed by local storage.
- `migration`
  - Version-aware transformation applied to old payloads before they re-enter runtime state.
- `compat`
  - Temporary code whose job is preserving old behavior while a new seam is introduced.

## UI Terms

- `mega-view`
  - The legacy `views/main.view.js` file that still owns much of rendering/update work.
- `controller`
  - A browser-only shell that coordinates DOM/UI behavior without owning gameplay rules.
- `panel`
  - A visually coherent section of UI such as inspector, queue, chronicle, or planner.
- `shell`
  - Thin orchestration code that coordinates side effects around a deeper seam.

## Predictor Terms

- `predictor`
  - The planning/simulation subsystem used to estimate loop outcomes.
- `bridge`
  - Main-thread worker lifecycle and channel/message coordinator.
- `worker service`
  - Worker-side message dispatcher/orchestrator.
- `shared core`
  - The long-term goal where predictor and main runtime share explicit logic modules instead of whole-script imports.

## Content Terms

- `runtime truth`
  - The content representation actually executed by the live game.
- `authoring truth`
  - The source content authors are intended to edit directly.
- `story set`
  - The collection of text and unlock milestones associated with an action or content unit.
- `rule id`
  - Stable identifier for executable requirement/cost/reward/progress logic once logic extraction is complete.

## Contract Terms

- `seam`
  - An explicit extracted module boundary inserted into legacy code without changing gameplay behavior.
- `invariant`
  - A rule that refactor work must not break, such as save compatibility or stable action ids.
