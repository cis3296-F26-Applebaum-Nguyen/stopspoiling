import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { Schedule } from "./schedule-types.js";
import { assertValidSchedule } from "./validate-output.js";

/** Validates, writes to a temp file, re-checks it, then swaps it in. The old file is untouched on any failure. */
export async function writeScheduleAtomically(path: string, schedule: Schedule): Promise<void> {
  assertValidSchedule(schedule);
  const target = resolve(path);
  await mkdir(dirname(target), { recursive: true });
  const tmp = `${target}.${process.pid}.tmp`;
  try {
    await writeFile(tmp, `${JSON.stringify(schedule, null, 2)}\n`, "utf8");
    assertValidSchedule(JSON.parse(await readFile(tmp, "utf8")));
    await rename(tmp, target);
  } catch (err) {
    await rm(tmp, { force: true });
    throw err;
  }
}