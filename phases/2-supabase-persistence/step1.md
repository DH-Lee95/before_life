# Step 1: database-schema

## Files To Read

- `/AGENTS.md`
- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`
- `/docs/OPERATIONAL_EDGE_CASES_AND_PAYMENT_PLAN.md`
- `/src/lib/repository/soulRepository.ts`

## Task

Add an idempotent SQL migration under `supabase/migrations/` for anonymous sessions, soul profiles, profile access grants, soul contents, and analytics events. Enforce profile uniqueness using `(soul_hash, input_version, engine_version)`, content cache uniqueness including `generation_key`, and separate access rows for session IDs and result-token hashes. Enable RLS and deny direct public table access because all writes and privileged reads go through server API routes.

## Acceptance Criteria

```bash
npm run test -- src/lib/repository/supabaseSchema.test.ts
```

## Verification

1. Run the acceptance criteria command.
2. Confirm raw result tokens are never stored.
3. Update this phase index with a completion summary or failure reason.

## Do Not

- Do not store result-token plaintext. Reason: a database leak must not expose active result URLs.
- Do not store ownership as mutable arrays on the profile row. Reason: concurrent claims require independently unique access rows.
- Do not break existing tests.
