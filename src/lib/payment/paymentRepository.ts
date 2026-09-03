import type { ApprovedPurchase, PaymentIntent } from "@/types/payment";

export type ApprovePaymentIntentInput = {
  intentId: string;
  providerPaymentKey: string;
  rawPayload: unknown;
};

export type CancelPaymentIntentInput = ApprovePaymentIntentInput;

export type AttachProviderRequestInput = {
  intentId: string;
  providerPaymentKey: string;
  providerCheckoutUrl: string;
};

export type PaymentRepository = {
  createIntent: (intent: PaymentIntent) => Promise<PaymentIntent>;
  getIntent: (orderId: string, anonymousSessionId: string) => Promise<PaymentIntent | null>;
  getIntentByOrderId: (orderId: string) => Promise<PaymentIntent | null>;
  attachProviderRequest: (input: AttachProviderRequestInput) => Promise<PaymentIntent>;
  approveIntent: (input: ApprovePaymentIntentInput) => Promise<ApprovedPurchase>;
  cancelIntent: (input: CancelPaymentIntentInput) => Promise<ApprovedPurchase>;
};
