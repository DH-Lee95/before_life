import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAnalytics } from "@/lib/analytics/memoryAnalytics";
import { ANONYMOUS_SESSION_COOKIE } from "@/lib/session/anonymousSession";
import type { AnalyticsEvent } from "@/types/analytics";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const body = (await request.json()) as AnalyticsEvent;
  const anonymousSessionId = cookieStore.get(ANONYMOUS_SESSION_COOKIE)?.value;
  const stored = getAnalytics().track({
    ...body,
    anonymousSessionId: body.anonymousSessionId ?? anonymousSessionId,
  });

  return NextResponse.json({ ok: true, event: stored });
}
