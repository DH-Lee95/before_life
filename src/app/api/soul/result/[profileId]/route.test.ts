import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFreeResult } from "@/lib/content/createFreeResult";
import { getSoulRepository } from "@/lib/repository/repositoryProvider";
import { createSoulProfile } from "@/lib/soul/createSoulProfile";
import { hashResultToken } from "@/lib/session/resultToken";
import { GET } from "./route";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => ({ value: "route-owner" }) })),
}));

describe("GET /api/soul/result/[profileId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows an owning session without a URL token and returns only public profile fields", async () => {
    const repository = getSoulRepository();
    const profile = createSoulProfile({
      nickname: "서연", birthDate: "1994-11-18",
      answers: { inner_response: "a", decision_pattern: "b", emotional_trace: "c", conflict_style: "d", hidden_desire: "e", repeated_theme: "f", decisive_choice: "b" },
    });
    const stored = await repository.upsertProfile({ profile, anonymousSessionId: "route-owner", resultTokenHash: "secret-hash" });
    await repository.upsertContent({ soulProfileId: stored.id, contentType: "free_summary", content: createFreeResult(profile) });

    const response = await GET(new Request(`http://localhost/api/soul/result/${stored.id}`), {
      params: Promise.resolve({ profileId: stored.id }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.profile).toEqual({ displaySoulId: stored.displaySoulId, discoveryPercent: 17 });
    expect(body.profile).not.toHaveProperty("resultTokenHashes");
    expect(body).not.toHaveProperty("lockedContentTypes");
  });

  it("allows a shared result token through a request header without putting it in the URL", async () => {
    const repository = getSoulRepository();
    const token = "shared-result-token";
    const profile = createSoulProfile({
      nickname: "공유자", birthDate: "1991-03-09",
      answers: { inner_response: "b", decision_pattern: "c", emotional_trace: "d", conflict_style: "e", hidden_desire: "a", repeated_theme: "b", decisive_choice: "c" },
    });
    const stored = await repository.upsertProfile({
      profile,
      anonymousSessionId: "different-owner",
      resultTokenHash: hashResultToken(token),
    });
    await repository.upsertContent({ soulProfileId: stored.id, contentType: "free_summary", content: createFreeResult(profile) });

    const response = await GET(new Request(`http://localhost/api/soul/result/${stored.id}`, {
      headers: { "X-Result-Token": token },
    }), { params: Promise.resolve({ profileId: stored.id }) });

    expect(response.status).toBe(200);
  });
});
