import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("payment persistence migration", () => {
  const sql = readFileSync("supabase/migrations/20260828000200_payment_persistence.sql", "utf8");
  const refundSql = readFileSync("supabase/migrations/20260831000300_payment_refund_reconciliation.sql", "utf8");
  const payAppSql = readFileSync("supabase/migrations/20260903000100_payapp_payment_provider.sql", "utf8");

  it("stores intents, transactions, and an immutable soul ledger", () => {
    expect(sql).toContain("create table if not exists public.payment_intents");
    expect(sql).toContain("order_id text not null unique");
    expect(sql).toContain("create table if not exists public.payment_transactions");
    expect(sql).toContain("payment_intent_id uuid not null unique");
    expect(sql).toContain("create table if not exists public.soul_ledger");
    expect(sql).toContain("unique (anonymous_session_id, reason, reference_id)");
  });

  it("stores PayApp checkout metadata and records the intent provider during approval", () => {
    expect(payAppSql).toContain("add column if not exists provider_checkout_url text");
    expect(payAppSql).toContain("alter column provider set default 'payapp'");
    expect(payAppSql).toContain("v_intent.provider, p_provider_payment_key");
    expect(payAppSql).not.toContain("v_intent.id, 'toss'");
  });

  it("approves and credits a purchase in one idempotent database function", () => {
    expect(sql).toContain("create or replace function public.approve_soul_purchase");
    expect(sql).toContain("for update");
    expect(sql).toContain("on conflict (payment_intent_id) do nothing");
    expect(sql).toContain("on conflict (anonymous_session_id, reason, reference_id) do nothing");
    expect(sql).toContain("grant execute on function public.approve_soul_purchase");
  });

  it("reverses a fully canceled purchase through an idempotent ledger entry", () => {
    expect(refundSql).toContain("create or replace function public.cancel_soul_purchase");
    expect(refundSql).toContain("set status = 'canceled'");
    expect(refundSql).toContain("-v_intent.souls, 'refund'");
    expect(refundSql).toContain("on conflict (anonymous_session_id, reason, reference_id) do nothing");
    expect(refundSql).toContain("grant execute on function public.cancel_soul_purchase");
  });
});
