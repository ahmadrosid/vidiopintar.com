import Database from "better-sqlite3";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const { resolveDatabasePath } = require("../src/lib/db/resolve-database-path.js");

const args = process.argv.slice(2);

const valueAfter = (name, fallback) => {
  const index = args.indexOf(name);

  return index < 0 ? fallback : args[index + 1];
};

const days = Number(valueAfter("--days", "14"));

const costValue = valueAfter("--cost-usd", undefined);

const costUsd = costValue === undefined ? undefined : Number(costValue);

if (!Number.isInteger(days) || days < 1 || days > 90) {
  throw new Error("--days must be an integer from 1 to 90.");
}

if (costValue !== undefined && (!Number.isFinite(costUsd) || costUsd < 0)) {
  throw new Error("--cost-usd must be a non-negative number.");
}

const db = new Database(resolveDatabasePath(), { readonly: true });

try {
  const since = Date.now() - days * 86_400_000;

  const rows = db.prepare(`
    WITH first_success AS (
      SELECT key_id, MIN(created_at) AS created_at
      FROM mcp_request_metrics
      WHERE outcome = 'success'
      GROUP BY key_id
    )
    SELECT m.key_id, k.created_at AS key_created_at, fs.created_at AS first_success_at,
      m.created_at, m.duration_ms, m.outcome, m.provider_attempt, m.transcript_complete
    FROM mcp_request_metrics AS m
    JOIN mcp_api_keys AS k ON k.id = m.key_id
    LEFT JOIN first_success AS fs ON fs.key_id = m.key_id
    WHERE m.created_at >= ?
    ORDER BY m.created_at
  `).all(since);

  const successRows = rows.filter((row) => row.outcome === "success");
  const providerRows = rows.filter((row) => row.provider_attempt === 1);
  const providerSuccesses = providerRows.filter((row) => row.outcome === "success");
  const providerFailures = providerRows.filter((row) => row.outcome !== "success");
  const successfulTranscripts = successRows.filter((row) => row.transcript_complete === 1).length;
  const providerAttempts = providerRows.length;
  const latencies = rows.map((row) => row.duration_ms).sort((a, b) => a - b);
  const perKey = new Map();
  const byDay = new Map();
  const errorCodes = {};

  for (const row of rows) {
    const day = new Date(row.created_at).toISOString().slice(0, 10);

    const daily = byDay.get(day) ?? {
      calls: 0,
      successes: 0,
      transcripts: 0,
      provider_attempts: 0,
      provider_successes: 0,
      provider_failures: 0,
      errors: {},
    };

    daily.calls += 1;

    if (row.outcome === "success") {
      daily.successes += 1;

      if (row.transcript_complete === 1) daily.transcripts += 1;
    } else {
      daily.errors[row.outcome] = (daily.errors[row.outcome] ?? 0) + 1;
      errorCodes[row.outcome] = (errorCodes[row.outcome] ?? 0) + 1;
    }

    if (row.provider_attempt === 1) {
      daily.provider_attempts += 1;

      if (row.outcome === "success") daily.provider_successes += 1;
      else daily.provider_failures += 1;
    }

    byDay.set(day, daily);

    const key = perKey.get(row.key_id) ?? {
      keyCreatedAt: row.key_created_at,
      firstSuccessAt: row.first_success_at,
      successDays: new Set(),
    };

    if (row.outcome === "success") {
      key.successDays.add(day);
    }

    perKey.set(row.key_id, key);
  }

  const timeToFirstSuccess = [...perKey.values()]
    .filter((key) => key.firstSuccessAt !== null && key.firstSuccessAt >= since)
    .map((key) => Math.max(0, key.firstSuccessAt - key.keyCreatedAt))
    .sort((a, b) => a - b);

  const median = (values) => values.length === 0
    ? null
    : values[Math.floor((values.length - 1) / 2)];

  const round = (value) => Math.round(value * 1_000_000) / 1_000_000;
  const successfulKeys = [...perKey.values()].filter((key) => key.firstSuccessAt !== null);

  const report = {
    period_days: days,
    calls: rows.length,
    successful_calls: successRows.length,
    successful_transcripts: successfulTranscripts,
    provider_attempts: providerAttempts,
    provider_successes: providerSuccesses.length,
    provider_failures: providerFailures.length,
    request_errors: rows.length - providerRows.length,
    error_codes: errorCodes,
    provider_success_rate_percent: providerAttempts === 0 ? null : round(successRows.length / providerAttempts * 100),
    p95_latency_ms: latencies.length === 0 ? null : latencies[Math.ceil(latencies.length * 0.95) - 1],
    activated_keys: successfulKeys.length,
    repeat_use_keys: successfulKeys.filter((key) => key.successDays.size > 1).length,
    median_time_to_first_success_ms: median(timeToFirstSuccess),
    ...(costUsd === undefined ? {} : {
      hosting_cost_usd: costUsd,
      cost_per_successful_transcript_usd: successfulTranscripts === 0 ? null : round(costUsd / successfulTranscripts),
    }),
    daily: Object.fromEntries([...byDay.entries()].sort(([a], [b]) => a.localeCompare(b))),
  };

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} finally {
  db.close();
}
