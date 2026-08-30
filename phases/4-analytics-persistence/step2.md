# Step 2: live-supabase-verification

## Files To Read

- `/AGENTS.md`
- `/docs/ARCHITECTURE.md`
- `/docs/SUPABASE_SETUP.md`
- `/supabase/migrations/20260828000100_soul_persistence.sql`
- `/src/lib/analytics/supabaseAnalyticsRepository.ts`

## Task

Confirm the intended linked Supabase project, migration state, `analytics_events` availability, and server-only access. Update architecture and implementation status documentation. Do not create production analytics rows solely for verification when schema and repository contract checks are sufficient.

## Acceptance Criteria

```bash
npm run test -- --run
npm run lint
npm run build
git diff --check
```

## Verification

Update both phase index files with the completed result.

## Do Not

- Do not mutate a different Supabase project. Reason: analytics data is persistent external state.
- Do not print or commit credentials.
- Do not weaken RLS or grant direct table access to anon/authenticated roles.
