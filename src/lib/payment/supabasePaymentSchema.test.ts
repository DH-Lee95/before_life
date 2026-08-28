import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("payment persistence migration", () => {
  const sql = readFileSync("supabase/migrations/20260828000200_payment_persistence.sql", "utf8");

  it("stores intents, transactions, and an immutable soul ledger", () => {
    expect(sql).toContain("create table if not exists public.payment_intents");
    expect(sql).toContain("order_id text not null unique");
    expect(sql).toContain("create table if not exists public.payment_transactions");
    expect(sql).toContain("payment_intent_id uuid not null unique");
    expect(sql).toContain("create table if not exists public.soul_ledger");
    expect(sql).toContain("unique (anonymous_session_id, reason, reference_id)");
  });

  it("approves and credits a purchase in one idempotent database function", () => {
    expect(sql).toContain("create or replace function public.approve_soul_purchase");
    expect(sql).toContain("for update");
    expect(sql).toContain("on conflict (payment_intent_id) do nothing");
    expect(sql).toContain("on conflict (anonymous_session_id, reason, reference_id) do nothing");
    expect(sql).toContain("grant execute on function public.approve_soul_purchase");
  });
});
