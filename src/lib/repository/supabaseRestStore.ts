import type {
  SupabaseContentRow,
  SupabaseProfileRow,
  SupabaseSoulStore,
} from "./supabaseSoulRepository";

type SupabaseRestStoreOptions = {
  url: string;
  serviceRoleKey: string;
  fetchImpl?: typeof fetch;
};

type ProfileUpsertRow = Parameters<SupabaseSoulStore["upsertProfile"]>[0];

export function createSupabaseRestStore({
  url,
  serviceRoleKey,
  fetchImpl = fetch,
}: SupabaseRestStoreOptions): SupabaseSoulStore {
  const baseUrl = url.replace(/\/$/, "");

  async function requestRows<T>(path: string, init: RequestInit = {}): Promise<T[]> {
    const response = await fetchImpl(`${baseUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init.headers,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      throw new Error(`Supabase request failed (${response.status})${detail ? `: ${detail}` : ""}`);
    }

    if (response.status === 204) return [];
    return await response.json() as T[];
  }

  async function upsertOne<T>(table: string, conflict: string, row: object): Promise<T> {
    const rows = await requestRows<T>(`${table}?on_conflict=${conflict}`, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(row),
    });
    if (!rows[0]) throw new Error(`Supabase ${table} upsert returned no row`);
    return rows[0];
  }

  async function grantAccess(row: {
    soul_profile_id: string;
    anonymous_session_id: string | null;
    result_token_hash: string | null;
    user_id: string | null;
  }): Promise<void> {
    await upsertOne(
      "soul_profile_access",
      "soul_profile_id,anonymous_session_id,result_token_hash,user_id",
      row,
    );
  }

  return {
    async upsertAnonymousSession(sessionId) {
      return await upsertOne<{ id: string }>("anonymous_sessions", "session_id", { session_id: sessionId });
    },
    async upsertProfile(row: ProfileUpsertRow) {
      return await upsertOne<SupabaseProfileRow>(
        "soul_profiles",
        "soul_hash,input_version,engine_version",
        row,
      );
    },
    async grantSessionAccess(profileId, anonymousSessionRowId) {
      await grantAccess({
        soul_profile_id: profileId,
        anonymous_session_id: anonymousSessionRowId,
        result_token_hash: null,
        user_id: null,
      });
    },
    async grantTokenAccess(profileId, resultTokenHash) {
      await grantAccess({
        soul_profile_id: profileId,
        anonymous_session_id: null,
        result_token_hash: resultTokenHash,
        user_id: null,
      });
    },
    async grantUserAccess(profileId, userId) {
      await grantAccess({
        soul_profile_id: profileId,
        anonymous_session_id: null,
        result_token_hash: null,
        user_id: userId,
      });
    },
    async upsertContent(row) {
      return await upsertOne<SupabaseContentRow>(
        "soul_contents",
        "soul_profile_id,content_type,generation_key",
        row,
      );
    },
    async getContent(profileId, contentType, generationKey) {
      const params = selectParams({
        soul_profile_id: `eq.${profileId}`,
        content_type: `eq.${contentType}`,
        generation_key: `eq.${generationKey}`,
        limit: "1",
      });
      return (await requestRows<SupabaseContentRow>(`soul_contents?${params}`))[0] ?? null;
    },
    async getProfile(profileId) {
      const params = selectParams({ id: `eq.${profileId}`, limit: "1" });
      return (await requestRows<SupabaseProfileRow>(`soul_profiles?${params}`))[0] ?? null;
    },
    async hasAccess(profileId, resultTokenHash, anonymousSessionId, userId) {
      if (resultTokenHash) {
        const params = selectParams({
          soul_profile_id: `eq.${profileId}`,
          result_token_hash: `eq.${resultTokenHash}`,
          select: "id",
          limit: "1",
        });
        if ((await requestRows<{ id: string }>(`soul_profile_access?${params}`)).length > 0) return true;
      }

      if (userId) {
        const params = selectParams({
          soul_profile_id: `eq.${profileId}`,
          user_id: `eq.${userId}`,
          select: "id",
          limit: "1",
        });
        if ((await requestRows<{ id: string }>(`soul_profile_access?${params}`)).length > 0) return true;
      }

      if (!anonymousSessionId) return false;
      const sessionParams = selectParams({ session_id: `eq.${anonymousSessionId}`, select: "id", limit: "1" });
      const session = (await requestRows<{ id: string }>(`anonymous_sessions?${sessionParams}`))[0];
      if (!session) return false;

      const accessParams = selectParams({
        soul_profile_id: `eq.${profileId}`,
        anonymous_session_id: `eq.${session.id}`,
        select: "id",
        limit: "1",
      });
      return (await requestRows<{ id: string }>(`soul_profile_access?${accessParams}`)).length > 0;
    },
    async listProfiles() {
      return await requestRows<SupabaseProfileRow>("soul_profiles?select=id,profile,created_at");
    },
    async listContents() {
      return await requestRows<SupabaseContentRow>(
        "soul_contents?select=soul_profile_id,content_type,generation_key,content,is_unlocked,created_at",
      );
    },
  };
}

function selectParams(values: Record<string, string>): string {
  return new URLSearchParams(values).toString();
}
