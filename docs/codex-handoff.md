# omsi-loops Codex Handoff

Generated for migration on 2026-05-01.

## Project Name

omsi-loops

## Project Path

C:\Users\Jack\Documents\GitHub\omsi-loops

## Project Goal

This repository is one of the six local projects being migrated from the old Codex app machine to a new machine. Use the existing README, source tree, tests, and docs as the source of truth for the detailed product or engineering goal.

## Current Project Status

- Git root: C:/Users/Jack/Documents/GitHub/omsi-loops
- Branch at migration: new-horizon
- Latest commit at migration: 
- Origin remote at migration: https://github.com/wenhuorongbing-netizen/omsi-loops.git
- Top-level structure: .git, .github, .gitignore, .playwright-cli, .tmp_disco_stage1_cn.txt, .tmp_disco_stage2_cn.txt, actionList.js, actionLog.js, actions.js, AGENTS.md, AI_MAP.md, challenges.js, data, data.js, docs, driver.js, editor.css, editor.html, editor.js, favicon.ico, favicon-16x16.png, favicon-32x32.png, generated, google.js, helpers.js, hotkeys.js, iconfont.css, img, index.html, interval.js, jsconfig.json, lang, lib, localization.js, manifest.webmanifest, node_modules, NOTES, output, package.json, package-lock.json, polyfills.js, predictor.css, predictor.js, predictor-worker.js, prestige.js, privacy.html, progress.md, README.md, saving.js, schema.js, src, stats.js, statsgraph.css, statsgraph.js, stylesheet.css, talents.js, tests, themes.css, tools, tos.html, town.js, types.d.ts, uicomponents.js, views

## Completed Migration Changes

- Confirmed or initialized Git repository.
- Added or updated .gitignore with migration-safe secret, dependency, build, cache, and archive exclusions.
- Checked tracked filenames for obvious sensitive files and removed only clearly sensitive tracked files from the Git index when needed.
- Added or updated AGENTS.md for Codex continuation rules.
- Generated this handoff document.
- Prepared encrypted private archive staging outside the repository.

## Important Design Decisions

- GitHub should contain normal source, tests, documentation, and templates only.
- Local secrets, credentials, private config, local databases, and Codex state belong only in encrypted archives.
- New-machine work should inspect the current tree before relying on old conversation summaries.
- Existing user work should be preserved; do not use destructive Git or filesystem operations unless explicitly requested.

## Current Unfinished Tasks

- Review git status -sb after restoring the repository and private archive.
- Read README and project-specific docs to decide the next development task.
- Run the verification commands listed below.

## Known Issues Or Risks

- Keyword-only sensitive scan hits found: 29. Values were not printed.

## Files To Read First On The New Machine

- README.md, if present
- AGENTS.md
- docs/codex-handoff.md
- Project build files such as package.json, pom.xml, pyproject.toml, requirements.txt, or equivalent

## Commands To Run First On The New Machine

~~~powershell
git status -sb
git remote -v
git branch --show-current
git rev-parse HEAD
~~~

Install:

~~~powershell
npm ci
~~~

Start:

~~~powershell
npm run dev
~~~

Test:

~~~powershell
npm test
~~~

Lint / typecheck:

~~~powershell
npm run lint
npm run typecheck
~~~

## Git Status Before Migration Commit

~~~text
On branch new-horizon
Your branch is up to date with 'origin/new-horizon'.

nothing to commit, working tree clean
~~~

## Files Kept Out Of GitHub And Put Into The Encrypted Private Package

- No project-private files were selected for the encrypted package at generation time.

## User Preferences And Codex Rules

- Do not commit .env, tokens, passwords, secrets, private keys, auth.json, local Codex state, logs, caches, dependencies, build outputs, or migration archives.
- Do not delete local project files or old Codex state.
- Continue processing other projects if one project fails.
- Make direct, pragmatic code changes when requested; avoid stopping at suggestions unless blocked.
- Summarize failures with concrete paths and next steps.