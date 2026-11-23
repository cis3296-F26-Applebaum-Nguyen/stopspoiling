# Schedule updater

Fetches NBA games from TheSportsDB and writes `schedule.json` in the shared game format
(no scores, no results). Run by hand today; #35 runs it automatically and publishes the file.

## Command

From the repository root:

```sh
yarn install --frozen-lockfile
yarn workspace @stopspoiling/schedule-updater run update
```

Other commands: `yarn workspace @stopspoiling/schedule-updater test` and `... typecheck`.

## Configuration (environment variables)

| Variable | Required | Default | Meaning |
| --- | --- | --- | --- |
| `THESPORTSDB_API_KEY` | yes | none | API key. Keep it in `.env` (git-ignored) locally, or a secret in CI. Never commit it. |
| `SCHEDULE_OUTPUT_PATH` | no | `./out/schedule.json` | Where the file is written, relative to the working directory (the service folder when run through yarn) |
| `SCHEDULE_RECENT_DAYS` | no | `7` | Days of past games to include (1 to 30). Provisional until #32 fixes the spoiler-window range |
| `SCHEDULE_UPCOMING_DAYS` | no | `14` | Days of upcoming games to include (1 to 30) |
| `SCHEDULE_REQUEST_DELAY_MS` | no | `2100` | Pause between requests, to stay under the provider's limit of 30 requests per minute |

Copy `.env.example` to `.env` and fill in the key. For quick tests only, the provider's public free key is `123`.

## Output

Default path: `services/schedule-updater/out/schedule.json` (git-ignored). A small example in the same
format is in `sample/schedule.sample.json` for offline development.

```json
{
  "schemaVersion": 1,
  "league": "NBA",
  "generatedAt": "2026-11-23T19:40:43Z",
  "games": [
    { "id": "tsdb:2601914", "league": "NBA", "homeTeamId": "nba-phi", "awayTeamId": "nba-por",
      "startTimeUtc": "2026-11-24T00:00:00Z", "status": "scheduled" }
  ]
}
```

- **Game IDs** are `tsdb:<provider event id>`. They never depend on the start time, so a rescheduled game keeps its ID.
- **Times** are UTC (`...Z`). The provider sends times without a zone; they are UTC.
- **Teams** use shared IDs like `nba-phi`. Games are sorted by start time.
- **Status** is `scheduled`, `postponed` or `canceled`. A postponed game has `startTimeUtc: null` when the provider gives no time; a time is never invented. A scheduled game with no usable time is skipped and reported. The format has no "finished" state, so finished games stay `scheduled`.
- **No scores or results** are copied. Only the fields above are written.

## Failure behavior

The command writes a new file only after the whole result validates. It writes a temporary file, re-checks it, then swaps it in.
On any failure the previous file is left unchanged, the reason is printed, and the exit code is not 0.
It also refuses to publish an empty result (no usable games).

| Exit code | Meaning |
| --- | --- |
| 0 | Success |
| 2 | Configuration problem (missing key, bad number) |
| 3 | Provider request failed (network, HTTP error, rate limit, bad response) |
| 4 | Validation failed (including "no usable games") |
| 1 | Anything else |

Logs and error messages never contain the API key or any score. Requests that hit a rate limit (HTTP 429)
or a server error are retried up to 3 times, waiting as long as the provider asks.

## Provider notes (TheSportsDB, checked 2026-11-23)

- Endpoint used: `GET https://www.thesportsdb.com/api/v1/json/<key>/eventsday.php?d=YYYY-MM-DD&l=4387` (NBA league id `4387`), one request per UTC date in the window.
- `l=NBA` returned no events. The league lists `eventsnextleague.php` and `eventspastleague.php` returned only 1 event each with the free key, so they are not used.
- **The free key is not enough for a reliable feed.** It returned at most 3 games per day, and the game IDs had gaps, so games are missing. It also has a limit of 30 requests per minute and is shared by everyone, so it hits HTTP 429. The command prints a warning for any day with exactly 3 events. A premium key is likely needed (or another source such as ESPN's public scoreboard).

## Temporary pieces

Until the shared package from #26 lands, three local files stand in for it. Replace each with imports from `@stopspoiling/shared`:

- `src/schedule-types.ts` (game and schedule types)
- `src/team-ids.temp.ts` (provider team name to team ID)
- `src/validate-output.ts` (schedule validation)

## Handoff to #35

Run `yarn workspace @stopspoiling/schedule-updater run update` with `THESPORTSDB_API_KEY` set from a secret. Publish `services/schedule-updater/out/schedule.json` only when the exit code is 0.