import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { findProblems } from "../src/validate-output.js";

const sample = JSON.parse(readFileSync(new URL("../sample/schedule.sample.json", import.meta.url), "utf8"));

function problemsAfter(change: (schedule: any) => void): string[] {
  const copy = structuredClone(sample);
  change(copy);
  return findProblems(copy);
}

describe("sample file", () => {
  it("is valid", () => {
    expect(findProblems(sample)).toEqual([]);
  });
  it("covers the cases teammates need offline", () => {
    const statuses = sample.games.map((g: any) => g.status);
    expect(statuses).toContain("postponed");
    expect(statuses).toContain("canceled");
    const teams: string[] = sample.games.flatMap((g: any) => [g.homeTeamId, g.awayTeamId]);
    const repeated = teams.filter((t, i) => teams.indexOf(t) !== i);
    expect(repeated.length).toBeGreaterThan(0);
    const ids = sample.games.map((g: any) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("findProblems", () => {
  it("accepts a valid empty schedule", () => {
    expect(problemsAfter((s) => (s.games = []))).toEqual([]);
  });
  it("rejects score fields", () => {
    expect(problemsAfter((s) => (s.games[0].homeScore = 101)).join()).toContain("not an allowed field");
  });
  it("rejects a missing ID", () => {
    expect(problemsAfter((s) => delete s.games[0].id).join()).toContain("id is missing or invalid");
  });
  it("rejects an invalid date", () => {
    expect(problemsAfter((s) => (s.games[0].startTimeUtc = "2026-02-30T00:00:00Z")).join()).toContain("startTimeUtc");
  });
  it("rejects invalid team data", () => {
    expect(problemsAfter((s) => (s.games[0].homeTeamId = "phi")).join()).toContain("homeTeamId");
  });
  it("rejects duplicate IDs", () => {
    expect(problemsAfter((s) => (s.games[1].id = s.games[0].id)).join()).toContain("duplicate");
  });
  it("requires a time for scheduled games", () => {
    expect(problemsAfter((s) => (s.games[0].startTimeUtc = null)).join()).toContain("required for scheduled");
  });
  it("rejects games that are not an array", () => {
    expect(problemsAfter((s) => (s.games = "nope")).join()).toContain("games must be an array");
  });
});