import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAccountRepository } from "@/lib/auth/accountRepository";
import { getAuthenticatedUser } from "@/lib/auth/serverClient";
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
  const token = request.headers.get("X-Result-Token") ?? new URL(request.url).searchParams.get("token");

  const cookieStore = await cookies();
  const anonymousSessionId = cookieStore.get(ANONYMOUS_SESSION_COOKIE)?.value;
  const user = await getAuthenticatedUser().catch(() => null);
  const repository = getSoulRepository();
  const result = await repository.getResult(profileId, token ? hashResultToken(token) : undefined, anonymousSessionId, user?.id);

  if (!result || !result.freeContent) {
    return NextResponse.json({ message: "result not found" }, { status: 404 });
  }
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const nickname = metadata
    ? [metadata.nickname, metadata.name, metadata.preferred_username]
      .find((value): value is string => typeof value === "string" && value.trim().length > 0)
    : undefined;
  const accountRepository = user ? getAccountRepository() : null;
  const [unlockedContents, balance] = user && accountRepository
    ? await Promise.all([
      accountRepository.getUnlockedContents(user.id, profileId),
      accountRepository.getBalance(user.id),
    ])
    : [[], 0];

  return NextResponse.json({
    profile: toPublicSoulProfile(result.profile),
    freeContent: result.freeContent,
    unlockedContents,
    account: user
      ? { authenticated: true, ...(nickname ? { nickname } : {}), balance }
      : { authenticated: false, balance: 0 },
  });
}
