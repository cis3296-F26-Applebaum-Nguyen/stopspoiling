<div align="center">

# StopSpoiling

A Google Chrome extension that hides sports and esports results until you've watched the game.
 
</div>

## Project Abstract

The main users of this extension are sports fans who want to watch NBA games after they happen without seeing the result first. Before they press play, the result often finds them first in a YouTube thumbnail, a post on X, a Reddit headline, or a Google result. The user picks their teams. A schedule updater collects game schedules from TheSportsDB, and the extension uses that schedule to blur spoilers for those games on any website. Clicking **Watched** reveals one game's results while other unwatched games stay protected. Unlike blockers that rely on typed keywords, StopSpoiling only hides the games the user cares about, on the days they happen.  

> **Project status:** StopSpoiling is in the planning stage. The features below describe the first version the team plans to build. They are not working yet.

## High-Level Requirements

In the first version, a user will be able to:
 
- Pick teams and esports titles from the NBA, NFL, MLB, NHL, major soccer leagues, League of Legends, Valorant, and Counter-Strike.
- Open a popup **Watch List** that shows today's games for those teams.
- Browse the web with spoilers for unwatched games blurred.
- Click a blurred item to reveal just that one item.
- Mark a game as **Watched** to show all of its results again.
- Pause blocking on one site or on all sites.
- Add custom keywords, such as a player's name.

1. Jordan follows the Philadelphia 76ers. She opens the StopSpoiling popup and adds the 76ers to her teams.
2. On game night, her Watch List shows tonight's 76ers game. She's at work, so she plans to watch the replay later.
3. On her break she opens YouTube and Reddit. Thumbnails and headlines with the final score are blurred.
4. At home she watches the replay. When it ends, she opens the popup and clicks **Watched** next to the game.
5. Results for that 76ers game now show normally. Any other game she follows that she hasn't watched yet stays hidden.

## Conceptual Design

StopSpoiling has two main parts.
 
- **Chrome extension** (TypeScript, Manifest V3)
  - A **React popup** where the user manages teams, keywords, and watched games.
  - A **content script** that reads each page, blurs possible spoilers, and keeps checking new content as the user scrolls.
  - A **matching engine** that decides what counts as a spoiler. It looks for team names and nicknames ("Sixers," "PHI"), scores ("112-108"), and result words ("wins," "eliminated").
  - A **background service worker** that downloads the game schedule and saves it in Chrome storage.
- **Schedule updater** (Node.js, TypeScript)
  - A scheduled GitHub Actions job pulls sports schedules from TheSportsDB and esports schedules from PandaScore.
  - It puts every game into one shared format and publishes a `schedule.json` file on GitHub Pages.
  - API keys stay in GitHub Actions secrets and are never included in the extension, so no separate server is needed.
**Data flow:** schedule APIs → GitHub Actions → `schedule.json` on GitHub Pages → Chrome extension → web pages
 
**Planned testing:** Vitest for unit tests, Playwright for end-to-end tests in Chrome, and GitHub Actions to run the tests on each pull request.
 
See the [System Architecture page](documentation/docs/requirements/system-block-diagram.md) for the full design.

## Background

Fans watching recorded sports or esports can encounter results before they watch. Existing tools offer several approaches. SpoilerProtection advertises spoiler hiding across social, video, search, and news sites. ScoreBlur advertises automatic soccer and basketball score and thumbnail blurring; its listing describes a paid extension with a free trial. Spoiler Slayer is an open-source TV/movie blocker supporting shared lists, customizable filters, and reveal controls. X’s keyword muting provides filtering within X, but its documentation warns that muted content can still appear in search.

StopSpoiling plans to use match schedules and users’ selected teams and esports titles to build a watch list, reducing repeated keyword setup. Per-game “Watched” controls would let someone reveal a game they have finished while keeping other unwatched games protected. These are planned capabilities, rather than claims that existing blockers cannot provide similar features.

Privacy claims require care: SpoilerProtection’s listing mentions anonymous analytics but also declares no data collection. ScoreBlur’s developer states that detection runs locally while licensing exchanges limited data. Spoiler Slayer’s README describes it as tracking-free. StopSpoiling’s proposal targets a free, open-source extension without browsing-history collection; implementation must support that goal.

### Development References

- Chrome content scripts: reading and modifying web pages for filtering.
- TheSportsDB API documentation: sports schedule endpoints, authentication, and access limits.
- PandaScore API documentation: esports fixtures, opponents, and scheduled times.
- PandaScore pricing: currently lists a free schedules/results plan with 1,000 requests per hour. Confirm both providers’ coverage, terms, and limits before integration.

## Required Resources

- [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts): reading and modifying web pages for filtering.
- [TheSportsDB API documentation](https://www.thesportsdb.com/documentation): sports schedule endpoints, authentication, and access limits.
- [PandaScore API documentation](https://developers.pandascore.co/docs/introduction): esports fixtures, opponents, and scheduled times.
- [PandaScore pricing](https://www.pandascore.co/pricing): currently lists a free schedules/results plan with 1,000 requests per hour. Confirm both providers' coverage, terms, and limits before integration.

## Contributors

- [Samuel Kritz](https://github.com/samuel-kritz)
- [Caleb Chung](https://github.com/Mythicalhoppa)
- [Daniel Bicalho](https://github.com/dbicalho1)
- [Davit Sagrishvili](https://github.com/davethebuilder36)
- [Elison Koltraka](https://github.com/elisonkk)
