import { describe, expect, it } from "vitest";

import { DEFAULT_STORY_MODEL, OPENAI_RESPONSES_URL } from "./openAi";

describe("OpenAI story configuration", () => {
  it("uses the Responses API and a cost-sensitive story model", () => {
    expect(OPENAI_RESPONSES_URL).toBe("https://api.openai.com/v1/responses");
    expect(DEFAULT_STORY_MODEL).toBe("gpt-5.6-luna");
  });
});
