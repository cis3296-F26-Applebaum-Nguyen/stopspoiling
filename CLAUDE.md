# StopSpoiling

Chrome (Manifest V3) extension that blurs spoilers about games the user hasn't watched yet. Blocking is driven by a schedule file, so users don't type in games by hand. CIS 3296 final project, team of 6, **due Fri Dec 4, 2026**.

## Status

Only the Docusaurus documentation site exists (`documentation/`). Planned code layout:

```
apps/extension/            WXT + React: popup, options, service worker, content scripts
packages/shared/           types, Zod schemas, teams.json
packages/engine/           matching engine (pure TypeScript)
services/schedule-updater/ Node CLI run by GitHub Actions
tests/e2e/                 Playwright + saved page fixtures
```

## Architecture

Schedule APIs → GitHub Actions (cron, every 3 h) → `schedule.json` on the **`data` branch** → extension service worker → `chrome.storage` → content script → page.

- The **matching engine is pure**: text + active games in, block decision out. No DOM, no Chrome APIs.
- A **site adapter** per website (YouTube, ESPN; Google is stretch) says which page elements are "units" and where their text is. Unknown sites use a generic adapter.
- `schedule.json` contains **no scores**. Times are stored in UTC.
- The extension stores settings and watched game IDs only. **No browsing history.**
- Do not store `schedule.json` on `gh-pages`: `docusaurus deploy` deletes everything on that branch and force-pushes.

## Commands

Docs site:

```bash
cd documentation && yarn install && yarn start   # dev server
cd documentation && yarn build
```

Code (once the monorepo exists): `npm install`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run test:e2e`.

## Rules for Claude

- **Do not write or edit anything under `documentation/docs/`.** Those pages are graded and must be human-written. `.claude/settings.json` denies edits there. You can read them and give feedback or structure suggestions in chat.
- Files listed in `.tu-cis-docs/manifest.json` are course-template files. Avoid editing them.
- Never commit to `main`. Work on a branch, open a PR, and put `Closes #<issue>` in the description.
- Ask before any GitHub write: issues, labels, the Project board, PRs.
- Do not commit `.idea/` or `skills/`.
- Work is tracked on the GitHub Project board. Jira is a mirror that Sam maintains; don't create Jira work for the team.
- Tests: unit tests with Vitest, end-to-end tests with Playwright against saved page fixtures (never live Google, X or Reddit).
