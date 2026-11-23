import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ProviderError } from "../src/provider.js";
import { runUpdate } from "../src/run.js";
import type { Schedule } from "../src/schedule-types.js";
import { findProblems, ValidationError } from "../src/validate-output.js";
import { writeScheduleAtomically } from "../src/write.js";
import { failure, json, makeEvent, recordSleeps, sequence, testConfig, withTempDir } from "./helpers.js";

const now = () => new Date("2026-11-23T19:40:00Z");
const PREVIOUS = "PREVIOUS GOOD FILE";

describe("runUpdate", () => {
  it("writes a valid schedule with no scores", async () => {
    await withTempDir(async (dir) => {
      const cfg = testConfig({ outputPath: join(dir, "schedule.json") });
      const events = [
        makeEvent(),
        makeEvent({ idEvent: "2601915", strHomeTeam: "Indiana Pacers", strAwayTeam: "Oklahoma City Thunder" }),
      ];
      const { fetchFn } = sequence(json({ events }));
      const summary = await runUpdate(cfg, { fetchFn, sleep: recordSleeps().sleep, now });
      const text = await readFile(cfg.outputPath, "utf8");
      expect(summary.written).toBe(2);
      expect(summary.fetched).toBe(6); // 3 days x 2 events; repeats are dropped as duplicates
      expect(findProblems(JSON.parse(text))).toEqual([]);
      expect(JSON.parse(text).generatedAt).toBe("2026-11-23T19:40:00Z");
      expect(text).not.toContain("777");
      expect(text).not.toContain("888");
    });
  });

  it("creates the output folder when it does not exist", async () => {
    await withTempDir(async (dir) => {
      const cfg = testConfig({ outputPath: join(dir, "nested", "out", "schedule.json") });
      const { fetchFn } = sequence(json({ events: [makeEvent()] }));
      await runUpdate(cfg, { fetchFn, sleep: recordSleeps().sleep, now });
      expect(findProblems(JSON.parse(await readFile(cfg.outputPath, "utf8")))).toEqual([]);
    });
  });

  it("leaves the previous file untouched when the provider keeps failing", async () => {
    await withTempDir(async (dir) => {
      const cfg = testConfig({ outputPath: join(dir, "schedule.json") });
      await writeFile(cfg.outputPath, PREVIOUS);
      const { fetchFn } = sequence(json({}, 500));
      const error = await failure(runUpdate(cfg, { fetchFn, sleep: recordSleeps().sleep, now }));
      expect(error).toBeInstanceOf(ProviderError);
      expect(await readFile(cfg.outputPath, "utf8")).toBe(PREVIOUS);
      expect(await readdir(dir)).toEqual(["schedule.json"]);
    });
  });

  it("refuses to replace a good file with an empty result", async () => {
    await withTempDir(async (dir) => {
      const cfg = testConfig({ outputPath: join(dir, "schedule.json") });
      await writeFile(cfg.outputPath, PREVIOUS);
      const { fetchFn } = sequence(json({ events: null }));
      const error = await failure(runUpdate(cfg, { fetchFn, sleep: recordSleeps().sleep, now }));
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toContain("no usable games");
      expect(await readFile(cfg.outputPath, "utf8")).toBe(PREVIOUS);
    });
  });

  it("refuses to publish when every event is unusable", async () => {
    await withTempDir(async (dir) => {
      const cfg = testConfig({ outputPath: join(dir, "schedule.json") });
      await writeFile(cfg.outputPath, PREVIOUS);
      const { fetchFn } = sequence(json({ events: [makeEvent({ strHomeTeam: "Nobody FC" })] }));
      const error = await failure(runUpdate(cfg, { fetchFn, sleep: recordSleeps().sleep, now }));
      expect(error).toBeInstanceOf(ValidationError);
      expect(await readFile(cfg.outputPath, "utf8")).toBe(PREVIOUS);
    });
  });
});

describe("writeScheduleAtomically", () => {
  it("refuses to write an invalid schedule and keeps the previous file", async () => {
    await withTempDir(async (dir) => {
      const target = join(dir, "schedule.json");
      await writeFile(target, PREVIOUS);
      const bad = {
        schemaVersion: 1,
        league: "NBA",
        generatedAt: "2026-11-23T19:40:00Z",
        games: [{ id: "bad id" }],
      } as unknown as Schedule;
      const error = await failure(writeScheduleAtomically(target, bad));
      expect(error).toBeInstanceOf(ValidationError);
      expect(await readFile(target, "utf8")).toBe(PREVIOUS);
      expect(await readdir(dir)).toEqual(["schedule.json"]);
    });
  });

  it("replaces an existing file with the new one", async () => {
    await withTempDir(async (dir) => {
      const target = join(dir, "schedule.json");
      await mkdir(dir, { recursive: true });
      await writeFile(target, PREVIOUS);
      const empty: Schedule = { schemaVersion: 1, league: "NBA", generatedAt: "2026-11-23T19:40:00Z", games: [] };
      await writeScheduleAtomically(target, empty);
      expect(JSON.parse(await readFile(target, "utf8")).games).toEqual([]);
      expect(await readdir(dir)).toEqual(["schedule.json"]);
    });
  });
});