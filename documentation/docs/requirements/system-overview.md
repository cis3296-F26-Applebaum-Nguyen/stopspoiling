---
sidebar_position: 1
---

# System Overview
- Explain the project's goals, what the application will accomplish, and why users should use it.
- Include a project abstract, top-level requirements, conceptual design, required resources, and background references.
- Compare your approach to similar products or projects in plain, professional language.

StopSpoilers can blur out sports scores in a web browser.  Many fans wait until they get home from work to watch a game, and there's nothing worse than accidentally ruining the result when you've waited all day to watch your team.  It's also useful for fans in different time zones that don't watch sports live, or for people who simply wait until the end of a game to skip commercials and don't want spoilers.  


## Purpose

Replace this section with an initial description of the project goals. Explain what the application will accomplish, why a user should use it, and why this approach is better suited to the problem than existing alternatives.

## Project Abstract

Replace this section with a concise project description. Include the top-level requirements, conceptual design, and background references to similar products.

Keep the abstract direct and professional. Avoid framing the project as a class assignment, team biography, sales pitch, or generic AI-written marketing copy.

## Top-Level Requirements

Describe what the product does and how it does it from the user's point of view at a high level.

## Conceptual Design

Describe the initial design concept, including hardware or software architecture, programming language, operating system, frameworks, services, or major technical choices.

## Required Resources

**Background knowledge.** The team needs working knowledge of TypeScript, React, and Chrome extension development with Manifest V3: content scripts, service workers, and `chrome.storage`. We also need `MutationObserver` for pages that load more content as you scroll. Several of us are still learning these, so early tickets include time to learn them.

**Hardware.** A laptop that can run current Google Chrome and Node.js. Nothing beyond the standard Computer Science Department lab resources is required.

**Software.** Node.js 20 LTS, yarn 1.22.22, Git, and Chrome. The extension is written in TypeScript with a React popup. We plan to use Vitest for unit tests and Playwright for end-to-end tests. This documentation site is built with Docusaurus and uses Mermaid for diagrams.

**Accounts and services.** A GitHub account with access to the team repository, which also provides GitHub Actions to refresh the schedule and GitHub Pages to publish the documentation. The schedule comes from a sports data provider (TheSportsDB, and PandaScore only if we add esports). Its API keys are stored as GitHub Actions secrets and are never committed to the repository or shipped in the extension. A Chrome Web Store developer account (small one-time fee) is only needed if we decide to publish.

**Outside the standard lab resources.** The only outside services are the schedule APIs. We still need to confirm their free-tier coverage and limits before relying on them.

Step-by-step setup, including how to load the extension in Chrome, is in the [README](https://github.com/cis3296-F26-Applebaum-Nguyen/stopspoiling#required-resources). Steps that depend on code we haven't written yet are marked as planned there.

## Background & References

Describe similar products or projects and cite your sources. If similar open-source projects exist, state whether your team will use existing source and to what extent. If similar closed-source products exist, explain how your project is similar and different.
