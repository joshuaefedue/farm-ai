/**
 * seed-admin.mjs
 * Creates or promotes the platform admin user in Supabase.
 *
 * Usage:
 *   npm run seed:admin
 *
 * IMPORTANT: Run the SQL migrations in Supabase dashboard FIRST:
 *   supabase/migrations/001_schema.sql
 *   supabase/migrations/003_admin.sql
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// ── Parse .env.local ──────────────────────────────────────────────────────────
const envPath = resolve(process.cwd(), ".env.local");
if (!existsSync(envPath)) {
  console.error("❌  .env.local not found.");
  process.exit(1);
}

const envRaw = readFileSync(envPath, "utf8");
const envVars = Object.fromEntries(
  envRaw
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const SUPABASE_URL = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_KEY  = envVars["SUPABASE_SERVICE_ROLE_KEY"];

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const ADMIN_EMAIL    = "joshuaefedue10@gmail.com";
const ADMIN_PASSWORD = "SecureFarm247@1";
const ADMIN_NAME     = "Joshua Efedue";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`\n🌱  Setting up admin: ${ADMIN_EMAIL}\n`);

  // ── Step 1: Find existing user by email ────────────────────────────────────
  let userId = null;

  console.log("🔍  Checking if user already exists…");
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });

  if (listErr) {
    console.error("❌  Could not list users:", listErr.message);
    console.error("\n📋  Make sure the service role key is correct and the Supabase project is accessible.");
    process.exit(1);
  }

  const existing = list.users.find((u) => u.email === ADMIN_EMAIL);

  if (existing) {
    userId = existing.id;
    console.log(`✅  Found existing user: ${userId}`);
  } else {
    // ── Step 2: Create the user ───────────────────────────────────────────
    console.log("➕  User not found — creating…");
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email:         ADMIN_EMAIL,
      password:      ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: ADMIN_NAME },
    });

    if (createErr) {
      console.error("❌  Failed to create user:", createErr.message);
      if (createErr.message?.includes("Database error")) {
        console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  The database hasn't been set up yet.

  Please apply these migrations in your Supabase dashboard:
  → https://supabase.com/dashboard/project/_/sql/new

  1. Copy & run:  supabase/migrations/001_schema.sql
  2. Copy & run:  supabase/migrations/003_admin.sql
  3. Then re-run: npm run seed:admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      }
      process.exit(1);
    }

    userId = created.user.id;
    console.log(`✅  Created user: ${userId}`);
  }

  // ── Step 3: Set is_admin = true on profile ────────────────────────────────
  console.log("🔑  Setting is_admin = true on profile…");

  const { error: profileErr } = await supabase
    .from("profiles")
    .upsert({ id: userId, full_name: ADMIN_NAME, is_admin: true }, { onConflict: "id" });

  if (profileErr) {
    if (profileErr.message?.includes("column") && profileErr.message?.includes("is_admin")) {
      console.error("❌  Profile table is missing the is_admin column.");
      console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Migration 003 hasn't been applied yet.

  Go to: https://supabase.com/dashboard/project/_/sql/new
  Run:   supabase/migrations/003_admin.sql
  Then:  npm run seed:admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    } else if (profileErr.message?.includes("relation") && profileErr.message?.includes("profiles")) {
      console.error("❌  The profiles table doesn't exist yet.");
      console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Run these migrations in Supabase SQL Editor first:
  1. supabase/migrations/001_schema.sql
  2. supabase/migrations/003_admin.sql
  Then: npm run seed:admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    } else {
      console.error("❌  Profile update failed:", profileErr.message);
    }
    process.exit(1);
  }

  console.log("✅  Profile updated — is_admin = true\n");

  console.log(`╔══════════════════════════════════════════════════╗
║  ✓  Admin user is ready!                         ║
╠══════════════════════════════════════════════════╣
║  Email:     joshuaefedue10@gmail.com             ║
║  Password:  SecureFarm247@1                      ║
║  URL:       /admin/dashboard                     ║
╚══════════════════════════════════════════════════╝
`);
}

main().catch((err) => {
  console.error("❌  Fatal:", err?.message ?? err);
  process.exit(1);
});
