import type { ApprovedPurchase, PaymentIntent } from "@/types/payment";

import type { PaymentRepository } from "./paymentRepository";

export function createMemoryPaymentRepository(): PaymentRepository {
  const intents = new Map<string, PaymentIntent>();
  const balances = new Map<string, number>();

  return {
    async createIntent(intent) {
      intents.set(intent.orderId, intent);
      return intent;
    },
    async getIntent(orderId, anonymousSessionId) {
      const intent = intents.get(orderId);
      return intent?.anonymousSessionId === anonymousSessionId ? intent : null;
    },
    async getIntentByOrderId(orderId) {
      return intents.get(orderId) ?? null;
    },
    async approveIntent({ intentId, providerPaymentKey }) {
      const intent = [...intents.values()].find((candidate) => candidate.id === intentId);
      if (!intent) throw new Error("payment intent not found");
      if (intent.status === "approved") {
        if (intent.providerPaymentKey !== providerPaymentKey) throw new Error("payment key mismatch");
        return { intent, balance: balances.get(intent.anonymousSessionId) ?? 0 };
      }
      if (intent.status !== "pending") throw new Error("payment intent is not pending");

      const approved: PaymentIntent = {
        ...intent,
        status: "approved",
        providerPaymentKey,
        approvedAt: new Date().toISOString(),
      };
      intents.set(intent.orderId, approved);
      const balance = (balances.get(intent.anonymousSessionId) ?? 0) + intent.souls;
      balances.set(intent.anonymousSessionId, balance);
      return { intent: approved, balance } satisfies ApprovedPurchase;
    },
    async cancelIntent({ intentId, providerPaymentKey }) {
      const intent = [...intents.values()].find((candidate) => candidate.id === intentId);
      if (!intent) throw new Error("payment intent not found");
      if (intent.providerPaymentKey !== providerPaymentKey) throw new Error("payment key mismatch");
      if (intent.status === "canceled") {
        return { intent, balance: balances.get(intent.anonymousSessionId) ?? 0 };
      }
      if (intent.status !== "approved") throw new Error("payment intent is not approved");

      const canceled: PaymentIntent = { ...intent, status: "canceled" };
      intents.set(intent.orderId, canceled);
      const balance = (balances.get(intent.anonymousSessionId) ?? 0) - intent.souls;
      balances.set(intent.anonymousSessionId, balance);
      return { intent: canceled, balance } satisfies ApprovedPurchase;
    },
  };
}
