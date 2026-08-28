# Step 2: supabase-repository

## Files To Read

- `/AGENTS.md`
- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`
- `/src/lib/repository/soulRepository.ts`
- `/src/lib/repository/memorySoulRepository.ts`
- `/supabase/migrations/`

## Task

Implement `createSupabaseSoulRepository` in `src/lib/repository/supabaseSoulRepository.ts` using a small injectable database client boundary. Add tests before implementation for idempotent profile/content upserts, access-grant creation, authorized result lookup, and database error propagation. Map database snake_case rows to domain camelCase without changing the deterministic `SoulProfile` payload.

## Acceptance Criteria

```bash
npm run test -- src/lib/repository/supabaseSoulRepository.test.ts
```

## Verification

1. Run the acceptance criteria command.
2. Confirm secrets are read only in server-only modules.
3. Update this phase index with a completion summary or failure reason.

## Do Not

- Do not silently fall back to memory after a configured Supabase operation fails. Reason: production data loss must be visible.
- Do not recompute or mutate Soul Engine fields in the repository. Reason: deterministic domain logic belongs in `src/lib/soul/`.
- Do not break existing tests.
