import type { SoulContent, SoulContentType } from "@/types/soul";

import type { SoulRepository, StoredSoulProfile } from "./soulRepository";

export function createMemorySoulRepository(): SoulRepository {
  const profilesByHash = new Map<string, StoredSoulProfile>();
  const profilesById = new Map<string, StoredSoulProfile>();
  const contents = new Map<string, SoulContent>();
  const userAccess = new Map<string, Set<string>>();

  return {
    async upsertProfile({ profile, anonymousSessionId, resultTokenHash }) {
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
    async grantUserAccess(profileId, userId) {
      const profileUsers = userAccess.get(profileId) ?? new Set<string>();
      profileUsers.add(userId);
      userAccess.set(profileId, profileUsers);
    },
    async upsertContent({ soulProfileId, contentType, content, generationKey }) {
      const key = createContentKey(soulProfileId, contentType, generationKey);
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
    async getContent(soulProfileId, contentType, generationKey) {
      return contents.get(createContentKey(soulProfileId, contentType, generationKey)) ?? null;
    },
    async getResult(profileId, resultTokenHash, anonymousSessionId, userId) {
      const profile = profilesById.get(profileId);
      if (!profile) {
        return null;
      }

      const hasToken = resultTokenHash ? profile.resultTokenHashes.includes(resultTokenHash) : false;
      const hasSession = anonymousSessionId ? profile.anonymousSessionIds.includes(anonymousSessionId) : false;
      const hasUser = userId ? userAccess.get(profileId)?.has(userId) === true : false;
      if (!hasToken && !hasSession && !hasUser) {
        return null;
      }

      return {
        profile,
        freeContent: contents.get(createContentKey(profileId, "free_summary")) ?? null,
      };
    },
    async listProfiles() {
      return Array.from(profilesById.values());
    },
    async listContents() {
      return Array.from(contents.values());
    },
  };
}

function createContentKey(soulProfileId: string, contentType: SoulContentType, generationKey?: string): string {
  return `${soulProfileId}:${contentType}:${generationKey ?? "default"}`;
}
