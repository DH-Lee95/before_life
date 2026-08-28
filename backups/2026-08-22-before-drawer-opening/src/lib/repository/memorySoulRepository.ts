import type { FreeResultContent, SoulContent, SoulContentType, SoulProfile } from "@/types/soul";

export type StoredSoulProfile = SoulProfile & {
  id: string;
  anonymousSessionIds: string[];
  resultTokenHashes: string[];
  createdAt: string;
};

export type UpsertProfileInput = {
  profile: SoulProfile;
  anonymousSessionId: string;
  resultTokenHash: string;
};

export type UpsertContentInput = {
  soulProfileId: string;
  contentType: SoulContentType;
  content: FreeResultContent | string;
};

export type SoulRepository = {
  upsertProfile: (input: UpsertProfileInput) => StoredSoulProfile;
  upsertContent: (input: UpsertContentInput) => SoulContent;
  getResult: (profileId: string, resultTokenHash: string, anonymousSessionId?: string) => {
    profile: StoredSoulProfile;
    freeContent: SoulContent | null;
  } | null;
  listProfiles: () => StoredSoulProfile[];
  listContents: () => SoulContent[];
};

export function createMemorySoulRepository(): SoulRepository {
  const profilesByHash = new Map<string, StoredSoulProfile>();
  const profilesById = new Map<string, StoredSoulProfile>();
  const contents = new Map<string, SoulContent>();

  return {
    upsertProfile({ profile, anonymousSessionId, resultTokenHash }) {
      const existing = profilesByHash.get(profile.soulHash);
      if (existing) {
        if (!existing.anonymousSessionIds.includes(anonymousSessionId)) {
          existing.anonymousSessionIds.push(anonymousSessionId);
        }
        if (!existing.resultTokenHashes.includes(resultTokenHash)) {
          existing.resultTokenHashes.push(resultTokenHash);
        }
        return existing;
      }

      const id = `sp_${profile.soulHash.slice(0, 16)}`;
      const stored: StoredSoulProfile = {
        ...profile,
        id,
        anonymousSessionIds: [anonymousSessionId],
        resultTokenHashes: [resultTokenHash],
        createdAt: new Date().toISOString(),
      };

      profilesByHash.set(profile.soulHash, stored);
      profilesById.set(id, stored);
      return stored;
    },
    upsertContent({ soulProfileId, contentType, content }) {
      const key = `${soulProfileId}:${contentType}`;
      const existing = contents.get(key);
      if (existing) {
        return existing;
      }

      const stored: SoulContent = {
        soulProfileId,
        contentType,
        content,
        isUnlocked: contentType === "free_summary",
        createdAt: new Date().toISOString(),
      };

      contents.set(key, stored);
      return stored;
    },
    getResult(profileId, resultTokenHash, anonymousSessionId) {
      const profile = profilesById.get(profileId);
      if (!profile) {
        return null;
      }

      const hasToken = profile.resultTokenHashes.includes(resultTokenHash);
      const hasSession = anonymousSessionId ? profile.anonymousSessionIds.includes(anonymousSessionId) : false;
      if (!hasToken && !hasSession) {
        return null;
      }

      return {
        profile,
        freeContent: contents.get(`${profileId}:free_summary`) ?? null,
      };
    },
    listProfiles() {
      return Array.from(profilesById.values());
    },
    listContents() {
      return Array.from(contents.values());
    },
  };
}

const globalForRepository = globalThis as typeof globalThis & {
  __soulRepository?: SoulRepository;
};

export function getSoulRepository(): SoulRepository {
  if (!globalForRepository.__soulRepository) {
    globalForRepository.__soulRepository = createMemorySoulRepository();
  }

  return globalForRepository.__soulRepository;
}
