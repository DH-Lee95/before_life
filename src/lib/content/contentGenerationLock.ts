import type { SoulContentType } from "@/types/soul";

type ContentGenerationLockEnvironment = {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

export type GenerationLockInput = {
  soulProfileId: string;
  contentType: SoulContentType;
  generationKey: string;
  claimId: string;
};

const memoryClaims = new Set<string>();

export async function acquireContentGeneration(input: GenerationLockInput): Promise<boolean> {
  const environment = readEnvironment();
  if (!environment) {
    const key = toClaimKey(input);
    if (memoryClaims.has(key)) return false;
    memoryClaims.add(key);
    return true;
  }
  return await callLockRpc<boolean>(environment, "claim_soul_content_generation", {
    p_profile_id: input.soulProfileId,
    p_content_type: input.contentType,
    p_generation_key: input.generationKey,
    p_claim_id: input.claimId,
  });
}

export async function releaseContentGeneration(input: GenerationLockInput): Promise<void> {
  const environment = readEnvironment();
  if (!environment) {
    memoryClaims.delete(toClaimKey(input));
    return;
  }
  await callLockRpc<unknown>(environment, "release_soul_content_generation", {
    p_profile_id: input.soulProfileId,
    p_content_type: input.contentType,
    p_generation_key: input.generationKey,
    p_claim_id: input.claimId,
  });
}

function readEnvironment(): { url: string; serviceRoleKey: string } | null {
  const environment: ContentGenerationLockEnvironment = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  const url = environment.SUPABASE_URL?.trim();
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url && !serviceRoleKey) return null;
  if (!url || !serviceRoleKey) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured together");
  return { url: url.replace(/\/$/, ""), serviceRoleKey };
}

async function callLockRpc<T>(environment: { url: string; serviceRoleKey: string }, functionName: string, body: Record<string, string>): Promise<T> {
  const response = await fetch(`${environment.url}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: { apikey: environment.serviceRoleKey, Authorization: `Bearer ${environment.serviceRoleKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`Supabase content generation lock failed (${response.status})${detail ? `: ${detail}` : ""}`);
  }
  return await response.json() as T;
}

function toClaimKey(input: GenerationLockInput) {
  return `${input.soulProfileId}:${input.contentType}:${input.generationKey}`;
}
