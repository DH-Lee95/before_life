export type PaymentIntentStatus = "pending" | "approved" | "failed" | "canceled" | "expired";

export type PaymentIntent = {
  id: string;
  anonymousSessionId: string;
  soulProfileId: string;
  orderId: string;
  packId: string;
  amountKrw: number;
  souls: number;
  status: PaymentIntentStatus;
  providerPaymentKey?: string;
  createdAt: string;
  approvedAt?: string;
  expiresAt: string;
};

export type ApprovedPurchase = {
  intent: PaymentIntent;
  balance: number;
};
