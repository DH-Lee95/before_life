import { describe, expect, it } from "vitest";

import { createResultToken, hashResultToken } from "./resultToken";

describe("result token", () => {
  it("creates opaque tokens and hashes them", () => {
    const token = createResultToken();

    expect(token.length).toBeGreaterThan(40);
    expect(hashResultToken(token)).toHaveLength(64);
  });
});
