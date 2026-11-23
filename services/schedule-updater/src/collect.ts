import type { Config } from "./config.js";
import { fetchEvents, type FetchDeps, type RawEvent } from "./provider.js";

export interface CollectDeps extends FetchDeps {
  now?: () => Date;
}

export interface Collected {
  events: RawEvent[];
  warnings: string[];
}

const SUSPECTED_FREE_TIER_DAY_CAP = 3;

/** UTC dates from `recentDays` ago through `upcomingDays` ahead, as YYYY-MM-DD. */
export function windowDates(now: Date, recentDays: number, upcomingDays: number): string[] {
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dates: string[] = [];
  for (let offset = -recentDays; offset <= upcomingDays; offset++) {
    dates.push(new Date(start + offset * 86_400_000).toISOString().slice(0, 10));
  }
  return dates;
}

export async function collectEvents(cfg: Config, deps: CollectDeps = {}): Promise<Collected> {
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const dates = windowDates(deps.now?.() ?? new Date(), cfg.recentDays, cfg.upcomingDays);
  const events: RawEvent[] = [];
  const warnings: string[] = [];

  for (const [i, date] of dates.entries()) {
    if (i > 0 && cfg.requestDelayMs > 0) await sleep(cfg.requestDelayMs);
    const day = await fetchEvents(cfg, "eventsday.php", { d: date, l: cfg.leagueId }, deps);
    if (day.length === SUSPECTED_FREE_TIER_DAY_CAP) {
      warnings.push(`${date}: exactly ${day.length} events returned, which may be a provider limit (some games could be missing)`);
    }
    events.push(...day);
  }
  return { events, warnings };
}