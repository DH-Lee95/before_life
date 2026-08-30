import { lockedContentTypes } from "@/config/contentTypes";
import type { LockedContentType } from "@/types/soul";

export type PendingResultAction =
  | { kind: "unlock"; contentType: "whole_life" | LockedContentType }
  | { kind: "purchase"; packId: string };

function storageKey(profileId: string) {
  return `soul:pending-action:${profileId}`;
}

export function savePendingResultAction(profileId: string, action: PendingResultAction) {
  sessionStorage.setItem(storageKey(profileId), JSON.stringify(action));
}

export function readPendingResultAction(profileId: string): PendingResultAction | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(storageKey(profileId)) ?? "null") as unknown;
    if (!value || typeof value !== "object") return null;
    const action = value as Record<string, unknown>;
    const allowedContentTypes = ["whole_life", ...lockedContentTypes.map((content) => content.id)];
    if (action.kind === "unlock" && typeof action.contentType === "string" && allowedContentTypes.includes(action.contentType)) {
      return { kind: "unlock", contentType: action.contentType as "whole_life" | LockedContentType };
    }
    if (action.kind === "purchase" && typeof action.packId === "string") {
      return { kind: "purchase", packId: action.packId };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearPendingResultAction(profileId: string) {
  sessionStorage.removeItem(storageKey(profileId));
}
