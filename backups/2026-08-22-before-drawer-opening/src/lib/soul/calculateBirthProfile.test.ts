import { describe, expect, it } from "vitest";

import { calculateBirthProfile } from "./calculateBirthProfile";

describe("calculateBirthProfile", () => {
  it("creates stable hidden nature scores from solar birth date", () => {
    expect(calculateBirthProfile("1995-03-04", "unknown")).toEqual(
      calculateBirthProfile("1995-03-04", "unknown"),
    );
  });
});
