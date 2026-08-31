export type BusinessEnvironment = {
  BUSINESS_NAME?: string;
  BUSINESS_REPRESENTATIVE?: string;
  BUSINESS_REGISTRATION_NUMBER?: string;
  BUSINESS_ADDRESS?: string;
  CUSTOMER_SUPPORT_EMAIL?: string;
  CUSTOMER_SUPPORT_PHONE?: string;
  MAIL_ORDER_REGISTRATION_NUMBER?: string;
  PRIVACY_OFFICER_NAME?: string;
};

export type BusinessInformation = {
  complete: boolean;
  name: string;
  representative: string;
  registrationNumber: string;
  address: string;
  supportEmail: string;
  supportPhone: string;
  mailOrderRegistrationNumber: string;
  privacyOfficerName: string;
};

export function readBusinessInformation(environment?: BusinessEnvironment): BusinessInformation {
  const resolved = environment ?? {
    BUSINESS_NAME: process.env.BUSINESS_NAME,
    BUSINESS_REPRESENTATIVE: process.env.BUSINESS_REPRESENTATIVE,
    BUSINESS_REGISTRATION_NUMBER: process.env.BUSINESS_REGISTRATION_NUMBER,
    BUSINESS_ADDRESS: process.env.BUSINESS_ADDRESS,
    CUSTOMER_SUPPORT_EMAIL: process.env.CUSTOMER_SUPPORT_EMAIL,
    CUSTOMER_SUPPORT_PHONE: process.env.CUSTOMER_SUPPORT_PHONE,
    MAIL_ORDER_REGISTRATION_NUMBER: process.env.MAIL_ORDER_REGISTRATION_NUMBER,
    PRIVACY_OFFICER_NAME: process.env.PRIVACY_OFFICER_NAME,
  };
  const information = {
    name: resolved.BUSINESS_NAME?.trim() ?? "",
    representative: resolved.BUSINESS_REPRESENTATIVE?.trim() ?? "",
    registrationNumber: resolved.BUSINESS_REGISTRATION_NUMBER?.trim() ?? "",
    address: resolved.BUSINESS_ADDRESS?.trim() ?? "",
    supportEmail: resolved.CUSTOMER_SUPPORT_EMAIL?.trim() ?? "",
    supportPhone: resolved.CUSTOMER_SUPPORT_PHONE?.trim() ?? "",
    mailOrderRegistrationNumber: resolved.MAIL_ORDER_REGISTRATION_NUMBER?.trim() ?? "",
    privacyOfficerName: resolved.PRIVACY_OFFICER_NAME?.trim() ?? "",
  };
  return { complete: Object.values(information).every(Boolean), ...information };
}

export function assertLiveCommerceReady(mode: "test" | "live", environment?: BusinessEnvironment): void {
  if (mode === "live" && !readBusinessInformation(environment).complete) {
    throw new Error("business information must be configured before live payments");
  }
}
