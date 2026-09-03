type PaymentEnvironment = {
  PAYAPP_USER_ID?: string;
  PAYAPP_LINK_KEY?: string;
  PAYAPP_LINK_VALUE?: string;
  PAYAPP_MODE?: string;
  PAYAPP_OPEN_PAY_TYPES?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  BUSINESS_NAME?: string;
};

export function readPaymentEnvironment(environment: PaymentEnvironment) {
  const userId = environment.PAYAPP_USER_ID?.trim();
  const linkKey = environment.PAYAPP_LINK_KEY?.trim();
  const linkValue = environment.PAYAPP_LINK_VALUE?.trim();
  const mode = environment.PAYAPP_MODE?.trim();
  const rawSiteUrl = environment.NEXT_PUBLIC_SITE_URL?.trim();
  if (!userId || !linkKey || !linkValue || !rawSiteUrl || (mode !== "test" && mode !== "live")) {
    throw new Error("payment is not configured");
  }
  const siteUrl = new URL(rawSiteUrl);
  if (mode === "live" && siteUrl.protocol !== "https:") {
    throw new Error("live payments require an HTTPS site URL");
  }
  if (siteUrl.protocol !== "https:" && siteUrl.protocol !== "http:") {
    throw new Error("invalid payment site URL");
  }
  return {
    userId,
    linkKey,
    linkValue,
    mode: mode as "test" | "live",
    siteUrl: siteUrl.toString().replace(/\/$/, ""),
    shopName: environment.BUSINESS_NAME?.trim() || "전생서랍",
    openPayTypes: environment.PAYAPP_OPEN_PAY_TYPES?.trim()
      || "card,kakaopay,naverpay,applepay,payco,tosspay",
  };
}
