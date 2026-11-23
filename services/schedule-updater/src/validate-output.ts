import { parseUtc } from "./normalize.js";
import type { Schedule } from "./schedule-types.js";

const GAME_ID = /^[a-z0-9]+:[A-Za-z0-9_-]+$/;
const TEAM_ID = /^nba-[a-z]{3}$/;
const GAME_KEYS = new Set(["id", "league", "homeTeamId", "awayTeamId", "startTimeUtc", "status"]);
const STATUSES = new Set(["scheduled", "postponed", "canceled"]);

export class ValidationError extends Error {
  constructor(readonly problems: string[]) {
    super(`Schedule failed validation:\n - ${problems.slice(0, 20).join("\n - ")}`);
    this.name = "ValidationError";
  }
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export function findProblems(value: unknown): string[] {
  if (!isObj(value)) return ["schedule must be an object"];
  const problems: string[] = [];
  if (value.schemaVersion !== 1) problems.push("schemaVersion must be 1");
  if (value.league !== "NBA") problems.push('league must be "NBA"');
  if (typeof value.generatedAt !== "string" || parseUtc(value.generatedAt) !== value.generatedAt) {
    problems.push("generatedAt must be a valid UTC timestamp");
  }
  if (!Array.isArray(value.games)) {
    problems.push("games must be an array");
    return problems;
  }
  const seen = new Set<string>();
  value.games.forEach((g: unknown, i: number) => {
    const at = `games[${i}]`;
    if (!isObj(g)) {
      problems.push(`${at} must be an object`);
      return;
    }
    for (const k of Object.keys(g)) {
      if (!GAME_KEYS.has(k)) problems.push(`${at}.${k} is not an allowed field (no scores or results)`);
    }
    if (typeof g.id !== "string" || !GAME_ID.test(g.id)) {
      problems.push(`${at}.id is missing or invalid`);
    } else if (seen.has(g.id)) {
      problems.push(`${at}.id is a duplicate: ${g.id}`);
    } else {
      seen.add(g.id);
    }
    if (g.league !== "NBA") problems.push(`${at}.league must be "NBA"`);
    for (const k of ["homeTeamId", "awayTeamId"] as const) {
      const team = g[k];
      if (typeof team !== "string" || !TEAM_ID.test(team)) problems.push(`${at}.${k} is invalid`);
    }
    if (g.homeTeamId === g.awayTeamId) problems.push(`${at} has the same home and away team`);
    if (typeof g.status !== "string" || !STATUSES.has(g.status)) {
      problems.push(`${at}.status must be scheduled, postponed or canceled`);
    }
    const start = g.startTimeUtc;
    if (start === null) {
      if (g.status === "scheduled") problems.push(`${at}.startTimeUtc is required for scheduled games`);
    } else if (typeof start !== "string" || parseUtc(start) !== start) {
      problems.push(`${at}.startTimeUtc must be a valid UTC time like 2026-11-24T00:30:00Z`);
    }
  });
  return problems;
}

export function assertValidSchedule(value: unknown): asserts value is Schedule {
  const problems = findProblems(value);
  if (problems.length > 0) throw new ValidationError(problems);
}