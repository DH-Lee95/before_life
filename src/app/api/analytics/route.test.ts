import { describe, expect, it, vi } from "vitest";

import { POST } from "./route";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => ({ value: "server-session" }) })),
}));

describe("POST /api/analytics", () => {
  it("rejects an unknown event", async () => {
    const response = await POST(new Request("http://localhost/api/analytics", {
      method: "POST", body: JSON.stringify({ name: "forged", anonymousSessionId: "forged-session" }),
    }));

    expect(response.status).toBe(400);
  });

  it("does not echo the stored session back to the client", async () => {
    const response = await POST(new Request("http://localhost/api/analytics", {
      method: "POST", body: JSON.stringify({ name: "start_test", anonymousSessionId: "forged-session" }),
    }));

    expect(await response.json()).toEqual({ ok: true });
  });
});
