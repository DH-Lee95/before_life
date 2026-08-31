import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";

import { consumeApiRateLimit, createRateLimitBucketHash } from "./apiRateLimit";

describe("API rate limiting", () => {
  it("creates stable, scope-specific buckets without exposing the source IP", () => {
    const first = createRateLimitBucketHash("203.0.113.7", "soul-create", "private-secret");
    const repeated = createRateLimitBucketHash("203.0.113.7", "soul-create", "private-secret");
    const otherScope = createRateLimitBucketHash("203.0.113.7", "analytics", "private-secret");

    expect(first).toBe(repeated);
    expect(first).not.toBe(otherScope);
    expect(first).not.toContain("203.0.113.7");
  });

  it("uses the first forwarded address and the Supabase atomic limiter", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      allowed: false,
      retry_after_seconds: 42,
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const request = new Request("https://service.example/api/soul/create", {
      headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
    });

    await expect(consumeApiRateLimit({
      request,
      scope: "soul-create",
      limit: 10,
      windowSeconds: 3600,
      environment: {
        SUPABASE_URL: "https://project.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-key",
        RATE_LIMIT_SECRET: "private-secret",
      },
      fetchImpl,
    })).resolves.toEqual({ allowed: false, retryAfterSeconds: 42 });

    const body = JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body));
    expect(body).toMatchObject({ p_limit: 10, p_window_seconds: 3600 });
    expect(body.p_bucket_hash).not.toContain("203.0.113.7");
  });

  it("ships an atomic, service-role-only Supabase limiter", () => {
    const sql = readFileSync("supabase/migrations/20260831000200_api_rate_limits.sql", "utf8");
    expect(sql).toContain("create or replace function public.consume_api_rate_limit");
    expect(sql).toContain("on conflict (bucket_hash) do update");
    expect(sql).toContain("revoke all on function public.consume_api_rate_limit");
    expect(sql).toContain("grant execute on function public.consume_api_rate_limit");
  });
});
