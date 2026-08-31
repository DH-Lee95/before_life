import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAccountRepository } from "@/lib/auth/accountRepository";
import { getAuthenticatedUser } from "@/lib/auth/serverClient";
import { getPaymentRepository } from "@/lib/payment/paymentProvider";
import { readPaymentEnvironment } from "@/lib/payment/paymentEnvironment";
import { confirmTossPayment } from "@/lib/payment/tossPaymentProvider";
import { ANONYMOUS_SESSION_COOKIE } from "@/lib/session/anonymousSession";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const anonymousSessionId = (await cookies()).get(ANONYMOUS_SESSION_COOKIE)?.value;
    if (!anonymousSessionId) return NextResponse.json({ message: "session required" }, { status: 401 });
    const user = await getAuthenticatedUser();
    if (!user || !await getAccountRepository().isSessionOwnedByUser(anonymousSessionId, user.id)) {
      return NextResponse.json({ message: "카카오 로그인이 필요합니다.", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    const body = await request.json() as Record<string, unknown>;
    const paymentKey = typeof body.paymentKey === "string" ? body.paymentKey : "";
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    const amount = typeof body.amount === "number" ? body.amount : Number.NaN;
    if (!paymentKey || paymentKey.length > 200 || !/^[A-Za-z0-9_-]{6,64}$/.test(orderId) || !Number.isSafeInteger(amount)) {
      return NextResponse.json({ message: "invalid confirmation request" }, { status: 400 });
    }

    const repository = getPaymentRepository();
    const intent = await repository.getIntent(orderId, anonymousSessionId);
    if (!intent) return NextResponse.json({ message: "order not found" }, { status: 404 });
    if (intent.amountKrw !== amount) {
      return NextResponse.json({ message: "payment amount mismatch" }, { status: 400 });
    }
    if (intent.status !== "pending" && intent.status !== "approved") {
      return NextResponse.json({ message: "payment cannot be approved" }, { status: 409 });
    }
    if (intent.status === "pending" && Date.parse(intent.expiresAt) <= Date.now()) {
      return NextResponse.json({ message: "payment order expired" }, { status: 410 });
    }

    let providerPayload: unknown = { status: "DONE", repeated: true };
    if (intent.status === "pending") {
      const { secretKey } = readPaymentEnvironment({
        NEXT_PUBLIC_TOSS_CLIENT_KEY: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
        TOSS_SECRET_KEY: process.env.TOSS_SECRET_KEY,
      });
      providerPayload = await confirmTossPayment({
        secretKey,
        paymentKey,
        orderId,
        amountKrw: intent.amountKrw,
      });
    }

    const approved = await repository.approveIntent({
      intentId: intent.id,
      providerPaymentKey: paymentKey,
      rawPayload: providerPayload,
    });
    return NextResponse.json({
      profileId: approved.intent.soulProfileId,
      purchasedSouls: approved.intent.souls,
      balance: approved.balance,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "payment confirmation failed" },
      { status: 502 },
    );
  }
}
