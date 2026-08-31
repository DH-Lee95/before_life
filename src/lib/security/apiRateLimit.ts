import { createHmac } from "node:crypto";

type RateLimitEnvironment = {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  RATE_LIMIT_SECRET?: string;
};

type ConsumeApiRateLimitInput = {
  request: Request;
  scope: string;
  limit: number;
  windowSeconds: number;
  environment?: RateLimitEnvironment;
  fetchImpl?: typeof fetch;
};

type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

export async function consumeApiRateLimit({
  request,
  scope,
  limit,
  windowSeconds,
  environment,
  fetchImpl = fetch,
}: ConsumeApiRateLimitInput): Promise<RateLimitResult> {
  const resolvedEnvironment: RateLimitEnvironment = environment ?? {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RATE_LIMIT_SECRET: process.env.RATE_LIMIT_SECRET,
  };
  const url = resolvedEnvironment.SUPABASE_URL?.trim();
  const serviceRoleKey = resolvedEnvironment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (Boolean(url) !== Boolean(serviceRoleKey)) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured together");
  }

  const source = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "unknown";
  const secret = resolvedEnvironment.RATE_LIMIT_SECRET?.trim() || serviceRoleKey || "local-development-rate-limit";
  const bucketHash = createRateLimitBucketHash(source.slice(0, 128), scope, secret);

  if (!url || !serviceRoleKey) return consumeMemoryBucket(bucketHash, limit, windowSeconds);

  const response = await fetchImpl(`${url.replace(/\/$/, "")}/rest/v1/rpc/consume_api_rate_limit`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_bucket_hash: bucketHash,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 200);
    throw new Error(`rate limit request failed (${response.status})${detail ? `: ${detail}` : ""}`);
  }
  const result = await response.json() as { allowed?: unknown; retry_after_seconds?: unknown };
  if (typeof result.allowed !== "boolean" || typeof result.retry_after_seconds !== "number") {
    throw new Error("invalid rate limit response");
  }
  return { allowed: result.allowed, retryAfterSeconds: Math.max(0, Math.ceil(result.retry_after_seconds)) };
}

export function createRateLimitBucketHash(source: string, scope: string, secret: string): string {
  return createHmac("sha256", secret).update(`${scope}:${source}`).digest("hex");
}

function consumeMemoryBucket(bucketHash: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const existing = memoryBuckets.get(bucketHash);
  const bucket = !existing || existing.resetAt <= now
    ? { count: 1, resetAt: now + windowSeconds * 1_000 }
    : { count: existing.count + 1, resetAt: existing.resetAt };
  memoryBuckets.set(bucketHash, bucket);
  return {
    allowed: bucket.count <= limit,
    retryAfterSeconds: bucket.count <= limit ? 0 : Math.max(1, Math.ceil((bucket.resetAt - now) / 1_000)),
  };
}
