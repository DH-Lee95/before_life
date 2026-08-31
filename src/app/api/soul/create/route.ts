import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAccountRepository } from "@/lib/auth/accountRepository";
import { getAuthenticatedUser } from "@/lib/auth/serverClient";
import { createFreeResult } from "@/lib/content/createFreeResult";
import { getSoulRepository } from "@/lib/repository/repositoryProvider";
import { consumeApiRateLimit } from "@/lib/security/apiRateLimit";
import { ANONYMOUS_SESSION_COOKIE, anonymousSessionCookieOptions, createAnonymousSessionId } from "@/lib/session/anonymousSession";
import { createResultToken, hashResultToken } from "@/lib/session/resultToken";
import { createSoulProfile } from "@/lib/soul/createSoulProfile";
import { validateSoulInput } from "@/lib/soul/validateSoulInput";

export async function POST(request: Request) {
  try {
    const rateLimit = await consumeApiRateLimit({
      request, scope: "soul-create", limit: 20, windowSeconds: 60 * 60,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "잠시 후 다시 시도해주세요." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }
  } catch (error) {
    console.error("Soul creation rate limiter failed", error);
  }

  let body;
  try {
    body = validateSoulInput(await request.json());
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "invalid soul input" },
      { status: 400 },
    );
  }

  try {
    const profile = createSoulProfile(body);
    const resultToken = createResultToken();
    const resultTokenHash = hashResultToken(resultToken);

    const cookieStore = await cookies();
    let anonymousSessionId = cookieStore.get(ANONYMOUS_SESSION_COOKIE)?.value;
    if (!anonymousSessionId) {
      anonymousSessionId = createAnonymousSessionId();
      cookieStore.set(ANONYMOUS_SESSION_COOKIE, anonymousSessionId, anonymousSessionCookieOptions());
    }

    const repository = getSoulRepository();
    const storedProfile = await repository.upsertProfile({
      profile,
      anonymousSessionId,
      resultTokenHash,
    });

    const freeContent = await repository.upsertContent({
      soulProfileId: storedProfile.id,
      contentType: "free_summary",
      content: createFreeResult(storedProfile),
    });

    const user = await getAuthenticatedUser().catch(() => null);
    if (user) {
      await getAccountRepository().claimSession(anonymousSessionId, user.id);
    }

    return NextResponse.json({
      profileId: storedProfile.id,
      resultToken,
      displaySoulId: storedProfile.displaySoulId,
      discoveryPercent: storedProfile.discoveryPercent,
      freeContent,
    });
  } catch (error) {
    console.error("Failed to create and link soul result", error);
    return NextResponse.json(
      { message: "결과를 계정에 연결하지 못했습니다. 잠시 후 다시 시도해주세요." },
      { status: 503 },
    );
  }
}
