import { createHash, randomBytes } from "node:crypto";

export function createResultToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashResultToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
