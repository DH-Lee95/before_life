import { NextResponse } from "next/server";

import { createStoryCacheKey, generateStoryWithOpenAI } from "@/app/api/_lib/openAiStoryProvider";
import { lockedContentTypes } from "@/config/contentTypes";
import { contentCosts } from "@/config/pricing";
import { getAccountRepository } from "@/lib/auth/accountRepository";
import { getAuthenticatedUser } from "@/lib/auth/serverClient";
import { createStoryGenerationPrompt, createWholeLifeGenerationPrompt } from "@/lib/content/createStoryGenerationPrompt";
import { getSoulRepository } from "@/lib/repository/repositoryProvider";
import type { LockedContentType, SoulContentType } from "@/types/soul";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "카카오 로그인이 필요합니다.", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    const body = await request.json() as Record<string, unknown>;
    const profileId = typeof body.profileId === "string" ? body.profileId : "";
    const contentType = parseContentType(body.contentType);
    if (!profileId || !contentType) {
      return NextResponse.json({ message: "invalid unlock request" }, { status: 400 });
    }

    const repository = getSoulRepository();
    const result = await repository.getResult(profileId, undefined, undefined, user.id);
    if (!result) return NextResponse.json({ message: "result not found" }, { status: 404 });

    const prompt = contentType === "whole_life"
      ? createWholeLifeGenerationPrompt(result.profile)
      : createStoryGenerationPrompt(result.profile, contentType);
    const generationKey = createStoryCacheKey(result.profile.soulHash, contentType, prompt.version);
    const cost = contentType === "whole_life" ? contentCosts.wholeLife : contentCosts.deepRecord;
    const accountRepository = getAccountRepository();
    const existingUnlock = (await accountRepository.getUnlockedContents(user.id, profileId)).find(
      (item) => item.contentType === contentType,
    );
    const balance = await accountRepository.getBalance(user.id);
    if (existingUnlock) {
      return NextResponse.json({ contentType, content: existingUnlock.content, balance, charged: false });
    }
    if (balance < cost) {
      return NextResponse.json({
        message: `${cost}소울이 필요합니다.`,
        code: "INSUFFICIENT_SOUL",
        required: cost,
        balance,
      }, { status: 402 });
    }
    let content = await repository.getContent(profileId, contentType, generationKey);
    if (!content) {
      const generated = await generateStoryWithOpenAI({ prompt, promptCacheKey: generationKey });
      content = await repository.upsertContent({
        soulProfileId: profileId,
        contentType,
        content: generated.content,
        generationKey,
      });
    }

    const unlocked = await accountRepository.unlockContent(user.id, profileId, contentType, generationKey, cost);
    return NextResponse.json({ contentType, content: content.content, ...unlocked });
  } catch (error) {
    const message = error instanceof Error ? error.message : "content unlock failed";
    if (message.includes("insufficient soul balance")) {
      return NextResponse.json({ message: "소울이 부족합니다.", code: "INSUFFICIENT_SOUL" }, { status: 402 });
    }
    return NextResponse.json({ message }, { status: 502 });
  }
}

function parseContentType(value: unknown): Exclude<SoulContentType, "free_summary"> | null {
  if (value === "whole_life") return value;
  if (typeof value === "string" && lockedContentTypes.some((content) => content.id === value)) {
    return value as LockedContentType;
  }
  return null;
}
