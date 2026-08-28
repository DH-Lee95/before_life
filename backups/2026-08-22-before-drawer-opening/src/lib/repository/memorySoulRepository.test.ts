import { describe, expect, it } from "vitest";

import { createMemorySoulRepository } from "./memorySoulRepository";

describe("createMemorySoulRepository", () => {
  it("starts empty", () => {
    const repo = createMemorySoulRepository();

    expect(repo.listProfiles()).toEqual([]);
    expect(repo.listContents()).toEqual([]);
  });
});
