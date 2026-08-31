import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const { track } = vi.hoisted(() => ({ track: vi.fn() }));
const consumeApiRateLimit = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => ({ value: "server-session" }) })),
}));

vi.mock("@/lib/analytics/analyticsProvider", () => ({
  getAnalyticsRepository: () => ({ track }),
}));
vi.mock("@/lib/security/apiRateLimit", () => ({ consumeApiRateLimit }));

describe("POST /api/analytics", () => {
  beforeEach(() => {
    consumeApiRateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
  });

  it("rejects an unknown event without writing it", async () => {
    track.mockClear();
    const response = await POST(new Request("http://localhost/api/analytics", {
      method: "POST", body: JSON.stringify({ name: "forged", anonymousSessionId: "forged-session" }),
    }));

    expect(response.status).toBe(400);
    expect(track).not.toHaveBeenCalled();
  });

  it("awaits storage with the cookie session and does not echo it", async () => {
    track.mockReset().mockResolvedValue({ name: "start_test" });
    const response = await POST(new Request("http://localhost/api/analytics", {
      method: "POST", body: JSON.stringify({ name: "start_test", anonymousSessionId: "forged-session" }),
    }));

    expect(track).toHaveBeenCalledWith({ name: "start_test", anonymousSessionId: "server-session" });
    expect(await response.json()).toEqual({ ok: true });
  });

  it("returns a generic unavailable response when storage fails", async () => {
    track.mockReset().mockRejectedValue(new Error("database host and secret details"));

    const response = await POST(new Request("http://localhost/api/analytics", {
      method: "POST", body: JSON.stringify({ name: "landing_view" }),
    }));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ message: "analytics is temporarily unavailable" });
  });

  it("drops excessive analytics events before storage", async () => {
    track.mockClear();
    consumeApiRateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 30 });

    const response = await POST(new Request("http://localhost/api/analytics", {
      method: "POST", body: JSON.stringify({ name: "landing_view" }),
    }));

    expect(response.status).toBe(429);
    expect(track).not.toHaveBeenCalled();
  });
});
