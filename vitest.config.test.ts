import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";

describe("vitest config", () => {
  it("uses jsdom for component tests", () => {
    const configSource = readFileSync("vitest.config.ts", "utf8");

    expect(configSource).toContain('environment: "jsdom"');
  });

  it("does not discover tests from the local backup directory", () => {
    const configSource = readFileSync("vitest.config.ts", "utf8");

    expect(configSource).toContain('"backups/**"');
    expect(configSource).toContain('"**/node_modules/**"');
  });
});
