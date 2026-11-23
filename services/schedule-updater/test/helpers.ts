import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Config } from "../src/config.js";
import type { RawEvent } from "../src/provider.js";

export const KEY = "SECRETKEY123";

export function testConfig(over: Partial<Config> = {}): Config {
  return {
    apiKey: KEY,
    baseUrl: "https://example.test/api",
    leagueId: "4387",
    outputPath: "./out/schedule.json",
    recentDays: 1,
    upcomingDays: 1,
    requestDelayMs: 0,
    ...over,
  };
}

/** A provider event with made-up scores, so tests can check the scores never leak. */
export function makeEvent(over: Partial<RawEvent> = {}): RawEvent {
  return {
    idEvent: "2601914",
    strHomeTeam: "Philadelphia 76ers",
    strAwayTeam: "Portland Trail Blazers",
    strTimestamp: "2026-11-24T00:00:00",
    dateEvent: "2026-11-24",
    strTime: "00:00:00",
    strStatus: "NS",
    strPostponed: "no",
    intHomeScore: "777",
    intAwayScore: "888",
    ...over,
  };
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

/** A fake fetch that returns the given responses in order (the last one repeats) and records the URLs. */
export function sequence(...responses: Array<Response | Error>): { fetchFn: typeof fetch; urls: string[] } {
  const urls: string[] = [];
  let i = 0;
  const fetchFn = (async (input: string | URL | Request) => {
    urls.push(String(input));
    const next = responses[Math.min(i++, responses.length - 1)];
    if (next instanceof Error) throw next;
    return next.clone();
  }) as unknown as typeof fetch;
  return { fetchFn, urls };
}

/** A fake sleep that records how long it was asked to wait, without waiting. */
export function recordSleeps(): { sleep: (ms: number) => Promise<void>; waits: number[] } {
  const waits: number[] = [];
  return {
    waits,
    sleep: async (ms) => {
      waits.push(ms);
    },
  };
}

export async function failure(promise: Promise<unknown>): Promise<Error> {
  try {
    await promise;
  } catch (err) {
    return err as Error;
  }
  throw new Error("expected the promise to reject");
}

export function thrown(fn: () => unknown): unknown {
  try {
    fn();
  } catch (err) {
    return err;
  }
  return undefined;
}

export async function withTempDir(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(join(tmpdir(), "schedule-updater-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}