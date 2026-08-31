import { describe, expect, it } from "vitest";

import { createMemorySoulRepository } from "./memorySoulRepository";
import { createSoulProfile } from "@/lib/soul/createSoulProfile";

describe("createMemorySoulRepository", () => {
  it("starts empty", async () => {
    const repo = createMemorySoulRepository();

    await expect(repo.listProfiles()).resolves.toEqual([]);
    await expect(repo.listContents()).resolves.toEqual([]);
  });

  it("allows the owning anonymous session to revisit without a URL token", async () => {
    const repo = createMemorySoulRepository();
    const profile = createSoulProfile({
      nickname: "서연", birthDate: "1994-11-18",
      answers: { inner_response: "a", decision_pattern: "b", emotional_trace: "c", conflict_style: "d", hidden_desire: "e", repeated_theme: "f", decisive_choice: "b" },
    });
    const stored = await repo.upsertProfile({ profile, anonymousSessionId: "owner", resultTokenHash: "hash" });

    expect((await repo.getResult(stored.id, undefined, "owner"))?.profile.id).toBe(stored.id);
    await expect(repo.getResult(stored.id, undefined, "stranger")).resolves.toBeNull();
  });

  it("allows a verified result to be attached to an authenticated account", async () => {
    const repo = createMemorySoulRepository();
    const profile = createSoulProfile({
      nickname: "서연", birthDate: "1994-11-18",
      answers: { inner_response: "a", decision_pattern: "b", emotional_trace: "c", conflict_style: "d", hidden_desire: "e", repeated_theme: "f", decisive_choice: "b" },
    });
    const stored = await repo.upsertProfile({ profile, anonymousSessionId: "owner", resultTokenHash: "hash" });

    await repo.grantUserAccess(stored.id, "user-id");

    expect((await repo.getResult(stored.id, undefined, undefined, "user-id"))?.profile.id).toBe(stored.id);
    await expect(repo.getResult(stored.id, undefined, undefined, "other-user")).resolves.toBeNull();
  });

  it("stores generated stories separately by prompt-version cache key", async () => {
    const repo = createMemorySoulRepository();
    const profile = createSoulProfile({
      nickname: "서연", birthDate: "1994-11-18",
      answers: { inner_response: "a", decision_pattern: "b", emotional_trace: "c", conflict_style: "d", hidden_desire: "e", repeated_theme: "f", decisive_choice: "b" },
    });
    const stored = await repo.upsertProfile({ profile, anonymousSessionId: "owner", resultTokenHash: "hash" });
    const first = await repo.upsertContent({
      soulProfileId: stored.id,
      contentType: "whole_life",
      content: "첫 생성",
      generationKey: "prompt-v1",
    });

    await expect(repo.getContent(stored.id, "whole_life", "prompt-v1")).resolves.toEqual(first);
    await expect(repo.getContent(stored.id, "whole_life", "prompt-v2")).resolves.toBeNull();
  });
});
