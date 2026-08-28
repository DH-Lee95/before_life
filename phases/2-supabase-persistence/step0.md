# Step 0: repository-contract

## Files To Read

Read these files first to understand the architecture and design intent:

- `/AGENTS.md`
- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`
- `/src/lib/repository/memorySoulRepository.ts`
- `/src/app/api/soul/create/route.ts`
- `/src/app/api/soul/result/[profileId]/route.ts`

## Task

Extract the shared repository types into `src/lib/repository/soulRepository.ts` and make every repository operation asynchronous so a remote Postgres implementation can satisfy the same contract. Update the memory implementation and its tests first. Preserve deterministic profile IDs and authorization by result-token hash or anonymous session ownership.

## Acceptance Criteria

```bash
npm run test -- src/lib/repository/memorySoulRepository.test.ts
```

## Verification

1. Run the acceptance criteria command.
2. Check compliance with `AGENTS.md` CRITICAL rules.
3. Update this phase index with a completion summary or failure reason.

## Do Not

- Do not weaken result authorization. Reason: `display_soul_id` is not an authorization credential.
- Do not move database access into client components. Reason: server secrets must remain server-only.
- Do not break existing tests.
