import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

import { createPkcePair, exchangePkceCode } from "./pkceFlow";

describe("Kakao PKCE flow", () => {
  it("creates an RFC 7636 verifier and matching S256 challenge", () => {
    const pair = createPkcePair();
    const expectedChallenge = createHash("sha256").update(pair.verifier).digest("base64url");

    expect(pair.verifier).toMatch(/^[A-Za-z0-9_-]{43,128}$/);
    expect(pair.challenge).toBe(expectedChallenge);
  });

  it("exchanges the callback code using the exact stored verifier", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      access_token: "access-token",
      refresh_token: "refresh-token",
      user: { id: "user-id" },
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    const session = await exchangePkceCode({
      url: "https://project.supabase.co",
      anonKey: "anon-key",
      code: "callback-code",
      verifier: "stored-verifier",
      fetchImpl: fetchMock,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://project.supabase.co/auth/v1/token?grant_type=pkce",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ apikey: "anon-key" }),
        body: JSON.stringify({ auth_code: "callback-code", code_verifier: "stored-verifier" }),
      }),
    );
    expect(session).toEqual({ accessToken: "access-token", refreshToken: "refresh-token", userId: "user-id" });
  });
});
