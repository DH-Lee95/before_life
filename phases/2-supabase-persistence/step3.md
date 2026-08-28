# Step 3: api-repository-provider

## Files To Read

- `/AGENTS.md`
- `/docs/ARCHITECTURE.md`
- `/src/lib/repository/soulRepository.ts`
- `/src/lib/repository/memorySoulRepository.ts`
- `/src/lib/repository/supabaseSoulRepository.ts`
- `/src/app/api/soul/create/route.ts`
- `/src/app/api/soul/result/[profileId]/route.ts`
- `/src/app/api/soul/story-preview/route.ts`

## Task

Add a server-only repository provider that selects Supabase only when all required environment variables are configured and otherwise uses the memory repository for local development and tests. Update API route handlers to await repository operations. Add provider and route regression tests, and document required environment variables in `.env.example` without adding secrets.

## Acceptance Criteria

```bash
npm run test -- src/lib/repository src/app/api/soul
```

## Verification

1. Run the acceptance criteria command.
2. Confirm no service-role secret is reachable from client bundles.
3. Update this phase index with a completion summary or failure reason.

## Do Not

- Do not prefix the service-role key with `NEXT_PUBLIC_`. Reason: it would expose privileged credentials to browsers.
- Do not silently use memory when only part of the Supabase configuration is present. Reason: a deployment typo must fail fast.
- Do not break existing tests.
