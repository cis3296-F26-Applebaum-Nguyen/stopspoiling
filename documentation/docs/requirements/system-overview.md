---
sidebar_position: 1
---

# System Overview
StopSpoilers can blur out sports scores in a web browser.  Many fans wait until they get home from work to watch a game, and there's nothing worse than accidentally ruining the result when you've waited all day to watch your team.  It's also useful for fans in different time zones that don't watch sports live, or for people who simply wait until the end of a game to skip commercials and don't want spoilers.  

## Purpose

StopSpoiling lets fans watch the NBA games on their own schedule without seeing the result first. The user picks the teams they follow. The extension uses real game schedules to know which games matter that day, and it hides scores, result words, and headlines about those games on the websites the user visits. When the user finishes a game, they mark it as **Watched**, and only that game's results come back.
 
Other ways to avoid spoilers have gaps. Staying offline is hard to do for a whole day. Muting words on one social site does not help on other sites. Most spoiler blocker extensions make the user type and update every keyword by hand. StopSpoiling builds its list from the schedule, unlocks one game at a time, covers NBA together, and is free and open source with no browsing-history collection.

## Project Abstract

StopSpoiling is a free, open-source Chrome extension for NBA fans who watch games after they happen. Before they press play, the result often finds them first in a YouTube thumbnail, a post on X, a Reddit headline, or a Google result. The user picks their teams. A schedule updater collects game schedules from TheSportsDB, and the extension uses that schedule to blur spoilers for those games on any website. Clicking **Watched** reveals one game's results while other unwatched games stay protected. Unlike blockers that rely on typed keywords, StopSpoiling only hides the games the user cares about, on the days they happen.

## Top-Level Requirements

- Pick teams and esports titles from the NBA.
- See today's games for those teams in a popup **Watch List**.
- Browse with spoilers for unwatched games blurred, and click any blurred item to reveal just that item.
- Click **Watched** to unlock one game at a time.
- Pause blocking on one site or on all sites.
- Add custom keywords, such as player names.

The system will:
 
- Update game schedules several times a day.
- Hide spoilers before they appear on screen.
- Keep working on pages that load more content as the user scrolls.
- Never collect browsing history.
- Be tested on YouTube, Google, Reddit, X, and ESPN.

## Conceptual Design

StopSpoiling has two main parts: a **schedule updater** and a **Chrome extension**.
 
**Data flow:** schedule APIs → GitHub Actions → `schedule.json` on GitHub Pages → Chrome extension → web pages
 
- **Schedule updater (Node.js, TypeScript):** a scheduled GitHub Actions job pulls schedules from TheSportsDB [2] and PandaScore [3], converts them into one shared format, and publishes a `schedule.json` file to GitHub Pages. Each data source follows the same interface, so new sources can be added later. API keys stay in GitHub Actions secrets, and no separate server is needed.
- **Chrome extension (TypeScript, Manifest V3):** a React popup for managing teams, keywords, and watched games; a content script that scans each page and blurs matches with CSS [1], using `MutationObserver` to catch new content while scrolling; and a background service worker that downloads the schedule and saves it in Chrome storage.
- **Matching engine (TypeScript):** finds team names and nicknames ("76ers," "Sixers," "PHI"), score patterns ("112-108"), and result words ("wins," "eliminated"), only for games not yet marked **Watched**.
**Testing:** Vitest for unit tests, Playwright for end-to-end tests in Chrome, and GitHub Actions to run tests on every pull request.
 
**Already exists:** Chrome Extension APIs, React, Vite, Node.js, Vitest, Playwright, GitHub Actions and Pages, and the TheSportsDB and PandaScore APIs. **Built by this project:** the matching engine, page blurring, schedule updater, team nickname data, popup, and all tests.
 
See the [System Architecture](./system-block-diagram.md) page for the block diagram and component details.

## Required Resources

**Background knowledge:** TypeScript, Chrome extensions, React, REST APIs, regular expressions, and testing.
 
**Software:** Chrome, Node.js, VS Code, Git, and GitHub. All are free.
 
**Hardware:** any laptop works. No special hardware is needed.
 
**Outside accounts:** two free API accounts, TheSportsDB [2] and PandaScore [3]. TheSportsDB's free key returns limited results on some calls. If that is not enough, the updater will save full season schedules and filter them itself. PandaScore's free plan currently lists 1,000 requests per hour. No paid services are planned, and nothing outside the standard Computer Science Department lab resources is required.

## Background & References

Many fans watch games later because of work, school, or time zones. Today, their main options are to stay offline or mute words on a single site. X's keyword muting only filters content inside X, and its help page notes that muted content can still appear in search [7].
 
Similar products:
 
- **SpoilerProtection [4]:** advertises spoiler hiding across social, video, search, and news sites. The user sets up the words to block.
- **ScoreBlur [5]:** advertises automatic soccer and basketball score and thumbnail blurring. Its listing describes a paid extension with a free trial.
- **Spoiler Slayer [6]:** an open-source TV and movie spoiler blocker with shared lists, custom filters, and reveal controls. The team may study how it hides content but will not reuse its code.
StopSpoiling is different because it is schedule-aware, unlocks one game at a time, covers sports and esports together, is free and open source, and is planned to collect no browsing data. These are planned features, not claims that other blockers could never do the same. No code from closed-source products will be used.
 
**References**
 
1. Chrome for Developers, "Content scripts." https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
2. TheSportsDB, "Free Sports API Documentation." https://www.thesportsdb.com/documentation
3. PandaScore, "Esports API Plans & Pricing." https://www.pandascore.co/pricing
4. Chrome Web Store, "SpoilerProtection." https://chromewebstore.google.com/detail/spoilerprotection/eelacikjiplnmdingehjfdjcfegclmkg
5. Chrome Web Store, "ScoreBlur - Hide Football Score Spoilers." https://chromewebstore.google.com/detail/scoreblur-hide-football-s/blkbooepcilfejmilklgpejkdedallii
6. GitHub, "brettp/spoiler-slayer." https://github.com/brettp/spoiler-slayer
7. X Help Center, "How to use advanced muting options." https://help.x.com/en/using-x/advanced-x-mute-options
