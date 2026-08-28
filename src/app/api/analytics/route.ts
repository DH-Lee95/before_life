import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAnalytics } from "@/lib/analytics/memoryAnalytics";
import { ANONYMOUS_SESSION_COOKIE } from "@/lib/session/anonymousSession";
import { validateAnalyticsEvent } from "@/lib/analytics/validateAnalyticsEvent";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const body = validateAnalyticsEvent(await request.json());
    const anonymousSessionId = cookieStore.get(ANONYMOUS_SESSION_COOKIE)?.value;
    getAnalytics().track({ ...body, anonymousSessionId });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "analytics event is invalid" }, { status: 400 });
  }
}
