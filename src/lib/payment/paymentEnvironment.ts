type PaymentEnvironment = {
  NEXT_PUBLIC_TOSS_CLIENT_KEY?: string;
  TOSS_SECRET_KEY?: string;
};

export function readPaymentEnvironment(environment: PaymentEnvironment) {
  const clientKey = environment.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim();
  const secretKey = environment.TOSS_SECRET_KEY?.trim();
  if (!clientKey || !secretKey) throw new Error("payment is not configured");
  const clientMode = paymentKeyMode(clientKey);
  const secretMode = paymentKeyMode(secretKey);
  if (!clientMode || !secretMode) throw new Error("invalid Toss payment keys");
  if (clientMode !== secretMode) throw new Error("Toss payment keys must use the same mode");
  return { clientKey, secretKey, mode: clientMode };
}

function paymentKeyMode(key: string): "test" | "live" | null {
  if (key.startsWith("test_")) return "test";
  if (key.startsWith("live_")) return "live";
  return null;
}
