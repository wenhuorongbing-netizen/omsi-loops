# omsi-loops Agent Guide

## Codex Migration Safety Rules

Project: omsi-loops

### Project Structure

- Inspect the repository root, README, package/build files, and docs/ before making changes.
- Preserve existing module boundaries and project-specific conventions.

### Install Dependencies

~~~~powershell
npm ci
~~~~

### Start Commands

~~~~powershell
npm run dev
~~~~

### Test Commands

~~~~powershell
npm test
~~~~

### Lint / Typecheck Commands

~~~~powershell
npm run lint
npm run typecheck
~~~~

### Codex Rules

- Do not commit .env, .env.*, *.local, secrets/, credentials/, private keys, tokens, passwords, local databases, migration archives, or Codex local state.
- Do not commit node_modules/, virtual environments, caches, build outputs, coverage reports, logs, or archive files.
- Do not delete or rewrite user local files unless explicitly asked.
- Prefer small, focused changes and run the smallest relevant verification before finishing.
- If verification cannot run, document the exact reason.

### Before Finishing

~~~~powershell
git status -sb
git diff --check
npm test
~~~~