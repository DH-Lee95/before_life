import { describe, expect, it } from "vitest";

import { anonymousSessionCookieOptions, createAnonymousSessionId } from "./anonymousSession";

describe("anonymous session", () => {
  it("creates non-empty session ids", () => {
    expect(createAnonymousSessionId()).toMatch(/^anon_/);
  });

  it("keeps the identity in a protected thirty-day cookie", () => {
    expect(anonymousSessionCookieOptions()).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  });
});
