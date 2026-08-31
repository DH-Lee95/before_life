import type { SoulContent, SoulContentType, SoulProfile } from "@/types/soul";

import type { SoulRepository, StoredSoulProfile, UpsertContentInput } from "./soulRepository";

export type SupabaseProfileRow = {
  id: string;
  profile: SoulProfile;
  created_at: string;
};

export type SupabaseContentRow = {
  soul_profile_id: string;
  content_type: SoulContentType;
  generation_key: string;
  content: SoulContent["content"];
  is_unlocked: boolean;
  created_at: string;
};

type UpsertProfileRow = SupabaseProfileRow & {
  soul_hash: string;
  display_soul_id: string;
  input_version: string;
  engine_version: string;
};

export type SupabaseSoulStore = {
  upsertAnonymousSession: (sessionId: string) => Promise<{ id: string }>;
  upsertProfile: (row: UpsertProfileRow) => Promise<SupabaseProfileRow>;
  grantSessionAccess: (profileId: string, anonymousSessionRowId: string) => Promise<void>;
  grantTokenAccess: (profileId: string, resultTokenHash: string) => Promise<void>;
  grantUserAccess: (profileId: string, userId: string) => Promise<void>;
  upsertContent: (row: SupabaseContentRow) => Promise<SupabaseContentRow>;
  getContent: (profileId: string, contentType: SoulContentType, generationKey: string) => Promise<SupabaseContentRow | null>;
  getProfile: (profileId: string) => Promise<SupabaseProfileRow | null>;
  hasAccess: (profileId: string, resultTokenHash?: string, anonymousSessionId?: string, userId?: string) => Promise<boolean>;
  listProfiles: () => Promise<SupabaseProfileRow[]>;
  listContents: () => Promise<SupabaseContentRow[]>;
};

export function createSupabaseSoulRepository(store: SupabaseSoulStore): SoulRepository {
  return {
    async upsertProfile({ profile, anonymousSessionId, resultTokenHash }) {
      const session = await store.upsertAnonymousSession(anonymousSessionId);
      const id = `sp_${profile.soulHash.slice(0, 16)}`;
      const row = await store.upsertProfile({
        id,
        soul_hash: profile.soulHash,
        display_soul_id: profile.displaySoulId,
        input_version: profile.inputVersion,
        engine_version: profile.engineVersion,
        profile,
        created_at: new Date().toISOString(),
      });
      await Promise.all([
        store.grantSessionAccess(row.id, session.id),
        store.grantTokenAccess(row.id, resultTokenHash),
      ]);

      return toStoredProfile(row, [anonymousSessionId], [resultTokenHash]);
    },
    async upsertContent(input) {
      const row = await store.upsertContent(toContentRow(input));
      return toSoulContent(row);
    },
    async grantUserAccess(profileId, userId) {
      await store.grantUserAccess(profileId, userId);
    },
    async getContent(profileId, contentType, generationKey) {
      const row = await store.getContent(profileId, contentType, generationKey ?? "default");
      return row ? toSoulContent(row) : null;
    },
    async getResult(profileId, resultTokenHash, anonymousSessionId, userId) {
      if (!resultTokenHash && !anonymousSessionId && !userId) return null;
      if (!await store.hasAccess(profileId, resultTokenHash, anonymousSessionId, userId)) return null;

      const row = await store.getProfile(profileId);
      if (!row) return null;
      const freeContent = await store.getContent(profileId, "free_summary", "default");

      return {
        profile: toStoredProfile(
          row,
          anonymousSessionId ? [anonymousSessionId] : [],
          resultTokenHash ? [resultTokenHash] : [],
        ),
        freeContent: freeContent ? toSoulContent(freeContent) : null,
      };
    },
    async listProfiles() {
      return (await store.listProfiles()).map((row) => toStoredProfile(row));
    },
    async listContents() {
      return (await store.listContents()).map(toSoulContent);
    },
  };
}

function toStoredProfile(
  row: SupabaseProfileRow,
  anonymousSessionIds: string[] = [],
  resultTokenHashes: string[] = [],
): StoredSoulProfile {
  return {
    ...row.profile,
    id: row.id,
    anonymousSessionIds,
    resultTokenHashes,
    createdAt: row.created_at,
  };
}

function toContentRow(input: UpsertContentInput): SupabaseContentRow {
  return {
    soul_profile_id: input.soulProfileId,
    content_type: input.contentType,
    generation_key: input.generationKey ?? "default",
    content: input.content,
    is_unlocked: input.contentType === "free_summary",
    created_at: new Date().toISOString(),
  };
}

function toSoulContent(row: SupabaseContentRow): SoulContent {
  return {
    soulProfileId: row.soul_profile_id,
    contentType: row.content_type,
    content: row.content,
    isUnlocked: row.is_unlocked,
    createdAt: row.created_at,
  };
}
