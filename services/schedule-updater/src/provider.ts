import type { Config } from "./config.js";
import { redact } from "./redact.js";

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export interface RawEvent {
  idEvent?: string | null;
  idHomeTeam?: string | null;
  idAwayTeam?: string | null;
  strHomeTeam?: string | null;
  strAwayTeam?: string | null;
  strTimestamp?: string | null;
  dateEvent?: string | null;
  strTime?: string | null;
  strStatus?: string | null;
  strPostponed?: string | null;
  [key: string]: unknown; // scores etc. may be present; the normalizer ignores them
}

export interface FetchDeps {
  fetchFn?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Seconds from a Retry-After header, as milliseconds (capped at 90 s). */
function retryAfterMs(header: string | null): number | undefined {
  const seconds = Number(header);
  return Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds * 1000, 90_000) : undefined;
}

export async function fetchEvents(
  cfg: Config,
  endpoint: string,
  params: Record<string, string>,
  deps: FetchDeps = {},
): Promise<RawEvent[]> {
  const fetchFn = deps.fetchFn ?? fetch;
  const sleep = deps.sleep ?? defaultSleep;
  const qs = new URLSearchParams(params).toString();
  const url = `${cfg.baseUrl}/${cfg.apiKey}/${endpoint}?${qs}`;
  const label = `${endpoint}?${qs}`; // safe to log: contains no key

  let lastError = "unknown error";
  for (let attempt = 1; attempt <= 3; attempt++) {
    let waitMs = attempt * 2000;
    try {
      const res = await fetchFn(url, { signal: AbortSignal.timeout(15_000) });
      if (res.status === 429 || res.status >= 500) {
        lastError = `HTTP ${res.status}`;
        if (res.status === 429) waitMs = retryAfterMs(res.headers.get("retry-after")) ?? 30_000 * attempt;
      } else if (!res.ok) {
        throw new ProviderError(`${label} failed with HTTP ${res.status}`, res.status);
      } else {
        let body: unknown;
        try {
          body = await res.json();
        } catch {
          throw new ProviderError(`${label} returned something that is not JSON`);
        }
        const events = (body as { events?: unknown } | null)?.events;
        if (events === null) return []; // the provider's way of saying "no games"
        if (!Array.isArray(events)) {
          throw new ProviderError(`${label} returned an unexpected shape (no "events" array)`);
        }
        return events as RawEvent[];
      }
    } catch (err) {
      if (err instanceof ProviderError) throw err;
      lastError = redact(err instanceof Error ? err.message : String(err), cfg.apiKey);
    }
    if (attempt < 3) await sleep(waitMs);
  }
  throw new ProviderError(`${label} failed after 3 attempts: ${lastError}`);
}