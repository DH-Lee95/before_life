import { NextResponse } from "next/server";

export function GET(request: Request) {
  return redirectToResult(request);
}

export function POST(request: Request) {
  return redirectToResult(request);
}

function redirectToResult(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId") ?? "";
  const target = /^[A-Za-z0-9_-]{6,64}$/.test(orderId)
    ? `/payment/success?orderId=${encodeURIComponent(orderId)}`
    : "/payment/fail?code=INVALID_RETURN";
  return NextResponse.redirect(new URL(target, url.origin), 303);
}
