---
sidebar_position: 4
---

# Features and Requirements


## Features

| Feature ID | Feature | User Value |
| --- | --- | --- |
| FEAT-1 | Set list of favorite teams, a **watch-list** | Track specific teams to block scores of games that haven't been watched yet - <u>No Spoilers!</u><br/> Extension popup shows a status dashboard.|
| FEAT-2| Mark games **watched** or **unwatched**| Synchronization across all active tabs; on supported websites, only display scores when the user is ready to view them.|
| FEAT-3| View an upcoming game **schedule**| Easy access to set games that should not show spoilers.|
| FEAT-4| Click on blurred score to reveal| Spoils 1 individual score, with a confirmation step.  No need to open extension.|
| FEAT-5| Start and Stop the web extension| Turn spoilers on/off without resetting favorite teams.|

## Functional Requirements

| Requirement ID | Related Feature | Requirement |
| --- | --- | --- |
| REQ-1.1 | FEAT-1 | From supported sports leagues (NBA), select team(s). |
| REQ-1.2| FEAT-1| Remove team(s) from the watch-list.|
| REQ-1.3| FEAT-1| On supported websites (ESPN), blur out scores of teams on watch-list.|
| REQ-1.4| FEAT-1| Default no-spoiler window of 48 hours; scores stay blurred until game is marked watched or window ends.|
| REQ-1.5| FEAT-1| User can set/change the no-spoiling window.|
| REQ-1.6| FEAT-1| Extension popup shows a status dashboard for watch-list teams.|
| REQ-2.1| FEAT-2| From extention popup, mark a game *watched* or *unwatched*.|
| REQ-2.2| FEAT-2| When a game is marked as *watched*, all tabs/sites show that score.|
| REQ-2.3| FEAT-2| When a game is marked as *unwatched*, all tabs/sites blur that score again.|
| REQ-3.1| FEAT-3| Extension popup shows upcoming games for watch-list teams.|
| REQ-3.2| FEAT-3| Schedule refreshes every 3 hours.|
| REQ-3.3| FEAT-3| Manual refresh button to update schedule on demand.|
| REQ-4.1| FEAT-4| Click to unblur - only reveals 1 score at a time, after confirmation.|
| REQ-4.2| FEAT-4| Revealing a score is a one-time event - does not mark the game as *watched*.|
| REQ-5.1| FEAT-5| Ability to pause game blocking, on current site or on all sites.|
| REQ-5.2| FEAT-5| Pausing or stopping keeps the watch-list and watched games intact.|

## Non-Functional Requirements

| Requirement ID | Category | Requirement |
| --- | --- | --- |
| NFR-1 | Performance | Scores are blurred before they become visible on page load - no flash of unblurred score.|
| NFR-2| Performance| Scrolling must not reveal scores.  They are blurred even if user scrolls quickly, accounting for infinite scroll.|
| NFR-3| Privacy| No browsing history is collected.|
| NFR-4| Privacy| Fetching schedule.json is the only network request.|
| NFR-5| Privacy| Storage only includes \[user\] settings - teams, defaults, game IDs.|
| NFR-6| Reliability| Use a cached schedule if loading or refreshing fails.|
| NFR-7| Reliability| If no schedule can be loaded, extension shows a warning: **"Spoilers Ahead!"**|
| NFR-8| Security| API keys stored in Github Actions Secrets, **NOT** in the extension.|
| NFR-9| Maintainability| Add automated checks to the CI/CD Pipeline - on PRs; pass tests before merge.|
| NFR-10| Usability| **Extra:**  Add a toolbar badge showing curent number of game scores blocked.|
