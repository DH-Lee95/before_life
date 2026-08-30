# Step 1: analytics-api

## Files To Read

- `/AGENTS.md`
- `/docs/ARCHITECTURE.md`
- `/src/app/api/analytics/route.ts`
- `/src/app/api/analytics/route.test.ts`
- `/src/lib/analytics/analyticsRepository.ts`
- `/src/lib/analytics/analyticsProvider.ts`

## Task

Replace the analytics route's memory singleton dependency with the asynchronous server repository provider. Keep public payload validation and cookie-derived session ownership. Return 400 for invalid client input and a generic 503 for storage failures without leaking Supabase error details.

Write failing route tests before implementation.

## Acceptance Criteria

```bash
npm run test -- --run src/app/api/analytics src/lib/analytics
```

## Verification

Update `phases/4-analytics-persistence/index.json` with the result.

## Do Not

- Do not return repository errors to the browser. Reason: database details can reveal internals.
- Do not make analytics failure block existing client navigation flows.
- Do not accept client timestamps or internal session row IDs.
