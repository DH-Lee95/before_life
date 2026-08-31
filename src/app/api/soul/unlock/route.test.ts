import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthenticatedUser = vi.hoisted(() => vi.fn());
const getResult = vi.hoisted(() => vi.fn());
const getContent = vi.hoisted(() => vi.fn());
const upsertContent = vi.hoisted(() => vi.fn());
const getBalance = vi.hoisted(() => vi.fn());
const getUnlockedContents = vi.hoisted(() => vi.fn());
const unlockContent = vi.hoisted(() => vi.fn());
const claimSession = vi.hoisted(() => vi.fn());
const isSessionOwnedByUser = vi.hoisted(() => vi.fn());
const grantUserAccess = vi.hoisted(() => vi.fn());
const generateStoryWithOpenAI = vi.hoisted(() => vi.fn());
const acquireContentGeneration = vi.hoisted(() => vi.fn());
const releaseContentGeneration = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/serverClient", () => ({ getAuthenticatedUser }));
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => ({ value: "anon_current" }) })),
}));
vi.mock("@/lib/auth/accountRepository", () => ({
  getAccountRepository: () => ({ getBalance, getUnlockedContents, unlockContent, claimSession, isSessionOwnedByUser }),
}));
vi.mock("@/lib/repository/repositoryProvider", () => ({
  getSoulRepository: () => ({ getResult, getContent, upsertContent, grantUserAccess }),
}));
vi.mock("@/app/api/_lib/openAiStoryProvider", () => ({
  createStoryCacheKey: () => "generation-key",
  generateStoryWithOpenAI,
}));
vi.mock("@/lib/content/contentGenerationLock", () => ({
  acquireContentGeneration,
  releaseContentGeneration,
}));
vi.mock("@/lib/content/createStoryGenerationPrompt", () => ({
  createStoryGenerationPrompt: () => ({ version: "v1" }),
  createWholeLifeGenerationPrompt: () => ({ version: "v1" }),
}));

import { maxDuration, POST } from "./route";

const story = {
  title: "끝까지 남은 편지",
  opening: "비가 내리던 날이었습니다.",
  chapters: [{ title: "첫 장", paragraphs: ["기록입니다."] }],
  presentMeaning: "현재에도 이어집니다.",
  readingTimeMinutes: 4,
};

