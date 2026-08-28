import { describe, expect, it } from "vitest";
import { safeReturnPath } from "./safeReturnPath";

describe("safeReturnPath", () => {
  it("keeps local paths", () => expect(safeReturnPath("/result/sp_test")).toBe("/result/sp_test"));
  it.each(["https://evil.test", "//evil.test", "/\\evil.test", ""])("rejects unsafe return path %s", (value) => {
    expect(safeReturnPath(value)).toBe("/");
  });
});
