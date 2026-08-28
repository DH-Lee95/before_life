type Options = { url: string; serviceRoleKey: string; fetchImpl?: typeof fetch };

export function createAccountRepository({ url, serviceRoleKey, fetchImpl = fetch }: Options) {
  const baseUrl = url.replace(/\/$/, "");
  async function rpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetchImpl(`${baseUrl}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Supabase account request failed (${response.status})`);
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
