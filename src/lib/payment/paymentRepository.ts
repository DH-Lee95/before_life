import type { ApprovedPurchase, PaymentIntent } from "@/types/payment";

export type ApprovePaymentIntentInput = {
  intentId: string;
  providerPaymentKey: string;
  rawPayload: unknown;
};

export type PaymentRepository = {
  createIntent: (intent: PaymentIntent) => Promise<PaymentIntent>;
  getIntent: (orderId: string, anonymousSessionId: string) => Promise<PaymentIntent | null>;
  approveIntent: (input: ApprovePaymentIntentInput) => Promise<ApprovedPurchase>;
};
