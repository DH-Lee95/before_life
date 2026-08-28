import { describe, expect, it, vi } from "vitest";

import { createSoulProfile } from "@/lib/soul/createSoulProfile";

import { createSupabaseSoulRepository, type SupabaseSoulStore } from "./supabaseSoulRepository";

const profile = createSoulProfile({
  nickname: "서연",
  birthDate: "1994-11-18",
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

function createStore(overrides: Partial<SupabaseSoulStore> = {}): SupabaseSoulStore {
  return {
    upsertAnonymousSession: vi.fn().mockResolvedValue({ id: "session-row" }),
    upsertProfile: vi.fn().mockResolvedValue({
      id: `sp_${profile.soulHash.slice(0, 16)}`,
      profile,
      created_at: "2026-08-28T00:00:00.000Z",
    }),
    grantSessionAccess: vi.fn().mockResolvedValue(undefined),
    grantTokenAccess: vi.fn().mockResolvedValue(undefined),
    upsertContent: vi.fn(),
    getContent: vi.fn().mockResolvedValue(null),
    getProfile: vi.fn().mockResolvedValue(null),
    hasAccess: vi.fn().mockResolvedValue(false),
    listProfiles: vi.fn().mockResolvedValue([]),
    listContents: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe("createSupabaseSoulRepository", () => {
  it("upserts the deterministic profile and both access grants", async () => {
    const store = createStore();
    const repository = createSupabaseSoulRepository(store);

    const stored = await repository.upsertProfile({
      profile,
      anonymousSessionId: "anonymous-cookie",
      resultTokenHash: "token-hash",
    });

    expect(store.upsertProfile).toHaveBeenCalledWith(expect.objectContaining({
      id: `sp_${profile.soulHash.slice(0, 16)}`,
      soul_hash: profile.soulHash,
      input_version: profile.inputVersion,
      engine_version: profile.engineVersion,
    }));
    expect(store.grantSessionAccess).toHaveBeenCalledWith(stored.id, "session-row");
    expect(store.grantTokenAccess).toHaveBeenCalledWith(stored.id, "token-hash");
  });

  it("returns a result only after token or session authorization", async () => {
    const row = {
      id: "sp_profile",
      profile,
      created_at: "2026-08-28T00:00:00.000Z",
    };
    const freeContentRow = {
      soul_profile_id: row.id,
      content_type: "free_summary" as const,
      generation_key: "default",
      content: "free",
      is_unlocked: true,
      created_at: row.created_at,
    };
    const store = createStore({
      getProfile: vi.fn().mockResolvedValue(row),
      hasAccess: vi.fn().mockResolvedValue(true),
      getContent: vi.fn().mockResolvedValue(freeContentRow),
    });

    const result = await createSupabaseSoulRepository(store).getResult(row.id, "token-hash", undefined);

    expect(store.hasAccess).toHaveBeenCalledWith(row.id, "token-hash", undefined);
    expect(result?.freeContent).toEqual({
      soulProfileId: row.id,
      contentType: "free_summary",
      content: "free",
      isUnlocked: true,
      createdAt: row.created_at,
    });
    expect(result?.profile.id).toBe(row.id);
  });

  it("does not read a profile when no credential grants access", async () => {
    const store = createStore();

    await expect(createSupabaseSoulRepository(store).getResult("sp_profile", undefined, "stranger")).resolves.toBeNull();
    expect(store.getProfile).not.toHaveBeenCalled();
  });

  it("propagates database failures instead of falling back to memory", async () => {
    const failure = new Error("database unavailable");
    const store = createStore({ upsertAnonymousSession: vi.fn().mockRejectedValue(failure) });

    await expect(createSupabaseSoulRepository(store).upsertProfile({
      profile,
      anonymousSessionId: "anonymous-cookie",
      resultTokenHash: "token-hash",
    })).rejects.toBe(failure);
  });
});
