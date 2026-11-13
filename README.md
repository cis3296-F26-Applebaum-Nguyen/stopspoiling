<div align="center">

# Project Name

Brief project tagline.

</div>

## Project Abstract

Explain problem, intended users, and proposed solution.

## High-Level Requirements

Summarize core capabilities from user perspective.

## Conceptual Design

Summarize software architecture, platforms, languages, and major integrations.

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
