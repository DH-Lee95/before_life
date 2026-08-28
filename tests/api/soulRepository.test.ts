import { describe, expect, it } from "vitest";

import { createFreeResult } from "@/lib/content/createFreeResult";
import { createMemorySoulRepository } from "@/lib/repository/memorySoulRepository";
import { createResultToken, hashResultToken } from "@/lib/session/resultToken";
import { createSoulProfile } from "@/lib/soul/createSoulProfile";

describe("memory soul repository", () => {
  it("reuses a profile and content for the same soul hash", async () => {
    const repo = createMemorySoulRepository();
    const profile = createSoulProfile({
      nickname: "민지",
      birthDate: "1997-08-21",
      answers: {
        inner_response: "a",
        decision_pattern: "b",
        emotional_trace: "c",
        conflict_style: "d",
        hidden_desire: "e",
        repeated_theme: "f",
        decisive_choice: "b",
      },
    });

    const token = createResultToken();
    const first = await repo.upsertProfile({
      profile,
      anonymousSessionId: "session-1",
      resultTokenHash: hashResultToken(token),
    });
    const second = await repo.upsertProfile({
      profile,
      anonymousSessionId: "session-1",
      resultTokenHash: hashResultToken(createResultToken()),
    });

    expect(second.id).toBe(first.id);
    await expect(repo.listProfiles()).resolves.toHaveLength(1);

    await repo.upsertContent({
      soulProfileId: first.id,
      contentType: "free_summary",
      content: createFreeResult(profile),
    });
    await repo.upsertContent({
      soulProfileId: first.id,
      contentType: "free_summary",
      content: createFreeResult(profile),
    });

    await expect(repo.listContents()).resolves.toHaveLength(1);
  });
});
