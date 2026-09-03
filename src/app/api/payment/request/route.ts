import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { assertLiveCommerceReady } from "@/config/business";
import { getAccountRepository } from "@/lib/auth/accountRepository";
import { getAuthenticatedUser } from "@/lib/auth/serverClient";
import { readPaymentEnvironment } from "@/lib/payment/paymentEnvironment";
import { requestPayAppPayment } from "@/lib/payment/payAppPaymentProvider";
import { getPaymentRepository } from "@/lib/payment/paymentProvider";
import { ANONYMOUS_SESSION_COOKIE } from "@/lib/session/anonymousSession";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const anonymousSessionId = (await cookies()).get(ANONYMOUS_SESSION_COOKIE)?.value;
    if (!anonymousSessionId) return error("session required", 401);
    const user = await getAuthenticatedUser();
    if (!user || !await getAccountRepository().isSessionOwnedByUser(anonymousSessionId, user.id)) {
      return error("소울 충전은 카카오 로그인이 필요합니다.", 401);
    }

    const body = await request.json() as Record<string, unknown>;
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    const buyerPhone = typeof body.phone === "string" ? body.phone.replace(/\D/g, "") : "";
    if (!/^[A-Za-z0-9_-]{6,64}$/.test(orderId) || !/^01\d{8,9}$/.test(buyerPhone)) {
      return error("주문번호와 휴대폰 번호를 확인해 주세요.", 400);
    }

    const repository = getPaymentRepository();
    const intent = await repository.getIntent(orderId, anonymousSessionId);
    if (!intent) return error("주문을 찾을 수 없습니다.", 404);
    if (intent.status !== "pending" || new Date(intent.expiresAt).getTime() <= Date.now()) {
      return error("결제할 수 없는 주문입니다.", 409);
    }
    if (intent.providerPaymentKey && intent.providerCheckoutUrl) {
      return NextResponse.json({ checkoutUrl: intent.providerCheckoutUrl });
    }

    const environment = readPaymentEnvironment({
      PAYAPP_USER_ID: process.env.PAYAPP_USER_ID,
      PAYAPP_LINK_KEY: process.env.PAYAPP_LINK_KEY,
      PAYAPP_LINK_VALUE: process.env.PAYAPP_LINK_VALUE,
      PAYAPP_MODE: process.env.PAYAPP_MODE,
      PAYAPP_OPEN_PAY_TYPES: process.env.PAYAPP_OPEN_PAY_TYPES,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      BUSINESS_NAME: process.env.BUSINESS_NAME,
    });
    assertLiveCommerceReady(environment.mode);
    const providerRequest = await requestPayAppPayment({
      userId: environment.userId,
      shopName: environment.shopName,
      orderId: intent.orderId,
      profileId: intent.soulProfileId,
      amountKrw: intent.amountKrw,
      souls: intent.souls,
      buyerPhone,
      siteUrl: environment.siteUrl,
      openPayTypes: environment.openPayTypes,
    });
    const stored = await repository.attachProviderRequest({
      intentId: intent.id,
      providerPaymentKey: providerRequest.providerPaymentKey,
      providerCheckoutUrl: providerRequest.checkoutUrl,
    });
    return NextResponse.json({ checkoutUrl: stored.providerCheckoutUrl });
  } catch (caught) {
    console.error("PayApp payment request failed", caught);
    return error(caught instanceof Error ? caught.message : "결제창을 열지 못했습니다.", 503);
  }
}

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}
