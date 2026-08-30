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

  it("spends account soul through the atomic unlock RPC", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ balance: 2, charged: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    const repository = createAccountRepository({
      url: "https://project.supabase.co",
      serviceRoleKey: "service-secret",
      fetchImpl,
    });

    await expect(repository.unlockContent("user-id", "sp_test", "last_day", "generation-key", 1))
      .resolves.toEqual({ balance: 2, charged: true });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://project.supabase.co/rest/v1/rpc/unlock_soul_content",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          p_user_id: "user-id",
          p_profile_id: "sp_test",
          p_content_type: "last_day",
          p_generation_key: "generation-key",
          p_cost: 1,
        }),
      }),
    );
  });

  it("maps only the account's unlocked content returned by the entitlement RPC", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify([{
      soul_profile_id: "sp_test",
      content_type: "last_day",
      generation_key: "generation-key",
      content: { title: "마지막 편지" },
      created_at: "2026-08-30T00:00:00.000Z",
    }]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    const repository = createAccountRepository({
      url: "https://project.supabase.co",
      serviceRoleKey: "service-secret",
      fetchImpl,
    });

    await expect(repository.getUnlockedContents("user-id", "sp_test")).resolves.toEqual([{
      soulProfileId: "sp_test",
      contentType: "last_day",
      generationKey: "generation-key",
      content: { title: "마지막 편지" },
      isUnlocked: true,
      createdAt: "2026-08-30T00:00:00.000Z",
    }]);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://project.supabase.co/rest/v1/rpc/get_user_unlocked_soul_contents",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ p_user_id: "user-id", p_profile_id: "sp_test" }),
      }),
    );
  });

  it("preserves a safe Supabase error detail for API status mapping", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      message: "insufficient soul balance",
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    }));
    const repository = createAccountRepository({
      url: "https://project.supabase.co",
      serviceRoleKey: "service-secret",
      fetchImpl,
    });

    await expect(repository.unlockContent("user-id", "sp_test", "last_day", "key", 1))
      .rejects.toThrow("insufficient soul balance");
  });
});
