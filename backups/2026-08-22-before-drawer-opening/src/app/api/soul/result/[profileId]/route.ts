import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { lockedContentTypes } from "@/config/contentTypes";
import { getSoulRepository } from "@/lib/repository/memorySoulRepository";
import { ANONYMOUS_SESSION_COOKIE } from "@/lib/session/anonymousSession";
import { hashResultToken } from "@/lib/session/resultToken";

type RouteContext = {
  params: Promise<{
    profileId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { profileId } = await context.params;
  const token = new URL(request.url).searchParams.get("token");

  if (!token) {
    return NextResponse.json({ message: "result token is required" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const anonymousSessionId = cookieStore.get(ANONYMOUS_SESSION_COOKIE)?.value;
  const repository = getSoulRepository();
  const result = repository.getResult(profileId, hashResultToken(token), anonymousSessionId);

  if (!result || !result.freeContent) {
    return NextResponse.json({ message: "result not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: result.profile,
    freeContent: result.freeContent,
    lockedContentTypes,
  });
}
