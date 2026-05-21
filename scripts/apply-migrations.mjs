/**
 * apply-migrations.mjs
 * Applies migrations 001 and 003 directly to Supabase via the REST API.
 * Reads credentials from .env.local automatically.
 *
 * Usage:
 *   node scripts/apply-migrations.mjs
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// ── Parse .env.local ──────────────────────────────────────────────────────────
const envPath = resolve(process.cwd(), ".env.local");
const envRaw  = readFileSync(envPath, "utf8");
const envVars = Object.fromEntries(
  envRaw.split("\n")
    .filter((l) => l.trim() && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const SUPABASE_URL = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_KEY  = envVars["SUPABASE_SERVICE_ROLE_KEY"];
const PROJECT_REF  = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!PROJECT_REF) {
  console.error("❌  Could not extract project ref from SUPABASE_URL");
  process.exit(1);
}

console.log(`\n🚀  Applying migrations to project: ${PROJECT_REF}\n`);

// ── Read migration files ──────────────────────────────────────────────────────
const migration001 = readFileSync(resolve(process.cwd(), "supabase/migrations/001_schema.sql"), "utf8");
const migration003 = readFileSync(resolve(process.cwd(), "supabase/migrations/003_admin.sql"),  "utf8");

// ── Execute SQL via Supabase Management API ───────────────────────────────────
async function execSQL(sql, label) {
  console.log(`📦  Running: ${label}…`);

  // Try the pg/query endpoint (works with service role on some Supabase plans)
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "apikey":        SERVICE_KEY,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (res.ok) {
    console.log(`  ✅  ${label} — applied`);
    return true;
  }

  const body = await res.text().catch(() => res.statusText);

  // Fall back: try the Management API
  console.log(`  ⚠️   pg/query returned ${res.status} — trying Management API…`);

  const mgmtRes = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (mgmtRes.ok) {
    console.log(`  ✅  ${label} — applied via Management API`);
    return true;
  }

  const mgmtBody = await mgmtRes.text().catch(() => mgmtRes.statusText);
  console.error(`  ❌  ${label} failed (${mgmtRes.status}): ${mgmtBody.slice(0, 200)}`);
  return false;
}

async function main() {
  const ok1 = await execSQL(migration001, "001_schema.sql");
  const ok3 = await execSQL(migration003, "003_admin.sql");

  if (ok1 && ok3) {
    console.log("\n✅  All migrations applied! Now run: npm run seed:admin\n");
  } else {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Auto-migration couldn't reach the database API.
  Please apply the migrations manually via Supabase Dashboard:

  1. Open: https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new
  2. Paste and run: supabase/migrations/001_schema.sql
  3. Paste and run: supabase/migrations/003_admin.sql
  4. Then run:      npm run seed:admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  }
}

main().catch((err) => {
  console.error("❌  Error:", err?.message ?? err);
  process.exit(1);
});
