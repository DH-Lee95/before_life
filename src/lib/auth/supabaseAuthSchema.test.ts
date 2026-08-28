import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20260828000300_kakao_account_ownership.sql", "utf8");

describe("Kakao account ownership migration", () => {
  it("links anonymous sessions and profile access to auth users", () => {
    expect(sql).toContain("add column if not exists user_id uuid references auth.users(id)");
    expect(sql).toContain("claim_anonymous_session");
    expect(sql).toContain("insert into public.soul_profile_access");
  });

  it("returns a balance aggregated across all sessions owned by the user", () => {
    expect(sql).toContain("s.user_id = v_user_id");
    expect(sql).toContain("sum(l.change_amount)");
  });

  it("keeps ownership RPCs server-only", () => {
    expect(sql).toContain("revoke all on function public.claim_anonymous_session(text, uuid)");
    expect(sql).toContain("grant execute on function public.claim_anonymous_session(text, uuid) to service_role");
  });
});
