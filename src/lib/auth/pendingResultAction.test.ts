import { describe, expect, it } from "vitest";

import {
  clearPendingResultAction,
  readPendingResultAction,
  savePendingResultAction,
} from "./pendingResultAction";

describe("pending result action", () => {
  it("keeps a locked-content action across Kakao OAuth", () => {
    savePendingResultAction("sp_test", { kind: "unlock", contentType: "past_love" });

    expect(readPendingResultAction("sp_test")).toEqual({ kind: "unlock", contentType: "past_love" });
  });

  it("keeps a selected Soul pack and ignores malformed storage", () => {
    savePendingResultAction("sp_test", { kind: "purchase", packId: "soul_3" });
    expect(readPendingResultAction("sp_test")).toEqual({ kind: "purchase", packId: "soul_3" });

    sessionStorage.setItem("soul:pending-action:sp_test", "not-json");
    expect(readPendingResultAction("sp_test")).toBeNull();
  });

  it("clears an action only after it has completed", () => {
    savePendingResultAction("sp_test", { kind: "unlock", contentType: "last_day" });
    clearPendingResultAction("sp_test");
    expect(readPendingResultAction("sp_test")).toBeNull();
  });
});
