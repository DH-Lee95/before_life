import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createPaymentIntent } from "@/lib/payment/createPaymentIntent";
import { readTestPaymentEnvironment } from "@/lib/payment/paymentEnvironment";
import { getPaymentRepository } from "@/lib/payment/paymentProvider";
import { getSoulRepository } from "@/lib/repository/repositoryProvider";
import { ANONYMOUS_SESSION_COOKIE } from "@/lib/session/anonymousSession";
import { hashResultToken } from "@/lib/session/resultToken";

export async function POST(request: Request) {
  try {
    readTestPaymentEnvironment({
      NEXT_PUBLIC_TOSS_CLIENT_KEY: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
      TOSS_SECRET_KEY: process.env.TOSS_SECRET_KEY,
    });
    const anonymousSessionId = await getAnonymousSessionId();
    if (!anonymousSessionId) return NextResponse.json({ message: "session required" }, { status: 401 });

    const body = await request.json() as Record<string, unknown>;
    const profileId = typeof body.profileId === "string" ? body.profileId : "";
    const packId = typeof body.packId === "string" ? body.packId : "";
    if (!/^sp_[A-Za-z0-9_-]+$/.test(profileId) || !packId) {
      return NextResponse.json({ message: "invalid payment request" }, { status: 400 });
    }

    const token = request.headers.get("X-Result-Token");
    const result = await getSoulRepository().getResult(
      profileId,
      token ? hashResultToken(token) : undefined,
      anonymousSessionId,
    );
    if (!result) return NextResponse.json({ message: "result not found" }, { status: 404 });

    const intent = createPaymentIntent({
      id: randomUUID(),
      anonymousSessionId,
      soulProfileId: profileId,
      packId,
      randomId: randomUUID(),
      now: new Date(),
    });
    const stored = await getPaymentRepository().createIntent(intent);
    return NextResponse.json(toPublicIntent(stored), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to create payment intent";
    return NextResponse.json({ message }, { status: message === "invalid soul pack" ? 400 : 503 });
  }
}

export async function GET(request: Request) {
  const anonymousSessionId = await getAnonymousSessionId();
  if (!anonymousSessionId) return NextResponse.json({ message: "session required" }, { status: 401 });
  const orderId = new URL(request.url).searchParams.get("orderId") ?? "";
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(orderId)) {
    return NextResponse.json({ message: "invalid order" }, { status: 400 });
  }
  const intent = await getPaymentRepository().getIntent(orderId, anonymousSessionId);
  if (!intent) return NextResponse.json({ message: "order not found" }, { status: 404 });
  return NextResponse.json(toPublicIntent(intent));
}

async function getAnonymousSessionId() {
  return (await cookies()).get(ANONYMOUS_SESSION_COOKIE)?.value;
}

function toPublicIntent(intent: {
  soulProfileId: string; orderId: string; packId: string; amountKrw: number; souls: number; status: string;
}) {
  return {
    profileId: intent.soulProfileId,
    orderId: intent.orderId,
    packId: intent.packId,
    amountKrw: intent.amountKrw,
    souls: intent.souls,
    status: intent.status,
  };
}
