# Step 1: account-content-entitlement

## Files To Read

- `/AGENTS.md`
- `/docs/ARCHITECTURE.md`
- `/src/lib/auth/accountRepository.ts`
- `/supabase/migrations/20260828000400_account_soul_unlock.sql`

## Task

Store paid-content entitlement with a unique `(user_id, soul_profile_id, content_type)` row while continuing to reuse deterministic content cache rows. Implement `getUnlockedContents(userId, profileId)` and an atomic `unlockContent(userId, profileId, contentType, generationKey, cost)` RPC boundary. Serialize spending per user and make repeated, concurrent, or later prompt-version unlock requests charge at most once.

## Acceptance Criteria

```bash
npm run test -- --run src/lib/auth/accountRepository.test.ts src/lib/auth/soulUnlockSchema.test.ts src/app/api/soul/unlock/route.test.ts
```

## Do Not

- Do not use `soul_contents.is_unlocked` as account authorization. Reason: deterministic profiles and cached content are shared across accounts.
- Do not debit in client code. Reason: balance integrity requires one server-side database transaction.
