import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createStoryCacheKey, generateStoryWithOpenAI } from "@/app/api/_lib/openAiStoryProvider";
import { lockedContentTypes } from "@/config/contentTypes";
import { createStoryGenerationPrompt, createWholeLifeGenerationPrompt } from "@/lib/content/createStoryGenerationPrompt";
import { getSoulRepository } from "@/lib/repository/repositoryProvider";
import { ANONYMOUS_SESSION_COOKIE } from "@/lib/session/anonymousSession";
import { hashResultToken } from "@/lib/session/resultToken";
import type { LockedContentType, SoulContentType } from "@/types/soul";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const profileId = typeof body.profileId === "string" ? body.profileId : "";
    const token = typeof body.token === "string" ? body.token : "";
    const contentType = parsePreviewContentType(body.contentType);
    if (!profileId || !contentType) {
      return NextResponse.json({ message: "invalid preview request" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const anonymousSessionId = cookieStore.get(ANONYMOUS_SESSION_COOKIE)?.value;
    const repository = getSoulRepository();
    const result = await repository.getResult(profileId, token ? hashResultToken(token) : undefined, anonymousSessionId);
    if (!result) {
      return NextResponse.json({ message: "result not found" }, { status: 404 });
    }

    const prompt = contentType === "whole_life"
      ? createWholeLifeGenerationPrompt(result.profile)
      : createStoryGenerationPrompt(result.profile, contentType);
    const generationKey = createStoryCacheKey(result.profile.soulHash, contentType, prompt.version);
    const cached = await repository.getContent(result.profile.id, contentType, generationKey);
    if (cached) {
      return NextResponse.json({ contentType, content: cached.content, cached: true });
    }

    const generated = await generateStoryWithOpenAI({ prompt, promptCacheKey: generationKey });
    const stored = await repository.upsertContent({
      soulProfileId: result.profile.id,
      contentType,
      content: generated.content,
      generationKey,
    });

    return NextResponse.json({
      contentType,
      content: stored.content,
      cached: false,
      generation: {
        model: generated.model,
        repaired: generated.repaired,
        usage: generated.usage,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "story preview failed";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 502;
    return NextResponse.json({ message }, { status });
  }
}

function parsePreviewContentType(value: unknown): Exclude<SoulContentType, "free_summary"> | null {
  if (value === "whole_life") return value;
  if (typeof value === "string" && lockedContentTypes.some((content) => content.id === value)) {
    return value as LockedContentType;
  }
  return null;
}
