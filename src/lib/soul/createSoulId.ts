import { createHash } from "node:crypto";

export function createSoulId(normalizedKey: string): {
  soulHash: string;
  displaySoulId: string;
} {
  const soulHash = createHash("sha256").update(normalizedKey, "utf8").digest("hex");

  return {
    soulHash,
    displaySoulId: `#${soulHash.slice(0, 6).toUpperCase()}`,
  };
}
