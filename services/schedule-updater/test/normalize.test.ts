import { describe, expect, it } from "vitest";
import { normalizeEvents, parseUtc, startTimeOf, statusOf } from "../src/normalize.js";
import { makeEvent } from "./helpers.js";

describe("parseUtc", () => {
  it("treats a time with no zone as UTC", () => {
    expect(parseUtc("2026-11-24T00:30:00")).toBe("2026-11-24T00:30:00Z");
  });
  it("converts offsets to UTC", () => {
    expect(parseUtc("2026-11-23T19:30:00-05:00")).toBe("2026-11-24T00:30:00Z");
  });
  it("accepts a space separator and missing seconds", () => {
    expect(parseUtc("2026-11-24 00:30")).toBe("2026-11-24T00:30:00Z");
  });
  it("rejects impossible dates and junk", () => {
    expect(parseUtc("2026-02-30T00:00:00")).toBeNull();
    expect(parseUtc("junk")).toBeNull();
    expect(parseUtc("")).toBeNull();
    expect(parseUtc(null)).toBeNull();
    expect(parseUtc(undefined)).toBeNull();
  });
});

describe("startTimeOf", () => {
  it("falls back to the date and time fields", () => {
    expect(startTimeOf(makeEvent({ strTimestamp: null }))).toBe("2026-11-24T00:00:00Z");
  });
  it("returns null when there is no usable time", () => {
    expect(startTimeOf(makeEvent({ strTimestamp: null, strTime: null }))).toBeNull();
  });
});

describe("statusOf", () => {
  it("maps provider codes and words", () => {
    expect(statusOf(makeEvent({ strStatus: "NS" }))).toBe("scheduled");
    expect(statusOf(makeEvent({ strStatus: "FT" }))).toBe("scheduled");
    expect(statusOf(makeEvent({ strPostponed: "yes" }))).toBe("postponed");
    expect(statusOf(makeEvent({ strStatus: "PST" }))).toBe("postponed");
    expect(statusOf(makeEvent({ strStatus: "Postponed" }))).toBe("postponed");
    expect(statusOf(makeEvent({ strStatus: "Cancelled" }))).toBe("canceled");
    expect(statusOf(makeEvent({ strStatus: "CANC" }))).toBe("canceled");
  });
});

describe("normalizeEvents", () => {
  it("converts a provider event to the shared format", () => {
    const result = normalizeEvents([makeEvent()]);
    expect(result.games).toEqual([
      {
        id: "tsdb:2601914",
        league: "NBA",
        homeTeamId: "nba-phi",
        awayTeamId: "nba-por",
        startTimeUtc: "2026-11-24T00:00:00Z",
        status: "scheduled",
      },
    ]);
    expect(result.skipped).toEqual([]);
  });

  it("never copies scores", () => {
    const text = JSON.stringify(normalizeEvents([makeEvent()]).games);
    expect(text).not.toContain("777");
    expect(text).not.toContain("888");
    expect(text).not.toMatch(/score/i);
  });

  it("keeps the same ID when the start time changes", () => {
    const before = normalizeEvents([makeEvent()]).games[0];
    const after = normalizeEvents([makeEvent({ strTimestamp: "2026-11-25T01:00:00" })]).games[0];
    expect(after.id).toBe(before.id);
    expect(after.startTimeUtc).toBe("2026-11-25T01:00:00Z");
  });

  it("drops duplicate event IDs", () => {
    const result = normalizeEvents([makeEvent(), makeEvent()]);
    expect(result.games).toHaveLength(1);
    expect(result.skipped[0].reason).toContain("duplicate");
  });

  it("prefers the postponed copy of a duplicated event", () => {
    const result = normalizeEvents([
      makeEvent(),
      makeEvent({ strPostponed: "yes", strTimestamp: null, strTime: null }),
    ]);
    expect(result.games).toHaveLength(1);
    expect(result.games[0].status).toBe("postponed");
    expect(result.games[0].startTimeUtc).toBeNull();
  });

  it("drops the same matchup listed under two IDs", () => {
    const result = normalizeEvents([makeEvent(), makeEvent({ idEvent: "2601999" })]);
    expect(result.games).toHaveLength(1);
    expect(result.games[0].id).toBe("tsdb:2601914");
    expect(result.skipped[0].reason).toContain("duplicate of tsdb:2601914");
  });

  it("keeps postponed games without inventing a time", () => {
    const game = normalizeEvents([makeEvent({ strStatus: "Postponed", strTimestamp: null, strTime: null })]).games[0];
    expect(game.status).toBe("postponed");
    expect(game.startTimeUtc).toBeNull();
  });

  it("keeps canceled games", () => {
    const game = normalizeEvents([makeEvent({ strStatus: "CANC" })]).games[0];
    expect(game.status).toBe("canceled");
    expect(game.startTimeUtc).toBe("2026-11-24T00:00:00Z");
  });

  it("skips scheduled games with no usable time", () => {
    const result = normalizeEvents([makeEvent({ strTimestamp: null, strTime: null })]);
    expect(result.games).toHaveLength(0);
    expect(result.skipped[0].reason).toBe("no usable start time");
  });

  it("skips unknown teams and bad IDs", () => {
    const result = normalizeEvents([
      makeEvent({ strHomeTeam: "Nobody FC" }),
      makeEvent({ idEvent: "abc" }),
      makeEvent({ idEvent: null }),
    ]);
    expect(result.games).toHaveLength(0);
    expect(result.skipped).toHaveLength(3);
    expect(result.skipped[0].reason).toContain("unknown team");
    expect(result.skipped[1].reason).toBe("missing or invalid event id");
  });

  it("sorts by start time with games that have no time last", () => {
    const result = normalizeEvents([
      makeEvent({ idEvent: "3", strTimestamp: "2026-11-26T00:00:00" }),
      makeEvent({
        idEvent: "2",
        strHomeTeam: "Boston Celtics",
        strAwayTeam: "Miami Heat",
        strStatus: "Postponed",
        strTimestamp: null,
        strTime: null,
      }),
      makeEvent({ idEvent: "1", strTimestamp: "2026-11-22T00:00:00" }),
    ]);
    expect(result.games.map((g) => g.id)).toEqual(["tsdb:1", "tsdb:3", "tsdb:2"]);
  });
});