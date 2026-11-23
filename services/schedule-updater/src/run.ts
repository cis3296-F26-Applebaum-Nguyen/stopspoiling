import { collectEvents, type CollectDeps } from "./collect.js";
import type { Config } from "./config.js";
import { normalizeEvents, type Skipped } from "./normalize.js";
import type { Schedule } from "./schedule-types.js";
import { ValidationError } from "./validate-output.js";
import { writeScheduleAtomically } from "./write.js";

export type RunDeps = CollectDeps;

export interface RunSummary {
  fetched: number;
  written: number;
  skipped: Skipped[];
  warnings: string[];
  outputPath: string;
}

export async function runUpdate(cfg: Config, deps: RunDeps = {}): Promise<RunSummary> {
  const { events: raw, warnings } = await collectEvents(cfg, deps);
  const { games, skipped } = normalizeEvents(raw);
  if (games.length === 0) {
    throw new ValidationError([
      `no usable games found (provider returned ${raw.length} events); refusing to replace the previous file`,
    ]);
  }
  const now = deps.now?.() ?? new Date();
  const schedule: Schedule = {
    schemaVersion: 1,
    league: "NBA",
    generatedAt: `${now.toISOString().slice(0, 19)}Z`,
    games,
  };
  await writeScheduleAtomically(cfg.outputPath, schedule);
  return { fetched: raw.length, written: games.length, skipped, warnings, outputPath: cfg.outputPath };
}