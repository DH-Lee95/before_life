type PaymentEnvironment = {
  NEXT_PUBLIC_TOSS_CLIENT_KEY?: string;
  TOSS_SECRET_KEY?: string;
};

export function readTestPaymentEnvironment(environment: PaymentEnvironment) {
  const clientKey = environment.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim();
  const secretKey = environment.TOSS_SECRET_KEY?.trim();
  if (!clientKey || !secretKey) throw new Error("payment is not configured");
  if (!clientKey.startsWith("test_") || !secretKey.startsWith("test_")) {
    throw new Error("test payment keys are required");
  }
  return { clientKey, secretKey };
}
