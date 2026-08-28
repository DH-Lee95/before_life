import { describe, expect, it, vi } from "vitest";

import { createAccountRepository } from "./accountRepository";

describe("account repository", () => {
  it("claims an anonymous session for an authenticated user through a server-only RPC", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    const repository = createAccountRepository({
      url: "https://project.supabase.co",
      serviceRoleKey: "service-secret",
      fetchImpl,
    });

    await repository.claimSession("anon_cookie", "user-id");

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://project.supabase.co/rest/v1/rpc/claim_anonymous_session",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ p_session_id: "anon_cookie", p_user_id: "user-id" }),
      }),
    );
  });

  it("checks session ownership without exposing the service key", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ owned: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    const repository = createAccountRepository({
      url: "https://project.supabase.co",
      serviceRoleKey: "service-secret",
      fetchImpl,
    });

    await expect(repository.isSessionOwnedByUser("anon_cookie", "user-id")).resolves.toBe(true);
  });
});
