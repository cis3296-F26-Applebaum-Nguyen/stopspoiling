export class ConfigError extends Error {}

export interface Config {
  apiKey: string;
  baseUrl: string;
  leagueId: string;
  outputPath: string;
  recentDays: number;
  upcomingDays: number;
  requestDelayMs: number;
}

function intEnv(env: NodeJS.ProcessEnv, name: string, fallback: number, min: number, max: number): number {
  const raw = env[name];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new ConfigError(`${name} must be an integer from ${min} to ${max} (got "${raw}")`);
  }
  return n;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const apiKey = env.THESPORTSDB_API_KEY?.trim();
  if (!apiKey) {
    throw new ConfigError("THESPORTSDB_API_KEY is not set. Copy .env.example to .env and add your key.");
  }
  return {
    apiKey,
    baseUrl: "https://www.thesportsdb.com/api/v1/json",
    leagueId: "4387", // NBA
    outputPath: env.SCHEDULE_OUTPUT_PATH?.trim() || "./out/schedule.json",
    // Window sizes are provisional until #32 settles the spoiler-window range.
    recentDays: intEnv(env, "SCHEDULE_RECENT_DAYS", 7, 1, 30),
    upcomingDays: intEnv(env, "SCHEDULE_UPCOMING_DAYS", 14, 1, 30),
    // The free key allows 30 requests per minute, so 2.1 s apart is safe.
    requestDelayMs: intEnv(env, "SCHEDULE_REQUEST_DELAY_MS", 2100, 0, 10000),
  };
}