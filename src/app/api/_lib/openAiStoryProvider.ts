import { createHash } from "node:crypto";

import { DEFAULT_STORY_MODEL, OPENAI_RESPONSES_URL } from "@/config/openAi";
import type { StoryGenerationPrompt, WholeLifeGenerationPrompt } from "@/lib/content/createStoryGenerationPrompt";
import { createStoryRepairPrompt, validateGeneratedStory, validateGeneratedWholeLife } from "@/lib/content/validateGeneratedStory";
import type { SoulContentType, StoryNarrative, WholeLifeNarrative } from "@/types/soul";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type GenerationPrompt = StoryGenerationPrompt | WholeLifeGenerationPrompt;

type GenerateStoryInput = {
  prompt: GenerationPrompt;
  apiKey?: string;
  model?: string;
  promptCacheKey?: string;
  fetchImpl?: FetchLike;
};

type OpenAIUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type GeneratedStory = {
  content: StoryNarrative | WholeLifeNarrative;
  model: string;
  repaired: boolean;
  usage: OpenAIUsage;
};

export function createStoryCacheKey(soulHash: string, contentType: SoulContentType, promptVersion: string): string {
  return createHash("sha256")
    .update(`${soulHash}:${contentType}:${promptVersion}`)
    .digest("hex");
}

export async function generateStoryWithOpenAI({
  prompt,
  apiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_STORY_MODEL || DEFAULT_STORY_MODEL,
  promptCacheKey,
  fetchImpl = fetch,
}: GenerateStoryInput): Promise<GeneratedStory> {
  if (!apiKey?.trim()) throw new Error("OPENAI_API_KEY가 설정되지 않았습니다.");

  const first = await requestStructuredStory({
    apiKey, model, system: prompt.system, user: prompt.user,
    outputFormat: prompt.outputFormat, promptCacheKey, fetchImpl,
  });
  const firstValidation = validateForPrompt(prompt, first.value);
  if (firstValidation.success) {
    return { content: firstValidation.data, model, repaired: false, usage: first.usage };
  }

  const repaired = await requestStructuredStory({
    apiKey, model, system: prompt.system,
    user: createStoryRepairPrompt(first.value, firstValidation.issues),
    outputFormat: prompt.outputFormat, promptCacheKey, fetchImpl,
  });
  const repairedValidation = validateForPrompt(prompt, repaired.value);
  if (!repairedValidation.success) {
    throw new Error(`생성 결과가 로컬 검증을 통과하지 못했습니다: ${repairedValidation.issues.join(" / ")}`);
  }
  return {
    content: repairedValidation.data,
    model,
    repaired: true,
    usage: addUsage(first.usage, repaired.usage),
  };
}

async function requestStructuredStory({
  apiKey, model, system, user, outputFormat, promptCacheKey, fetchImpl,
}: {
  apiKey: string;
  model: string;
  system: string;
  user: string;
  outputFormat: GenerationPrompt["outputFormat"];
  promptCacheKey?: string;
  fetchImpl: FetchLike;
}): Promise<{ value: unknown; usage: OpenAIUsage }> {
  const response = await fetchImpl(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      instructions: system,
      input: user,
      text: { format: outputFormat },
      reasoning: { effort: "none" },
      max_output_tokens: outputFormat.name === "past_life_whole_life" ? 8_000 : 4_000,
      store: false,
      ...(promptCacheKey ? { prompt_cache_key: promptCacheKey } : {}),
    }),
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`OpenAI Responses API 요청에 실패했습니다. (HTTP ${response.status}: ${readApiError(payload)})`);
  }

  const outputText = readOutputText(payload);
  if (!outputText) throw new Error("OpenAI 응답에서 생성된 본문을 찾지 못했습니다.");

  let value: unknown;
  try {
    value = JSON.parse(outputText);
  } catch {
    value = outputText;
  }
  return { value, usage: readUsage(payload) };
}

function validateForPrompt(prompt: GenerationPrompt, value: unknown) {
  return prompt.outputFormat.name === "past_life_whole_life"
    ? validateGeneratedWholeLife(value)
    : validateGeneratedStory(value);
}

function readOutputText(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.output_text === "string") return payload.output_text;
  if (!Array.isArray(payload.output)) return null;
  for (const item of payload.output) {
    if (!isRecord(item) || !Array.isArray(item.content)) continue;
    for (const content of item.content) {
      if (isRecord(content) && content.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  return null;
}

function readUsage(payload: unknown): OpenAIUsage {
  const usage = isRecord(payload) && isRecord(payload.usage) ? payload.usage : {};
  return {
    inputTokens: readNumber(usage.input_tokens),
    outputTokens: readNumber(usage.output_tokens),
    totalTokens: readNumber(usage.total_tokens),
  };
}

function readApiError(payload: unknown): string {
  if (isRecord(payload) && isRecord(payload.error) && typeof payload.error.message === "string") return payload.error.message;
  return "응답 오류";
}

function addUsage(first: OpenAIUsage, second: OpenAIUsage): OpenAIUsage {
  return {
    inputTokens: first.inputTokens + second.inputTokens,
    outputTokens: first.outputTokens + second.outputTokens,
    totalTokens: first.totalTokens + second.totalTokens,
  };
}

function readNumber(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