function request(body: object, resultToken = "") {
  return new Request("http://localhost/api/soul/unlock", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(resultToken ? { "X-Result-Token": resultToken } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/soul/unlock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getResult.mockReset();
    getUnlockedContents.mockResolvedValue([]);
    isSessionOwnedByUser.mockResolvedValue(true);
    claimSession.mockResolvedValue({ claimed: true });
    grantUserAccess.mockResolvedValue(undefined);
    acquireContentGeneration.mockResolvedValue(true);
    releaseContentGeneration.mockResolvedValue(undefined);
  });

  it("allows enough execution time for the longest paid story", () => {
    expect(maxDuration).toBe(180);
  });

  it("requires Kakao login before spending soul", async () => {
    getAuthenticatedUser.mockResolvedValue(null);

    const response = await POST(request({ profileId: "sp_test", contentType: "last_day" }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ code: "AUTH_REQUIRED" });
  });

  it("repairs account access created after the user was already logged in", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-id" });
    getResult
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ profile: { id: "sp_test", soulHash: "hash" }, freeContent: {} });
    getBalance.mockResolvedValue(3);
    getContent.mockResolvedValue({ content: story });
    unlockContent.mockResolvedValue({ balance: 2, charged: true });

    const response = await POST(request({ profileId: "sp_test", contentType: "last_day" }));

    expect(response.status).toBe(200);
    expect(isSessionOwnedByUser).toHaveBeenCalledWith("anon_current", "user-id");
    expect(claimSession).toHaveBeenCalledWith("anon_current", "user-id");
    expect(getResult).toHaveBeenLastCalledWith("sp_test", undefined, undefined, "user-id");
  });

  it("accepts a valid result token without trusting an unrelated browser session", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-id" });
    isSessionOwnedByUser.mockResolvedValue(false);
    getResult
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ profile: { id: "sp_test", soulHash: "hash" }, freeContent: {} })
      .mockResolvedValueOnce({ profile: { id: "sp_test", soulHash: "hash" }, freeContent: {} });
    getBalance.mockResolvedValue(3);
    getContent.mockResolvedValue({ content: story });
    unlockContent.mockResolvedValue({ balance: 2, charged: true });

    const response = await POST(request({ profileId: "sp_test", contentType: "last_day" }, "valid-token"));

    expect(response.status).toBe(200);
    expect(claimSession).not.toHaveBeenCalled();
    expect(getResult).toHaveBeenNthCalledWith(1, "sp_test", undefined, undefined, "user-id");
    expect(getResult).toHaveBeenNthCalledWith(2, "sp_test", expect.any(String));
    expect(grantUserAccess).toHaveBeenCalledWith("sp_test", "user-id");
    expect(getResult).toHaveBeenLastCalledWith("sp_test", undefined, undefined, "user-id");
  });

  it("does not repair access from a browser session owned by another account", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-id" });
    getResult.mockResolvedValue(null);
    isSessionOwnedByUser.mockResolvedValue(false);

    const response = await POST(request({ profileId: "sp_test", contentType: "last_day" }));

    expect(response.status).toBe(404);
    expect(claimSession).not.toHaveBeenCalled();
    expect(unlockContent).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      code: "RESULT_NOT_FOUND",
      message: "이 전생 결과에 접근할 수 없습니다. 결과 페이지를 다시 열어주세요.",
    });
  });

  it("opens the family-bonds record for one soul with the user's account balance", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-id" });
    getResult.mockResolvedValue({ profile: { id: "sp_test", soulHash: "hash" }, freeContent: {} });
    getBalance.mockResolvedValue(3);
    getContent.mockResolvedValue(null);
    generateStoryWithOpenAI.mockResolvedValue({ content: story });
    upsertContent.mockResolvedValue({ content: story });
    unlockContent.mockResolvedValue({ balance: 2, charged: true });

    const response = await POST(request({ profileId: "sp_test", contentType: "family_bonds" }));

    expect(response.status).toBe(200);
    expect(unlockContent).toHaveBeenCalledWith("user-id", "sp_test", "family_bonds", "generation-key", 1);
    await expect(response.json()).resolves.toMatchObject({ contentType: "family_bonds", content: story, balance: 2 });
  });

  it("asks for a charge before generating content when the balance is short", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-id" });
    getResult.mockResolvedValue({ profile: { id: "sp_test", soulHash: "hash" }, freeContent: {} });
    getBalance.mockResolvedValue(0);

    const response = await POST(request({ profileId: "sp_test", contentType: "whole_life" }));

    expect(response.status).toBe(402);
    expect(generateStoryWithOpenAI).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({ code: "INSUFFICIENT_SOUL", required: 2 });
  });

  it("does not treat another account's globally cached content as this account's unlock", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "second-user" });
    getResult.mockResolvedValue({ profile: { id: "sp_test", soulHash: "hash" }, freeContent: {} });
    getContent.mockResolvedValue({ content: story, isUnlocked: true });
    getBalance.mockResolvedValue(3);
    unlockContent.mockResolvedValue({ balance: 2, charged: true });

    const response = await POST(request({ profileId: "sp_test", contentType: "last_day" }));

    expect(response.status).toBe(200);
    expect(unlockContent).toHaveBeenCalledWith("second-user", "sp_test", "last_day", "generation-key", 1);
    await expect(response.json()).resolves.toMatchObject({ charged: true, balance: 2 });
  });

  it("returns an account entitlement without charging or regenerating it", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-id" });
    getResult.mockResolvedValue({ profile: { id: "sp_test", soulHash: "hash" }, freeContent: {} });
    getUnlockedContents.mockResolvedValue([{
      soulProfileId: "sp_test",
      contentType: "last_day",
      generationKey: "previous-generation-key",
      content: story,
      isUnlocked: true,
      createdAt: "2026-08-30T00:00:00.000Z",
    }]);
    getBalance.mockResolvedValue(2);

    const response = await POST(request({ profileId: "sp_test", contentType: "last_day" }));

    expect(response.status).toBe(200);
    expect(unlockContent).not.toHaveBeenCalled();
    expect(generateStoryWithOpenAI).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({ content: story, charged: false, balance: 2 });
  });

  it("maps a concurrent balance loss rejected by the atomic RPC to payment required", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-id" });
    getResult.mockResolvedValue({ profile: { id: "sp_test", soulHash: "hash" }, freeContent: {} });
    getBalance.mockResolvedValue(1);
    getContent.mockResolvedValue({ content: story, isUnlocked: false });
    unlockContent.mockRejectedValue(new Error("Supabase account request failed (400): insufficient soul balance"));

    const response = await POST(request({ profileId: "sp_test", contentType: "last_day" }));

    expect(response.status).toBe(402);
    await expect(response.json()).resolves.toMatchObject({ code: "INSUFFICIENT_SOUL" });
  });

  it("returns an accepted response immediately while another request generates the same content", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-id" });
    getResult.mockResolvedValue({ profile: { id: "sp_test", soulHash: "hash" }, freeContent: {} });
    getBalance.mockResolvedValue(3);
    getContent.mockResolvedValue(null);
    acquireContentGeneration.mockResolvedValue(false);

    const response = await POST(request({ profileId: "sp_test", contentType: "last_day" }));

    expect(response.status).toBe(202);
    expect(generateStoryWithOpenAI).not.toHaveBeenCalled();
    expect(unlockContent).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({ code: "GENERATION_IN_PROGRESS" });
  });

  it("keeps a successful unlock successful when releasing the generation lock fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    getAuthenticatedUser.mockResolvedValue({ id: "user-id" });
    getResult.mockResolvedValue({ profile: { id: "sp_test", soulHash: "hash" }, freeContent: {} });
    getBalance.mockResolvedValue(3);
    getContent.mockResolvedValue(null);
    generateStoryWithOpenAI.mockResolvedValue({ content: story });
    upsertContent.mockResolvedValue({ content: story });
    unlockContent.mockResolvedValue({ balance: 2, charged: true });
    releaseContentGeneration.mockRejectedValue(new Error("temporary release failure"));

    const response = await POST(request({ profileId: "sp_test", contentType: "last_day" }));

    expect(response.status).toBe(200);
    expect(unlockContent).toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({ content: story, balance: 2, charged: true });
  });
});
