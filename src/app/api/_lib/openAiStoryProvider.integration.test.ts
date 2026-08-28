import { describe, expect, it } from "vitest";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { createWholeLifeGenerationPrompt } from "@/lib/content/createStoryGenerationPrompt";
import { createSoulProfile } from "@/lib/soul/createSoulProfile";

import { createStoryCacheKey, generateStoryWithOpenAI } from "./openAiStoryProvider";

const runIntegration = process.env.RUN_OPENAI_INTEGRATION === "1" ? describe : describe.skip;

runIntegration("OpenAI story integration", () => {
  it("generates and locally validates one complete life story", async () => {
    const profile = createSoulProfile({
      nickname: "서연",
      birthDate: "1994-11-18",
      birthTime: "21:30",
      answers: {
        inner_response: "a",
        decision_pattern: "b",
        emotional_trace: "c",
        conflict_style: "d",
        hidden_desire: "e",
        repeated_theme: "a",
        decisive_choice: "b",
      },
    });
    const prompt = createWholeLifeGenerationPrompt(profile);
    const result = await generateStoryWithOpenAI({
      prompt,
      promptCacheKey: createStoryCacheKey(profile.soulHash, "whole_life", prompt.version),
      fetchImpl: curlFetch,
    });
    const content = result.content;
    const narrativeLength = [
      content.title,
      content.opening,
      ...content.chapters.flatMap((chapter) => [chapter.title, ...chapter.paragraphs]),
      content.presentMeaning,
    ].join("\n").length;

    console.info("OPENAI_STORY_SAMPLE", JSON.stringify({
      model: result.model,
      repaired: result.repaired,
      usage: result.usage,
      narrativeLength,
      content,
    }));

    expect(narrativeLength).toBeGreaterThanOrEqual(3_000);
    expect(narrativeLength).toBeLessThanOrEqual(5_500);
    expect(content.chapters).toHaveLength(4);
  }, 120_000);
});

const execFileAsync = promisify(execFile);

async function curlFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  const requestBody = typeof init?.body === "string" ? init.body : "";
  const apiKey = process.env.OPENAI_API_KEY ?? "";
  const { stdout } = await execFileAsync("/bin/zsh", ["-c", [
    "curl --silent --show-error",
    "--request POST",
    "--url \"$OPENAI_REQUEST_URL\"",
    "--header \"Authorization: Bearer $OPENAI_API_KEY\"",
    "--header 'Content-Type: application/json'",
    "--data-binary \"$OPENAI_REQUEST_BODY\"",
    "--write-out '\\n%{http_code}'",
  ].join(" ")], {
    env: {
      ...process.env,
      OPENAI_API_KEY: apiKey,
      OPENAI_REQUEST_URL: String(input),
      OPENAI_REQUEST_BODY: requestBody,
    },
    maxBuffer: 2 * 1024 * 1024,
  });
  const splitAt = stdout.lastIndexOf("\n");
  return new Response(stdout.slice(0, splitAt), { status: Number(stdout.slice(splitAt + 1)) });
}
