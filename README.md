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

What you need to work on StopSpoiling, and how to set up from a fresh clone. Anything marked **Planned** depends on code that doesn't exist yet, so no commands are listed for it until the linked issue is done.

**Status key:** **Works today** means the steps run on a fresh clone. **Planned (#n)** means it depends on issue n.

### What you need

| Need | Details | Status |
| --- | --- | --- |
| Git and a GitHub account | Access to the `cis3296-F26-Applebaum-Nguyen/stopspoiling` repository | Works today |
| Node.js 20 LTS | Docusaurus 3.9.2 needs Node 20 or newer, and CI and the dev container use Node 20 | Works today |
| yarn 1.22.22 | The only package manager we use. `documentation/package.json` pins the version | Works today |
| Dev container (optional) | `.devcontainer/` is a Node 20 environment that installs the docs site dependencies | Works today |
| Google Chrome (current stable) | Where the extension runs. Chrome only, Manifest V3 | Planned (#8) |
| Schedule API key | Only for whoever runs the schedule updater locally. The extension itself never holds a key | Planned (#11) |

Everything runs on an ordinary laptop. No special hardware is needed.

### Set up from a fresh clone

**Works today (documentation site):**

```bash
git clone https://github.com/cis3296-F26-Applebaum-Nguyen/stopspoiling.git
cd stopspoiling
corepack enable
cd documentation
yarn install
yarn start
```

`yarn start` serves the docs site locally and prints the address to open. `yarn build` makes a production build, which is a good check before you open a pull request. The published site is at https://cis3296-f26-applebaum-nguyen.github.io/stopspoiling/ and updates when a pull request is merged into `main`.

Check your Node version with `node -v` (20 or newer). Corepack comes with Node 20, 22 and 24 but not with Node 25 or later. If `corepack enable` isn't found, install yarn directly with `npm install -g yarn@1.22.22`.

**Planned (#13, #8): install, build and run the extension.** There is no extension code yet. The install and build commands, and the name of the build output folder, will be added here when the monorepo and extension starter are merged.

### Load the extension in Chrome

**Planned (#8).** These are Chrome's standard steps for an unpacked extension. They will work once a build exists:

1. Build the extension (command to be added when #8 is done).
2. Open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose the build output folder.
4. After a code change, rebuild, then click the reload (circular arrow) button on the extension's card in `chrome://extensions`. If you changed the content script, also refresh the page you are testing.

### Settings and API keys

- **Extension settings** (favorite teams, paused sites, watched games) are kept in Chrome's extension storage in your own browser. Nothing is committed to the repository.
- **API keys are never committed and never go into the extension.** For local runs of the schedule updater, keep them in a `.env.local` file in the repository root. `.gitignore` already ignores that file. The updater will read keys from environment variables. **Planned (#11).**
- **On GitHub Actions**, keys are stored as repository secrets, for example `THESPORTSDB_API_KEY` (proposed name). A `PANDASCORE_API_KEY` is only needed if we add esports. **Planned.**
- A **sample schedule JSON file** will let you develop the popup and background worker without any API key. **Planned (#11).**

### Reference docs

- [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts): reading and modifying web pages for filtering.
- [Load an unpacked extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked): Chrome's own steps for the section above.
- [TheSportsDB API documentation](https://www.thesportsdb.com/documentation): sports schedule endpoints, authentication, and access limits.
- [PandaScore API documentation](https://developers.pandascore.co/docs/introduction): esports fixtures, opponents, and scheduled times.
- [PandaScore pricing](https://www.pandascore.co/pricing): currently lists a free schedules/results plan with 1,000 requests per hour. Confirm both providers' coverage, terms, and limits before integration.

## Contributors

- [Samuel Kritz](https://github.com/samuel-kritz)
- [Caleb Chung](https://github.com/Mythicalhoppa)
- [Daniel Bicalho](https://github.com/dbicalho1)
- [Davit Sagrishvili](https://github.com/davethebuilder36)
- [Elison Koltraka](https://github.com/elisonkk)
