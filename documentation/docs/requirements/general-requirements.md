---
sidebar_position: 3
---

# General Requirements

This page documents the general requirements for the StopSpoiling project.

## Technology Stack

| Area | Technology |
| --- | --- |
| Language | TypeScript for the extension, the schedule updater, and shared types |
| Extension platform | Chrome Extensions, Manifest V3 (content scripts, background service worker, `chrome.storage`, `chrome.alarms`) |
| Popup | React, built with Vite |
| Schedule updater | Node.js, run on a schedule by GitHub Actions |
| Schedule hosting | GitHub Pages (`schedule.json`) |
| Data validation | Zod, for checking the shared game format |
| Sports data | TheSportsDB API |
| Esports data | PandaScore API |
| Testing | Vitest (unit tests), Playwright (end-to-end tests in Chrome), GitHub Actions (runs tests on pull requests) |
| Documentation | Docusaurus, published to GitHub Pages |

## Platform Compatibility

- **Browser:** Google Chrome on desktop, using Manifest V3. Other Chromium-based browsers are not a target for the first version.
- **Operating systems:** any desktop system that runs Chrome, such as Windows, macOS, Linux, and ChromeOS.
- **Mobile:** not supported. Chrome on phones does not run extensions.
- **Websites tested:** YouTube, Google Search, Reddit, X, and ESPN. The extension is planned to run on other sites too, but these five are the ones the team will test.
- **Supported leagues and games:** NBA. Other sports are out of scope for the first version.

## Legal and Regulatory Standards

- **Privacy:** pages are checked inside the user's browser. The extension must not collect or send browsing history, page content, or personal data to the team or anyone else. The only planned network request is downloading `schedule.json` from GitHub Pages.
- **Data provider terms:** the team must follow TheSportsDB's and PandaScore's terms of use and rate limits, and give credit to them if their terms ask for it.
- **API keys:** keys are stored only in GitHub Actions secrets. They must never be committed to the repo or included in the extension.
- **Chrome Web Store:** if the extension is published, it must follow the Chrome Web Store developer program policies, including asking only for the permissions it needs.
- **Open source:** the team will respect the licenses of any libraries it uses. No code from closed-source products will be used, and code from open-source projects such as StopSpoiling will not be copied.

## Other Operational Constraints

- **Budget:** no paid services. The project uses free API plans, free GitHub Actions and Pages, and free development tools.
- **Hardware:** any laptop works. Nothing outside the standard Computer Science Department lab resources is needed.
- **API limits:** the free API plans have request limits, and TheSportsDB's free key returns limited results on some calls. Only the schedule updater calls the APIs. The extension never calls them directly.
- **Schedule updates:** the background service worker downloads the schedule every three hours. If a download fails, the extension keeps using the last saved schedule.
- **Network:** the user needs an internet connection to get new schedules.
- **Team and time:** a team of five building during one semester, so the first version is limited to the leagues and games listed above.
