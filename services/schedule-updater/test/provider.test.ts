import { describe, expect, it } from "vitest";
import { collectEvents, windowDates } from "../src/collect.js";
import { ConfigError, loadConfig } from "../src/config.js";
import { fetchEvents, ProviderError } from "../src/provider.js";
import { failure, json, KEY, makeEvent, recordSleeps, sequence, testConfig, thrown } from "./helpers.js";

const cfg = testConfig();
const request = () => ({ d: "2026-11-24", l: "4387" });

describe("fetchEvents", () => {
  it("returns the events array and puts the key only in the request", async () => {
    const { fetchFn, urls } = sequence(json({ events: [{ idEvent: "1" }] }));
    const events = await fetchEvents(cfg, "eventsday.php", request(), { fetchFn, sleep: recordSleeps().sleep });
    expect(events).toEqual([{ idEvent: "1" }]);
    expect(urls[0]).toContain(`/${KEY}/eventsday.php?d=2026-11-24&l=4387`);
  });

  it("treats events: null as no games", async () => {
    const { fetchFn } = sequence(json({ events: null }));
    expect(await fetchEvents(cfg, "eventsday.php", request(), { fetchFn })).toEqual([]);
  });

  it("retries server errors and then succeeds", async () => {
    const { fetchFn } = sequence(json({}, 500), json({ events: [] }));
    const { sleep, waits } = recordSleeps();
    expect(await fetchEvents(cfg, "eventsday.php", request(), { fetchFn, sleep })).toEqual([]);
    expect(waits).toEqual([2000]);
  });

  it("waits as long as Retry-After says after a 429", async () => {
    const { fetchFn } = sequence(json({}, 429, { "retry-after": "7" }), json({ events: [] }));
    const { sleep, waits } = recordSleeps();
    await fetchEvents(cfg, "eventsday.php", request(), { fetchFn, sleep });
    expect(waits).toEqual([7000]);
  });

  it("backs off 30 seconds after a 429 with no hint", async () => {
    const { fetchFn } = sequence(json({}, 429), json({ events: [] }));
    const { sleep, waits } = recordSleeps();
    await fetchEvents(cfg, "eventsday.php", request(), { fetchFn, sleep });
    expect(waits).toEqual([30000]);
  });

  it("gives up after 3 attempts", async () => {
    const { fetchFn, urls } = sequence(json({}, 500));
    const { sleep, waits } = recordSleeps();
    const error = await failure(fetchEvents(cfg, "eventsday.php", request(), { fetchFn, sleep }));
    expect(error).toBeInstanceOf(ProviderError);
    expect(error.message).toContain("after 3 attempts");
    expect(urls).toHaveLength(3);
    expect(waits).toEqual([2000, 4000]);
  });

  it("does not retry other HTTP errors, and the message has no key", async () => {
    const { fetchFn, urls } = sequence(json({}, 404));
    const error = await failure(fetchEvents(cfg, "eventsday.php", request(), { fetchFn, sleep: recordSleeps().sleep }));
    expect(error).toBeInstanceOf(ProviderError);
    expect((error as ProviderError).status).toBe(404);
    expect(error.message).not.toContain(KEY);
    expect(urls).toHaveLength(1);
  });

  it("rejects a reply that is not JSON", async () => {
    const { fetchFn } = sequence(new Response("<html>oops</html>", { status: 200 }));
    const error = await failure(fetchEvents(cfg, "eventsday.php", request(), { fetchFn }));
    expect(error.message).toContain("not JSON");
  });

  it("rejects an unexpected shape", async () => {
    const { fetchFn } = sequence(json({ results: [] }));
    const error = await failure(fetchEvents(cfg, "eventsday.php", request(), { fetchFn }));
    expect(error.message).toContain("unexpected shape");
  });

  it("never puts the API key in an error message", async () => {
    const leaky = new Error(`connect failed for https://example.test/api/${KEY}/eventsday.php`);
    const { fetchFn } = sequence(leaky);
    const error = await failure(fetchEvents(cfg, "eventsday.php", request(), { fetchFn, sleep: recordSleeps().sleep }));
    expect(error.message).not.toContain(KEY);
    expect(error.message).toContain("***");
  });
});

describe("windowDates", () => {
  it("covers recent and upcoming days in UTC", () => {
    expect(windowDates(new Date("2026-11-23T19:40:00Z"), 1, 2)).toEqual([
      "2026-11-22",
      "2026-11-23",
      "2026-11-24",
      "2026-11-25",
    ]);
  });
  it("crosses month ends", () => {
    expect(windowDates(new Date("2026-11-30T23:59:00Z"), 1, 1)).toEqual(["2026-11-29", "2026-11-30", "2026-12-01"]);
  });
  it("uses the UTC date even late in the evening in New York", () => {
    expect(windowDates(new Date("2026-11-24T03:00:00Z"), 0, 0)).toEqual(["2026-11-24"]);
  });
});

describe("collectEvents", () => {
  const now = () => new Date("2026-11-23T19:40:00Z");

  it("asks for each day, pauses between requests, and flags a possible cap", async () => {
    const three = [makeEvent({ idEvent: "1" }), makeEvent({ idEvent: "2" }), makeEvent({ idEvent: "3" })];
    const { fetchFn, urls } = sequence(json({ events: three }));
    const { sleep, waits } = recordSleeps();
    const result = await collectEvents(testConfig({ requestDelayMs: 50 }), { fetchFn, sleep, now });
    expect(urls).toHaveLength(3);
    expect(urls[0]).toContain("d=2026-11-22");
    expect(urls[2]).toContain("d=2026-11-24");
    expect(waits).toEqual([50, 50]);
    expect(result.events).toHaveLength(9);
    expect(result.warnings).toHaveLength(3);
  });

  it("does not warn when a day has fewer events", async () => {
    const { fetchFn } = sequence(json({ events: [makeEvent()] }));
    const result = await collectEvents(testConfig(), { fetchFn, sleep: recordSleeps().sleep, now });
    expect(result.warnings).toEqual([]);
  });
});

describe("loadConfig", () => {
  it("requires the API key", () => {
    const error = thrown(() => loadConfig({}));
    expect(error).toBeInstanceOf(ConfigError);
    expect((error as Error).message).toContain("THESPORTSDB_API_KEY");
  });
  it("applies defaults and trims the key", () => {
    const c = loadConfig({ THESPORTSDB_API_KEY: " abc " });
    expect(c.apiKey).toBe("abc");
    expect(c.leagueId).toBe("4387");
    expect(c.outputPath).toBe("./out/schedule.json");
    expect(c.recentDays).toBe(7);
    expect(c.upcomingDays).toBe(14);
    expect(c.requestDelayMs).toBe(2100);
  });
  it("rejects bad numbers", () => {
    const error = thrown(() => loadConfig({ THESPORTSDB_API_KEY: "k", SCHEDULE_RECENT_DAYS: "abc" }));
    expect(error).toBeInstanceOf(ConfigError);
    expect((error as Error).message).toContain("SCHEDULE_RECENT_DAYS");
  });
});