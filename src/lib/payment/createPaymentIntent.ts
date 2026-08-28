import { soulPacks } from "@/config/pricing";
import type { PaymentIntent } from "@/types/payment";

type CreatePaymentIntentInput = {
  id: string;
  anonymousSessionId: string;
  soulProfileId: string;
  packId: string;
  randomId: string;
  now: Date;
};

export function createPaymentIntent(input: CreatePaymentIntentInput): PaymentIntent {
  const pack = soulPacks.find((candidate) => candidate.id === input.packId);
  if (!pack) throw new Error("invalid soul pack");

  return {
    id: input.id,
    anonymousSessionId: input.anonymousSessionId,
    soulProfileId: input.soulProfileId,
    orderId: `soul_${input.randomId}`,
    packId: pack.id,
    amountKrw: pack.priceKrw,
    souls: pack.souls,
    status: "pending",
    createdAt: input.now.toISOString(),
    expiresAt: new Date(input.now.getTime() + 30 * 60 * 1000).toISOString(),
  };
}
