import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAnalyticsRepository } from "@/lib/analytics/analyticsProvider";
import { ANONYMOUS_SESSION_COOKIE } from "@/lib/session/anonymousSession";
import { consumeApiRateLimit } from "@/lib/security/apiRateLimit";
import { validateAnalyticsEvent } from "@/lib/analytics/validateAnalyticsEvent";

export async function POST(request: Request) {
  try {
    const rateLimit = await consumeApiRateLimit({
      request, scope: "analytics", limit: 120, windowSeconds: 10 * 60,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "too many analytics events" },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }
  } catch (error) {
    console.error("Analytics rate limiter failed", error);
  }

  let body;
  try {
    body = validateAnalyticsEvent(await request.json());
  } catch {
    return NextResponse.json({ message: "analytics event is invalid" }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();
    const anonymousSessionId = cookieStore.get(ANONYMOUS_SESSION_COOKIE)?.value;
    await getAnalyticsRepository().track({
      ...body,
      ...(anonymousSessionId ? { anonymousSessionId } : {}),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "analytics is temporarily unavailable" },
      { status: 503 },
    );
  }
}
