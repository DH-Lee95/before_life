import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAnalyticsRepository } from "@/lib/analytics/analyticsProvider";
import { ANONYMOUS_SESSION_COOKIE } from "@/lib/session/anonymousSession";
import { validateAnalyticsEvent } from "@/lib/analytics/validateAnalyticsEvent";

export async function POST(request: Request) {
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
