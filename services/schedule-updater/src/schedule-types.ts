// TEMPORARY: to replace with imports from @stopspoiling/shared once #26 is merged.
export type GameStatus = "scheduled" | "postponed" | "canceled";

export interface ScheduleGame {
  id: string; // "tsdb:<idEvent>", stable even if the start time changes
  league: "NBA";
  homeTeamId: string; // e.g. "nba-phi"
  awayTeamId: string;
  startTimeUtc: string | null; // ISO UTC like 2026-11-24T00:30:00Z
  status: GameStatus;
}

export interface Schedule {
  schemaVersion: 1;
  league: "NBA";
  generatedAt: string;
  games: ScheduleGame[];
}