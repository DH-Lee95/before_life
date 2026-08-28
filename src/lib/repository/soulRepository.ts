import type { SoulContent, SoulContentType, SoulProfile } from "@/types/soul";

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
  content: SoulContent["content"];
  generationKey?: string;
};

export type StoredSoulResult = {
  profile: StoredSoulProfile;
  freeContent: SoulContent | null;
};

export type SoulRepository = {
  upsertProfile: (input: UpsertProfileInput) => Promise<StoredSoulProfile>;
  upsertContent: (input: UpsertContentInput) => Promise<SoulContent>;
  getContent: (soulProfileId: string, contentType: SoulContentType, generationKey?: string) => Promise<SoulContent | null>;
  getResult: (profileId: string, resultTokenHash?: string, anonymousSessionId?: string) => Promise<StoredSoulResult | null>;
  listProfiles: () => Promise<StoredSoulProfile[]>;
  listContents: () => Promise<SoulContent[]>;
};
