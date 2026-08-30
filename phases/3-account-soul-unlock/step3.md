# Step 3: live-supabase-verification

## Files To Read

- `/AGENTS.md`
- `/docs/ARCHITECTURE.md`
- `/docs/SUPABASE_SETUP.md`
- `/supabase/migrations/20260828000400_account_soul_unlock.sql`
- `/supabase/migrations/20260830000100_account_soul_unlock_reconciliation.sql`

## Task

Apply all pending migrations to the intended Supabase project and manually verify login, purchase credit, unlock, reload restoration, concurrent idempotency, and cross-account/share-token isolation. Record the verified environment without storing credentials.

## Acceptance Criteria

```bash
npm run test -- --run
npm run lint
npm run build
```

Manual acceptance:

1. Account A is charged once and retains its opened record after reload.
2. Account B with the same deterministic profile cannot read Account A's paid record.
3. A share-token visitor receives no paid content.
4. Two concurrent unlock requests debit only once.

## Do Not

- Do not apply migrations before confirming the intended Supabase project. Reason: this changes external persistent state.
- Do not commit `supabase/.temp` or any service-role credential.
