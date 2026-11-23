import type { RawEvent } from "./provider.js";
import type { GameStatus, ScheduleGame } from "./schedule-types.js";
import { teamIdFromName } from "./team-ids.temp.js";

export interface Skipped {
  eventId: string | null;
  reason: string; // never contains scores
}

export interface NormalizeResult {
  games: ScheduleGame[];
  skipped: Skipped[];
}

const TIMESTAMP = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(:\d{2})?(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/;

/** Parses a provider time into "YYYY-MM-DDTHH:MM:SSZ". A time with no zone is treated as UTC. */
export function parseUtc(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const m = raw.trim().match(TIMESTAMP);
  if (!m) return null;
  const [, date, hm, sec = ":00", zone = "Z"] = m;
  const fixedZone = zone === "Z" || zone.includes(":") ? zone : `${zone.slice(0, 3)}:${zone.slice(3)}`;
  const d = new Date(`${date}T${hm}${sec}${fixedZone}`);
  if (Number.isNaN(d.getTime())) return null;
  const iso = d.toISOString();
  if (fixedZone === "Z" && iso.slice(0, 16) !== `${date}T${hm}`) return null; // e.g. Feb 30
  return `${iso.slice(0, 19)}Z`;
}

export function startTimeOf(ev: RawEvent): string | null {
  const fromTimestamp = parseUtc(ev.strTimestamp);
  if (fromTimestamp) return fromTimestamp;
  if (ev.dateEvent && ev.strTime) return parseUtc(`${ev.dateEvent}T${ev.strTime}`);
  return null;
}

export function statusOf(ev: RawEvent): GameStatus {
  const s = (ev.strStatus ?? "").trim().toLowerCase();
  if (ev.strPostponed?.toLowerCase() === "yes" || s.includes("postpon") || s === "pst") return "postponed";
  if (s.includes("cancel") || s === "canc") return "canceled";
  return "scheduled";
}

const rank = (g: ScheduleGame) => (g.status !== "scheduled" ? 2 : g.startTimeUtc ? 1 : 0);

export function normalizeEvents(events: RawEvent[]): NormalizeResult {
  const byId = new Map<string, ScheduleGame>();
  const seenMatchups = new Map<string, string>();
  const skipped: Skipped[] = [];

  for (const ev of events) {
    const eventId = typeof ev.idEvent === "string" && /^\d+$/.test(ev.idEvent) ? ev.idEvent : null;
    if (!eventId) {
      skipped.push({ eventId: null, reason: "missing or invalid event id" });
      continue;
    }
    const homeTeamId = teamIdFromName(ev.strHomeTeam);
    const awayTeamId = teamIdFromName(ev.strAwayTeam);
    if (!homeTeamId || !awayTeamId) {
      skipped.push({ eventId, reason: `unknown team: ${ev.strHomeTeam ?? "?"} / ${ev.strAwayTeam ?? "?"}` });
      continue;
    }
    if (homeTeamId === awayTeamId) {
      skipped.push({ eventId, reason: "home and away team are the same" });
      continue;
    }
    const status = statusOf(ev);
    const startTimeUtc = startTimeOf(ev);
    if (status === "scheduled" && !startTimeUtc) {
      skipped.push({ eventId, reason: "no usable start time" }); // never invent a playable time
      continue;
    }

    // Only these fields are copied, so scores and results can never reach the output.
    const game: ScheduleGame = {
      id: `tsdb:${eventId}`,
      league: "NBA",
      homeTeamId,
      awayTeamId,
      startTimeUtc,
      status,
    };

    const existing = byId.get(game.id);
    if (existing) {
      skipped.push({ eventId, reason: "duplicate event id" });
      if (rank(game) > rank(existing)) byId.set(game.id, game);
      continue;
    }
    const matchupKey = startTimeUtc ? `${homeTeamId}|${awayTeamId}|${startTimeUtc}` : null;
    if (matchupKey && seenMatchups.has(matchupKey)) {
      skipped.push({ eventId, reason: `duplicate of ${seenMatchups.get(matchupKey)}` });
      continue;
    }
    if (matchupKey) seenMatchups.set(matchupKey, game.id);
    byId.set(game.id, game);
  }

  const games = [...byId.values()].sort((a, b) => {
    if (a.startTimeUtc === b.startTimeUtc) return a.id.localeCompare(b.id);
    if (a.startTimeUtc === null) return 1;
    if (b.startTimeUtc === null) return -1;
    return a.startTimeUtc.localeCompare(b.startTimeUtc);
  });
  return { games, skipped };
}