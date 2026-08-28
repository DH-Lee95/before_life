import { describe, expect, it } from "vitest";

import { toPublicSoulProfile } from "./toPublicSoulProfile";

describe("toPublicSoulProfile", () => {
  it("does not expose stored authentication or raw birth fields", () => {
    const publicProfile = toPublicSoulProfile({
      displaySoulId: "#ABC123",
      discoveryPercent: 17,
      resultTokenHashes: ["secret-hash"],
      anonymousSessionIds: ["secret-session"],
      soulHash: "internal-hash",
      birthDate: "1994-11-18",
      birthTime: "09:30",
    });

    expect(publicProfile).toEqual({ displaySoulId: "#ABC123", discoveryPercent: 17 });
    expect(publicProfile).not.toHaveProperty("resultTokenHashes");
    expect(publicProfile).not.toHaveProperty("anonymousSessionIds");
    expect(publicProfile).not.toHaveProperty("birthDate");
  });
});
