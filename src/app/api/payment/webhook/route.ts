import { NextResponse } from "next/server";

import { readPaymentEnvironment } from "@/lib/payment/paymentEnvironment";
import { getPaymentRepository } from "@/lib/payment/paymentProvider";
import { getTossPaymentByOrderId } from "@/lib/payment/tossPaymentProvider";

export const runtime = "nodejs";

type TossPaymentEvent = {
  eventType?: unknown;
  data?: { orderId?: unknown; status?: unknown };
};

export async function POST(request: Request) {
  try {
    const event = await request.json() as TossPaymentEvent;
    if (event.eventType !== "PAYMENT_STATUS_CHANGED") return NextResponse.json({ ok: true, ignored: true });
    const orderId = typeof event.data?.orderId === "string" ? event.data.orderId : "";
    const status = typeof event.data?.status === "string" ? event.data.status : "";
    if (!/^[A-Za-z0-9_-]{6,64}$/.test(orderId)) {
      return NextResponse.json({ message: "invalid payment webhook" }, { status: 400 });
    }
    if (status === "PARTIAL_CANCELED") {
      console.error("Partial Toss cancellation requires manual soul reconciliation", { orderId });
      return NextResponse.json({ message: "partial cancellation requires manual reconciliation" }, { status: 409 });
    }
    if (status !== "DONE" && status !== "CANCELED") return NextResponse.json({ ok: true, ignored: true });

    const repository = getPaymentRepository();
    const intent = await repository.getIntentByOrderId(orderId);
    if (!intent) return NextResponse.json({ message: "order not found" }, { status: 404 });
    if (status === "DONE" && intent.status === "approved") return NextResponse.json({ ok: true, repeated: true });
    if (status === "CANCELED" && intent.status === "canceled") return NextResponse.json({ ok: true, repeated: true });
    if (status === "DONE" && intent.status !== "pending") {
      return NextResponse.json({ message: "payment cannot be approved" }, { status: 409 });
    }
    if (status === "CANCELED" && intent.status !== "approved") {
      return NextResponse.json({ message: "payment cannot be canceled" }, { status: 409 });
    }

    const { secretKey } = readPaymentEnvironment({
      NEXT_PUBLIC_TOSS_CLIENT_KEY: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
      TOSS_SECRET_KEY: process.env.TOSS_SECRET_KEY,
    });
    const payment = await getTossPaymentByOrderId({ secretKey, orderId });
    const commonMismatch = (
      payment.orderId !== intent.orderId
      || payment.totalAmount !== intent.amountKrw
      || !payment.paymentKey
      || Boolean(intent.providerPaymentKey && intent.providerPaymentKey !== payment.paymentKey)
    );
    if (commonMismatch || payment.status !== status || (status === "CANCELED" && payment.balanceAmount !== 0)) {
      return NextResponse.json({ message: "payment verification failed" }, { status: 409 });
    }

    if (status === "CANCELED") {
      await repository.cancelIntent({
        intentId: intent.id,
        providerPaymentKey: payment.paymentKey,
        rawPayload: payment,
      });
      return NextResponse.json({ ok: true });
    }

    await repository.approveIntent({
      intentId: intent.id,
      providerPaymentKey: payment.paymentKey,
      rawPayload: payment,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Payment webhook reconciliation failed", error);
    return NextResponse.json({ message: "payment webhook failed" }, { status: 500 });
  }
}
