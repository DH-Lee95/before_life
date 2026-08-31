export type TossPayment = {
  paymentKey: string;
  orderId: string;
  totalAmount: number;
  balanceAmount?: number;
  status: string;
  [key: string]: unknown;
};

type GetTossPaymentInput = {
  secretKey: string;
  orderId: string;
  fetchImpl?: typeof fetch;
};

type ConfirmTossPaymentInput = {
  secretKey: string;
  paymentKey: string;
  orderId: string;
  amountKrw: number;
  fetchImpl?: typeof fetch;
};

export async function confirmTossPayment({
  secretKey,
  paymentKey,
  orderId,
  amountKrw,
  fetchImpl = fetch,
}: ConfirmTossPaymentInput): Promise<TossPayment> {
  const response = await fetchImpl("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
      "Idempotency-Key": orderId,
    },
    body: JSON.stringify({ paymentKey, orderId, amount: amountKrw }),
  });
  const payload = await response.json() as TossPayment & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "payment confirmation failed");
  if (
    payload.paymentKey !== paymentKey
    || payload.orderId !== orderId
    || payload.totalAmount !== amountKrw
    || payload.status !== "DONE"
  ) {
    throw new Error("payment verification failed");
  }
  return payload;
}

export async function getTossPaymentByOrderId({
  secretKey,
  orderId,
  fetchImpl = fetch,
}: GetTossPaymentInput): Promise<TossPayment> {
  const response = await fetchImpl(`https://api.tosspayments.com/v1/payments/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  const payload = await response.json() as TossPayment & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "payment lookup failed");
  return payload;
}
