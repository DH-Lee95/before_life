# Step 0: analytics-repository

## Files To Read

- `/AGENTS.md`
- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`
- `/src/types/analytics.ts`
- `/src/lib/analytics/memoryAnalytics.ts`
- `/supabase/migrations/20260828000100_soul_persistence.sql`

## Task

Define an asynchronous analytics repository contract, retain an in-memory implementation for environments without Supabase, and add a server-only Supabase REST implementation plus environment provider. Resolve the public anonymous session cookie value to the internal `anonymous_sessions.id` before inserting `analytics_events`. Store profile/content fields in `event_properties`, UTM values in their dedicated columns, and let the database create server timestamps.

Write failing unit tests before implementation.

## Acceptance Criteria

```bash
npm run test -- --run src/lib/analytics
```

## Verification

Update `phases/4-analytics-persistence/index.json` with the result.

## Do Not

- Do not expose the service role key to client components. Reason: it bypasses RLS.
- Do not trust a client-supplied anonymous session ID. Reason: the API must use its HTTP-only cookie.
- Do not silently fall back to memory when only one Supabase environment variable is set.
