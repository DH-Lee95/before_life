import { describe, expect, it, vi } from "vitest";

import { onRequestError, redactOperationalMessage } from "./instrumentation";

describe("server request error instrumentation", () => {
  it("logs useful route context without URL queries or secret-looking values", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const handler = onRequestError as NonNullable<typeof onRequestError>;

    await handler(
      Object.assign(new Error("failed with sk-secret-value"), { digest: "digest-id" }),
      { path: "/result/sp_test?token=private-token", method: "GET", headers: { authorization: "Bearer secret" } },
      {
        routerKind: "App Router", routePath: "/result/[profileId]", routeType: "render",
        renderSource: "server-rendering", revalidateReason: undefined, renderType: "dynamic",
      },
    );

    const payload = errorLog.mock.calls[0]?.[1];
    expect(payload).toMatchObject({ path: "/result/sp_test", method: "GET", digest: "digest-id" });
    expect(JSON.stringify(payload)).not.toContain("private-token");
    expect(JSON.stringify(payload)).not.toContain("sk-secret-value");
    expect(JSON.stringify(payload)).not.toContain("Bearer secret");
  });

  it("redacts common API key and bearer token shapes", () => {
    expect(redactOperationalMessage("Bearer abcdefghijklmnop and sk-abcdefghijklmnop"))
      .toBe("Bearer [REDACTED] and sk-[REDACTED]");
  });
});
