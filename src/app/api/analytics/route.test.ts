import { describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const { track } = vi.hoisted(() => ({ track: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => ({ value: "server-session" }) })),
}));

vi.mock("@/lib/analytics/analyticsProvider", () => ({
  getAnalyticsRepository: () => ({ track }),
}));

describe("POST /api/analytics", () => {
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
});
