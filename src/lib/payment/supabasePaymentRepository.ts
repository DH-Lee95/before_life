import type { ApprovedPurchase, PaymentIntent, PaymentIntentStatus } from "@/types/payment";

import type { PaymentRepository } from "./paymentRepository";

type Options = {
  url: string;
  serviceRoleKey: string;
  fetchImpl?: typeof fetch;
};

type PaymentIntentRow = {
  id: string;
  anonymous_session_id: string;
  soul_profile_id: string;
  order_id: string;
  pack_id: string;
  amount_krw: number;
  souls: number;
  status: PaymentIntentStatus;
  provider_payment_key: string | null;
  provider_checkout_url: string | null;
  created_at: string;
  approved_at: string | null;
  expires_at: string;
};

export function createSupabasePaymentRepository({
  url,
  serviceRoleKey,
  fetchImpl = fetch,
}: Options): PaymentRepository {
  const baseUrl = url.replace(/\/$/, "");

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetchImpl(`${baseUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init.headers,
      },
      cache: "no-store",
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      throw new Error(`Supabase payment request failed (${response.status})${detail ? `: ${detail}` : ""}`);
    }
    return await response.json() as T;
  }

  async function getSessionRow(sessionId: string): Promise<{ id: string; session_id: string } | null> {
    const params = new URLSearchParams({ session_id: `eq.${sessionId}`, select: "id,session_id", limit: "1" });
    return (await request<Array<{ id: string; session_id: string }>>(`anonymous_sessions?${params}`))[0] ?? null;
  }

  async function getSessionIdByRowId(rowId: string): Promise<string> {
    const params = new URLSearchParams({ id: `eq.${rowId}`, select: "session_id", limit: "1" });
    const row = (await request<Array<{ session_id: string }>>(`anonymous_sessions?${params}`))[0];
    if (!row) throw new Error("anonymous session not found");
    return row.session_id;
  }

  async function getIntentRowById(intentId: string): Promise<PaymentIntentRow | null> {
    const params = new URLSearchParams({ id: `eq.${intentId}`, limit: "1" });
    return (await request<PaymentIntentRow[]>(`payment_intents?${params}`))[0] ?? null;
  }

  return {
    async createIntent(intent) {
      const session = await getSessionRow(intent.anonymousSessionId);
      if (!session) throw new Error("anonymous session not found");
      const rows = await request<PaymentIntentRow[]>("payment_intents", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(toRow(intent, session.id)),
      });
      if (!rows[0]) throw new Error("payment intent insert returned no row");
      return toIntent(rows[0], intent.anonymousSessionId);
    },
    async getIntent(orderId, anonymousSessionId) {
      const session = await getSessionRow(anonymousSessionId);
      if (!session) return null;
      const params = new URLSearchParams({
        order_id: `eq.${orderId}`,
        anonymous_session_id: `eq.${session.id}`,
        limit: "1",
      });
      const row = (await request<PaymentIntentRow[]>(`payment_intents?${params}`))[0];
      return row ? toIntent(row, anonymousSessionId) : null;
    },
    async getIntentByOrderId(orderId) {
      const params = new URLSearchParams({ order_id: `eq.${orderId}`, limit: "1" });
      const row = (await request<PaymentIntentRow[]>(`payment_intents?${params}`))[0];
      if (!row) return null;
      const anonymousSessionId = await getSessionIdByRowId(row.anonymous_session_id);
      return toIntent(row, anonymousSessionId);
    },
    async attachProviderRequest({ intentId, providerPaymentKey, providerCheckoutUrl }) {
      const params = new URLSearchParams({
        id: `eq.${intentId}`,
        status: "eq.pending",
        provider_payment_key: "is.null",
      });
      const rows = await request<PaymentIntentRow[]>(`payment_intents?${params}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          provider: "payapp",
          provider_payment_key: providerPaymentKey,
          provider_checkout_url: providerCheckoutUrl,
        }),
      });
      const row = rows[0] ?? await getIntentRowById(intentId);
      if (!row) throw new Error("payment intent not found");
      if (
        row.status !== "pending"
        || row.provider_payment_key !== providerPaymentKey
        || row.provider_checkout_url !== providerCheckoutUrl
      ) throw new Error("payment provider request mismatch");
      const anonymousSessionId = await getSessionIdByRowId(row.anonymous_session_id);
      return toIntent(row, anonymousSessionId);
    },
    async approveIntent({ intentId, providerPaymentKey, rawPayload }) {
      const result = await request<{ balance: number }>("rpc/approve_soul_purchase", {
        method: "POST",
        body: JSON.stringify({
          p_payment_intent_id: intentId,
          p_provider_payment_key: providerPaymentKey,
          p_raw_payload: rawPayload,
        }),
      });
      const row = await getIntentRowById(intentId);
      if (!row) throw new Error("approved payment intent not found");
      const anonymousSessionId = await getSessionIdByRowId(row.anonymous_session_id);
      return { intent: toIntent(row, anonymousSessionId), balance: result.balance } satisfies ApprovedPurchase;
    },
    async cancelIntent({ intentId, providerPaymentKey, rawPayload }) {
      const result = await request<{ balance: number }>("rpc/cancel_soul_purchase", {
        method: "POST",
        body: JSON.stringify({
          p_payment_intent_id: intentId,
          p_provider_payment_key: providerPaymentKey,
          p_raw_payload: rawPayload,
        }),
      });
      const row = await getIntentRowById(intentId);
      if (!row) throw new Error("canceled payment intent not found");
      const anonymousSessionId = await getSessionIdByRowId(row.anonymous_session_id);
      return { intent: toIntent(row, anonymousSessionId), balance: result.balance } satisfies ApprovedPurchase;
    },
  };
}

function toRow(intent: PaymentIntent, sessionRowId: string): PaymentIntentRow {
  return {
    id: intent.id,
    anonymous_session_id: sessionRowId,
    soul_profile_id: intent.soulProfileId,
    order_id: intent.orderId,
    pack_id: intent.packId,
    amount_krw: intent.amountKrw,
    souls: intent.souls,
    status: intent.status,
    provider_payment_key: intent.providerPaymentKey ?? null,
    provider_checkout_url: intent.providerCheckoutUrl ?? null,
    created_at: intent.createdAt,
    approved_at: intent.approvedAt ?? null,
    expires_at: intent.expiresAt,
  };
}

function toIntent(row: PaymentIntentRow, anonymousSessionId: string): PaymentIntent {
  return {
    id: row.id,
    anonymousSessionId,
    soulProfileId: row.soul_profile_id,
    orderId: row.order_id,
    packId: row.pack_id,
    amountKrw: row.amount_krw,
    souls: row.souls,
    status: row.status,
    ...(row.provider_payment_key ? { providerPaymentKey: row.provider_payment_key } : {}),
    ...(row.provider_checkout_url ? { providerCheckoutUrl: row.provider_checkout_url } : {}),
    createdAt: row.created_at,
    ...(row.approved_at ? { approvedAt: row.approved_at } : {}),
    expiresAt: row.expires_at,
  };
}
