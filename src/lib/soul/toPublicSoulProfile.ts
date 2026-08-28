import type { PublicSoulProfile } from "@/types/soul";

type ProfileSource = PublicSoulProfile & Record<string, unknown>;

export function toPublicSoulProfile(profile: ProfileSource): PublicSoulProfile {
  return {
    displaySoulId: profile.displaySoulId,
    discoveryPercent: profile.discoveryPercent,
  };
}
