import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = path.join(process.cwd(), "supabase/migrations/20260828000100_soul_persistence.sql");

describe("Supabase persistence schema", () => {
  it("enforces deterministic profile and content cache uniqueness", () => {
    const sql = fs.readFileSync(migrationPath, "utf8");

    expect(sql).toContain("unique (soul_hash, input_version, engine_version)");
    expect(sql).toContain("unique (soul_profile_id, content_type, generation_key)");
  });

  it("stores ownership separately and never declares a plaintext result token", () => {
    const sql = fs.readFileSync(migrationPath, "utf8");

    expect(sql).toContain("create table if not exists public.soul_profile_access");
    expect(sql).toContain("result_token_hash text");
    expect(sql).not.toMatch(/\bresult_token\s+text\b/);
  });

  it("enables row-level security on every server-owned table", () => {
    const sql = fs.readFileSync(migrationPath, "utf8");
    const tables = ["anonymous_sessions", "soul_profiles", "soul_profile_access", "soul_contents", "analytics_events"];

    for (const table of tables) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
    }
  });
});
