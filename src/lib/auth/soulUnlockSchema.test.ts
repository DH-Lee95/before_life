import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("account soul unlock migration", () => {
  const initialSql = readFileSync(
    "supabase/migrations/20260828000400_account_soul_unlock.sql",
    "utf8",
  );
  const reconciliationSql = readFileSync(
    "supabase/migrations/20260830000100_account_soul_unlock_reconciliation.sql",
    "utf8",
  );
  const sql = `${initialSql}\n${reconciliationSql}`;

  it("reapplies the idempotent schema with a new version when remote history drifted", () => {
    expect(reconciliationSql).toContain("create table if not exists public.soul_content_unlocks");
    expect(reconciliationSql).toContain("create or replace function public.unlock_soul_content");
    expect(reconciliationSql).toContain(
      "create or replace function public.get_user_unlocked_soul_contents",
    );
  });

  it("stores unlock ownership per account instead of exposing a shared cache row", () => {
    expect(sql).toContain("create table if not exists public.soul_content_unlocks");
    expect(sql).toContain("unique (user_id, soul_profile_id, content_type)");
    expect(sql).toContain("alter table public.soul_content_unlocks enable row level security");
    expect(sql).toContain("revoke all on table public.soul_content_unlocks from anon, authenticated");
    expect(sql).not.toContain("set is_unlocked = true");
  });

  it("serializes account spending and makes repeated unlocks idempotent", () => {
    expect(sql).toContain("create or replace function public.unlock_soul_content");
    expect(sql).toContain("pg_advisory_xact_lock");
    expect(sql).toContain("for update");
    expect(sql).toContain("insufficient soul balance");
    expect(sql).toContain("change_amount, reason, reference_id");
    expect(sql).toContain("insert into public.soul_content_unlocks");
    expect(sql).toContain("user_id = p_user_id and soul_profile_id = p_profile_id and content_type = p_content_type");
    expect(sql).toContain("'charged', false");
    expect(sql).toContain("grant execute on function public.unlock_soul_content");
  });

  it("only lists cached content entitled to the requested account", () => {
    expect(sql).toContain("create or replace function public.get_user_unlocked_soul_contents");
    expect(sql).toContain("join public.soul_content_unlocks");
    expect(sql).toContain("u.user_id = p_user_id");
    expect(sql).toContain("c.soul_profile_id = p_profile_id");
    expect(sql).toContain("grant execute on function public.get_user_unlocked_soul_contents");
  });
});
