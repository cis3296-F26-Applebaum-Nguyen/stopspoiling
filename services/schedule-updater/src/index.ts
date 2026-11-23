import { ConfigError, loadConfig } from "./config.js";
import { ProviderError } from "./provider.js";
import { redact } from "./redact.js";
import { runUpdate } from "./run.js";
import { ValidationError } from "./validate-output.js";

// Exit codes: 0 ok, 2 configuration, 3 provider request, 4 validation, 1 anything else.
async function main(): Promise<number> {
  try {
    process.loadEnvFile(".env");
  } catch {
    // No .env file: use the real environment variables.
  }
  let apiKey = "";
  try {
    const cfg = loadConfig();
    apiKey = cfg.apiKey;
    const summary = await runUpdate(cfg);
    const duplicates = summary.skipped.filter((s) => s.reason.startsWith("duplicate")).length;
    console.log(
      `OK: wrote ${summary.written} games to ${summary.outputPath} ` +
        `(${summary.fetched} events fetched, ${duplicates} duplicates, ${summary.skipped.length - duplicates} skipped)`,
    );
        for (const w of summary.warnings) console.log(`  warning: ${w}`);
        
    for (const s of summary.skipped) {
      if (!s.reason.startsWith("duplicate")) console.log(`  skipped ${s.eventId ?? "?"}: ${s.reason}`);
    }
    return 0;
  } catch (err) {
    const message = redact(err instanceof Error ? err.message : String(err), apiKey);
    console.error(`FAILED: ${message}`);
    console.error("The previous schedule file, if any, was left unchanged.");
    if (err instanceof ConfigError) return 2;
    if (err instanceof ProviderError) return 3;
    if (err instanceof ValidationError) return 4;
    return 1;
  }
}

process.exitCode = await main();