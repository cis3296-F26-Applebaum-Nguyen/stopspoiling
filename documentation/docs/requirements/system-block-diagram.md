---
sidebar_position: 2
---

# System Block Diagram

:::caution Starter content - Requirements assignment
This page is not ready for submission until your team replaces this starter outline with a project-specific system block diagram and removes this callout.

- Show the major functional blocks of the system and how they interact.
- Include enough technical detail to communicate the chosen architecture and tech stack.
- Explain the flow of data, signals, or control between blocks.
:::

## System Block Diagram

Replace this section with a high-level flowchart or diagram of the major components of your system. Mermaid is preferred when it communicates the system clearly because it is easy to update in version control.

```mermaid
flowchart LR
  subgraph GH[GitHub]
    A[Schedule Updater<br/>Node + TS<br/>GitHub Actions cron] -->|writes| B[(schedule.json<br/>GitHub Pages)]
  end
  APIs[(Sports data APIs<br/>TheSportsDB / ESPN)] --> A
  subgraph EXT[Chrome Extension - MV3]
    C[Service Worker<br/>fetch + cache schedule<br/>alarms]
    D[(chrome.storage<br/>sync: settings<br/>local: schedule, watched)]
    E[Popup + Options<br/>React]
    F[Content Script<br/>MutationObserver<br/>Site Adapter + Blur]
    G[Matching Engine<br/>pure TS]
  end
  B -->|fetch every 3h| C
  C --> D
  E <--> D
  D -->|onChanged| F
  F --> G
  F -->|blur / reveal| W[Web pages]
```

## Component Notes

Describe each major block, such as user interfaces, services, hardware modules, databases, or external systems.

## Interconnections

Explain what each line or arrow represents, including data flow, control flow, external requests, or hardware signals.
