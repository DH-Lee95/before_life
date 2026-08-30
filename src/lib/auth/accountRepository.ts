import type { SoulContent, SoulContentType } from "@/types/soul";

type Options = { url: string; serviceRoleKey: string; fetchImpl?: typeof fetch };

type UnlockedContentRow = {
  soul_profile_id: string;
  content_type: SoulContentType;
  generation_key: string;
  content: SoulContent["content"];
  created_at: string;
};

export type AccountUnlockedContent = SoulContent & { generationKey: string };

export function createAccountRepository({ url, serviceRoleKey, fetchImpl = fetch }: Options) {
  const baseUrl = url.replace(/\/$/, "");
  async function rpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetchImpl(`${baseUrl}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { message?: unknown } | null;
      const safeDetail = payload?.message === "insufficient soul balance" ? ": insufficient soul balance" : "";
      throw new Error(`Supabase account request failed (${response.status})${safeDetail}`);
    }
    return await response.json() as T;
  }
  return {
    claimSession: (sessionId: string, userId: string) => rpc("claim_anonymous_session", { p_session_id: sessionId, p_user_id: userId }),
    async isSessionOwnedByUser(sessionId: string, userId: string) {
      const result = await rpc<{ owned: boolean }>("is_anonymous_session_owner", { p_session_id: sessionId, p_user_id: userId });
      return result.owned;
    },
    async getBalance(userId: string) {
      const result = await rpc<{ balance: number }>("get_user_soul_balance", { p_user_id: userId });
      return result.balance;
    },
    async getUnlockedContents(userId: string, profileId: string): Promise<AccountUnlockedContent[]> {
      const rows = await rpc<UnlockedContentRow[]>("get_user_unlocked_soul_contents", {
        p_user_id: userId,
        p_profile_id: profileId,
      });
      return rows.map((row) => ({
        soulProfileId: row.soul_profile_id,
        contentType: row.content_type,
        generationKey: row.generation_key,
        content: row.content,
        isUnlocked: true,
        createdAt: row.created_at,
      }));
    },
    unlockContent(userId: string, profileId: string, contentType: string, generationKey: string, cost: number) {
      return rpc<{ balance: number; charged: boolean }>("unlock_soul_content", {
        p_user_id: userId,
        p_profile_id: profileId,
        p_content_type: contentType,
        p_generation_key: generationKey,
        p_cost: cost,
      });
    },
  };
}

export type AccountRepository = ReturnType<typeof createAccountRepository>;
let repository: AccountRepository | undefined;
export function getAccountRepository() {
  if (!repository) {
    const url = process.env.SUPABASE_URL?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url || !serviceRoleKey) throw new Error("Supabase server environment is required for accounts");
    repository = createAccountRepository({ url, serviceRoleKey });
  }
  return repository;
}
