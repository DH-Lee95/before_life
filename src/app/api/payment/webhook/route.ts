import { readPaymentEnvironment } from "@/lib/payment/paymentEnvironment";
import { verifyPayAppFeedback } from "@/lib/payment/payAppPaymentProvider";
import { getPaymentRepository } from "@/lib/payment/paymentProvider";

export const runtime = "nodejs";

const SUCCESS = new Response("SUCCESS", { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });

export async function POST(request: Request) {
  try {
    const feedback = new URLSearchParams(await request.text());
    const orderId = feedback.get("var1")?.trim() ?? "";
    if (!/^[A-Za-z0-9_-]{6,64}$/.test(orderId)) return fail(400);

    const repository = getPaymentRepository();
    const intent = await repository.getIntentByOrderId(orderId);
    if (!intent) return fail(404);
    const environment = readPaymentEnvironment({
      PAYAPP_USER_ID: process.env.PAYAPP_USER_ID,
      PAYAPP_LINK_KEY: process.env.PAYAPP_LINK_KEY,
      PAYAPP_LINK_VALUE: process.env.PAYAPP_LINK_VALUE,
      PAYAPP_MODE: process.env.PAYAPP_MODE,
      PAYAPP_OPEN_PAY_TYPES: process.env.PAYAPP_OPEN_PAY_TYPES,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      BUSINESS_NAME: process.env.BUSINESS_NAME,
    });
    const verified = verifyPayAppFeedback(feedback, {
      userId: environment.userId,
      linkKey: environment.linkKey,
      linkValue: environment.linkValue,
      orderId: intent.orderId,
      profileId: intent.soulProfileId,
      amountKrw: intent.amountKrw,
    });
    if (intent.providerPaymentKey !== verified.providerPaymentKey) return fail(400);

    if (verified.state === "4") {
      if (intent.status === "approved") return SUCCESS.clone();
      if (intent.status !== "pending") return fail(409);
      await repository.approveIntent({
        intentId: intent.id,
        providerPaymentKey: verified.providerPaymentKey,
        rawPayload: verified,
      });
      return SUCCESS.clone();
    }
    if (verified.state === "9" || verified.state === "64") {
      if (intent.status === "canceled") return SUCCESS.clone();
      if (intent.status !== "approved") return fail(409);
      await repository.cancelIntent({
        intentId: intent.id,
        providerPaymentKey: verified.providerPaymentKey,
        rawPayload: verified,
      });
      return SUCCESS.clone();
    }
    if (verified.state === "70" || verified.state === "71") {
      console.error("PayApp partial cancellation requires manual soul reconciliation", {
        orderId: verified.orderId,
        providerPaymentKey: verified.providerPaymentKey,
        state: verified.state,
      });
    }
    return SUCCESS.clone();
  } catch (caught) {
    console.error("PayApp feedback reconciliation failed", caught);
    return fail(400);
  }
}

function fail(status: number) {
  return new Response("FAIL", { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
