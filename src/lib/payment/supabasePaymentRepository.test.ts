import { describe, expect, it, vi } from "vitest";

import { createPaymentIntent } from "./createPaymentIntent";
import { createSupabasePaymentRepository } from "./supabasePaymentRepository";

describe("Supabase payment repository", () => {
  it("resolves the anonymous session and stores only server-created pricing", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("anonymous_sessions")) return json([{ id: "session-uuid", session_id: "anon_owner" }]);
      if (url.includes("payment_intents") && init?.method === "POST") {
        return json([{
          id: "intent-id", anonymous_session_id: "session-uuid", soul_profile_id: "sp_test",
          order_id: "soul_random-id", pack_id: "soul_3", amount_krw: 2490, souls: 3,
          status: "pending", provider_payment_key: null,
          created_at: "2026-08-28T09:00:00.000Z", approved_at: null, expires_at: "2026-08-28T09:30:00.000Z",
        }]);
      }
      return json([], 404);
    });
    const repository = createSupabasePaymentRepository({ url: "https://db.example", serviceRoleKey: "secret", fetchImpl });
    const intent = createPaymentIntent({
      anonymousSessionId: "anon_owner", soulProfileId: "sp_test", packId: "soul_3",
      id: "intent-id", randomId: "random-id", now: new Date("2026-08-28T09:00:00.000Z"),
    });

    await expect(repository.createIntent(intent)).resolves.toEqual(intent);
    const insertCall = fetchImpl.mock.calls.find(([url, init]) => String(url).includes("payment_intents") && init?.method === "POST");
    expect(JSON.parse(String(insertCall?.[1]?.body))).toMatchObject({ amount_krw: 2490, souls: 3 });
  });

  it("loads an intent by order id for server-side payment reconciliation", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("payment_intents") && url.includes("order_id=eq.soul_order")) {
        return json([{
          id: "intent-id", anonymous_session_id: "session-uuid", soul_profile_id: "sp_test",
          order_id: "soul_order", pack_id: "soul_1", amount_krw: 990, souls: 1,
          status: "pending", provider_payment_key: null,
          created_at: "2026-08-28T09:00:00.000Z", approved_at: null, expires_at: "2026-08-28T09:30:00.000Z",
        }]);
      }
      if (url.includes("anonymous_sessions") && url.includes("id=eq.session-uuid")) {
        return json([{ session_id: "anon_owner" }]);
      }
      return json([], 404);
    });
    const repository = createSupabasePaymentRepository({ url: "https://db.example", serviceRoleKey: "secret", fetchImpl });

    await expect(repository.getIntentByOrderId("soul_order")).resolves.toMatchObject({
      id: "intent-id", orderId: "soul_order", anonymousSessionId: "anon_owner",
    });
  });

  it("reconciles a full refund through the atomic database RPC", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("rpc/cancel_soul_purchase")) return json({ balance: 0 });
      if (url.includes("payment_intents") && url.includes("id=eq.intent-id")) {
        return json([{
          id: "intent-id", anonymous_session_id: "session-uuid", soul_profile_id: "sp_test",
          order_id: "soul_order", pack_id: "soul_3", amount_krw: 2490, souls: 3,
          status: "canceled", provider_payment_key: "payment-key",
          created_at: "2026-08-28T09:00:00.000Z", approved_at: "2026-08-28T09:01:00.000Z",
          expires_at: "2026-08-28T09:30:00.000Z",
        }]);
      }
      if (url.includes("anonymous_sessions") && url.includes("id=eq.session-uuid")) return json([{ session_id: "anon_owner" }]);
      return json([], 404);
    });
    const repository = createSupabasePaymentRepository({ url: "https://db.example", serviceRoleKey: "secret", fetchImpl });

    await expect(repository.cancelIntent({
      intentId: "intent-id", providerPaymentKey: "payment-key", rawPayload: { status: "CANCELED" },
    })).resolves.toMatchObject({ balance: 0, intent: { status: "canceled" } });
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining("rpc/cancel_soul_purchase"),
      expect.objectContaining({ method: "POST" }),
    );
  });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
