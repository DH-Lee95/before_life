import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSoulRepository } from "@/lib/repository/repositoryProvider";
import { ANONYMOUS_SESSION_COOKIE } from "@/lib/session/anonymousSession";
import { hashResultToken } from "@/lib/session/resultToken";
import { toPublicSoulProfile } from "@/lib/soul/toPublicSoulProfile";

type RouteContext = {
  params: Promise<{
    profileId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { profileId } = await context.params;
  const token = new URL(request.url).searchParams.get("token");

  const cookieStore = await cookies();
  const anonymousSessionId = cookieStore.get(ANONYMOUS_SESSION_COOKIE)?.value;
  const repository = getSoulRepository();
  const result = await repository.getResult(profileId, token ? hashResultToken(token) : undefined, anonymousSessionId);

  if (!result || !result.freeContent) {
    return NextResponse.json({ message: "result not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: toPublicSoulProfile(result.profile),
    freeContent: result.freeContent,
  });
}
