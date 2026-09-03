import { timingSafeEqual } from "node:crypto";

const PAYAPP_API_URL = "https://api.payapp.kr/oapi/apiLoad.html";

type RequestPayAppPaymentInput = {
  userId: string;
  shopName: string;
  orderId: string;
  profileId: string;
  amountKrw: number;
  cancelAmountKrw?: number;
  souls: number;
  buyerPhone: string;
  siteUrl: string;
  openPayTypes: string;
  fetchImpl?: typeof fetch;
};

type VerifyPayAppFeedbackInput = {
  userId: string;
  linkKey: string;
  linkValue: string;
  orderId: string;
  profileId: string;
  amountKrw: number;
};

export type VerifiedPayAppFeedback = {
  state: string;
  providerPaymentKey: string;
  orderId: string;
  profileId: string;
  amountKrw: number;
  payType?: string;
  payDate?: string;
  cancelDate?: string;
};

export async function requestPayAppPayment({
  userId,
  shopName,
  orderId,
  profileId,
  amountKrw,
  souls,
  buyerPhone,
  siteUrl,
  openPayTypes,
  fetchImpl = fetch,
}: RequestPayAppPaymentInput): Promise<{ providerPaymentKey: string; checkoutUrl: string }> {
  const baseUrl = siteUrl.replace(/\/$/, "");
  const body = new URLSearchParams({
    cmd: "payrequest",
    userid: userId,
    shopname: shopName,
    goodname: `전생서랍 ${souls}소울`,
    price: String(amountKrw),
    recvphone: buyerPhone,
    memo: `${souls}소울 충전`,
    reqaddr: "0",
    feedbackurl: `${baseUrl}/api/payment/webhook`,
    returnurl: `${baseUrl}/api/payment/return?orderId=${encodeURIComponent(orderId)}`,
    var1: orderId,
    var2: profileId,
    smsuse: "n",
    openpaytype: openPayTypes,
    checkretry: "y",
    skip_cstpage: "y",
  });
  const response = await fetchImpl(PAYAPP_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: body.toString(),
    cache: "no-store",
  });
  const payload = new URLSearchParams(await response.text());
  if (!response.ok || payload.get("state") !== "1") {
    throw new Error(payload.get("errorMessage")?.trim() || "PayApp payment request failed");
  }
  const providerPaymentKey = payload.get("mul_no")?.trim() ?? "";
  const checkoutUrl = payload.get("payurl")?.trim() ?? "";
  if (!/^\d+$/.test(providerPaymentKey) || !isPayAppUrl(checkoutUrl)) {
    throw new Error("invalid PayApp payment response");
  }
  return { providerPaymentKey, checkoutUrl };
}

export function verifyPayAppFeedback(
  feedback: URLSearchParams,
  expected: VerifyPayAppFeedbackInput,
): VerifiedPayAppFeedback {
  const state = feedback.get("pay_state")?.trim() ?? "";
  const isPartialCancellation = state === "70" || state === "71";
  const providerPaymentKey = feedback.get(isPartialCancellation ? "orig_mul_no" : "mul_no")?.trim() ?? "";
  const orderId = feedback.get("var1")?.trim() ?? "";
  const profileId = feedback.get("var2")?.trim() ?? "";
  const amountKrw = Number(feedback.get(isPartialCancellation ? "orig_price" : "price"));
  const cancelAmountKrw = isPartialCancellation ? Number(feedback.get("price")) : undefined;
  const valid = (
    secureEqual(feedback.get("userid") ?? "", expected.userId)
    && secureEqual(feedback.get("linkkey") ?? "", expected.linkKey)
    && secureEqual(feedback.get("linkval") ?? "", expected.linkValue)
    && orderId === expected.orderId
    && profileId === expected.profileId
    && amountKrw === expected.amountKrw
    && /^\d+$/.test(providerPaymentKey)
    && (!isPartialCancellation || (
      typeof cancelAmountKrw === "number"
      && Number.isSafeInteger(cancelAmountKrw)
      && cancelAmountKrw > 0
      && cancelAmountKrw < amountKrw
    ))
  );
  if (!valid) throw new Error("invalid PayApp feedback");
  return {
    state,
    providerPaymentKey,
    orderId,
    profileId,
    amountKrw,
    ...(typeof cancelAmountKrw === "number" && Number.isSafeInteger(cancelAmountKrw) ? { cancelAmountKrw } : {}),
    ...(feedback.get("pay_type") ? { payType: feedback.get("pay_type")! } : {}),
    ...(feedback.get("pay_date") ? { payDate: feedback.get("pay_date")! } : {}),
    ...(feedback.get("canceldate") ? { cancelDate: feedback.get("canceldate")! } : {}),
  };
}

function secureEqual(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function isPayAppUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:")
      && (url.hostname === "payapp.kr" || url.hostname.endsWith(".payapp.kr"));
  } catch {
    return false;
  }
}
