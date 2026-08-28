import { describe, expect, it } from "vitest";

import { asIdentity, asPastRole, asRole, withDirection, withObject } from "./koreanGrammar";

describe("Korean grammar helpers", () => {
  it("selects particles from the final consonant", () => {
    expect(asPastRole("기록원")).toBe("기록원이었던");
    expect(asPastRole("재봉사")).toBe("재봉사였던");
    expect(asRole("기록원")).toBe("기록원으로서");
    expect(asRole("회계 담당자")).toBe("회계 담당자로서");
    expect(withDirection("중간 계층")).toBe("중간 계층으로");
    expect(withDirection("불안정한 생활")).toBe("불안정한 생활로");
    expect(withObject("사랑하는 사람")).toBe("사랑하는 사람을");
    expect(withObject("가족과 공동체")).toBe("가족과 공동체를");
    expect(asIdentity("기록원")).toBe("기록원이었습니다");
    expect(asIdentity("재봉사")).toBe("재봉사였습니다");
  });
});
