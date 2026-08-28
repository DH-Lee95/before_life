import { describe, expect, it } from "vitest";

import { createAnonymousSessionId } from "./anonymousSession";

describe("anonymous session", () => {
  it("creates non-empty session ids", () => {
    expect(createAnonymousSessionId()).toMatch(/^anon_/);
  });
});
