import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createFreeResult } from "@/lib/content/createFreeResult";
import { getSoulRepository } from "@/lib/repository/repositoryProvider";
import { ANONYMOUS_SESSION_COOKIE, createAnonymousSessionId } from "@/lib/session/anonymousSession";
import { createResultToken, hashResultToken } from "@/lib/session/resultToken";
import { createSoulProfile } from "@/lib/soul/createSoulProfile";
import { validateSoulInput } from "@/lib/soul/validateSoulInput";

export async function POST(request: Request) {
  try {
    const body = validateSoulInput(await request.json());
    const profile = createSoulProfile(body);
    const resultToken = createResultToken();
    const resultTokenHash = hashResultToken(resultToken);

    const cookieStore = await cookies();
    let anonymousSessionId = cookieStore.get(ANONYMOUS_SESSION_COOKIE)?.value;
    if (!anonymousSessionId) {
      anonymousSessionId = createAnonymousSessionId();
      cookieStore.set(ANONYMOUS_SESSION_COOKIE, anonymousSessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
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

    return NextResponse.json({
      profileId: storedProfile.id,
      resultToken,
      displaySoulId: storedProfile.displaySoulId,
      discoveryPercent: storedProfile.discoveryPercent,
      freeContent,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "failed to create soul profile" },
      { status: 400 },
    );
  }
}
