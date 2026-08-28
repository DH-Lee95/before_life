# Step 4: persistence-verification

## Files To Read

- `/AGENTS.md`
- `/docs/ARCHITECTURE.md`
- `/docs/IMPLEMENTATION_STATUS.md`
- `/src/lib/repository/`
- `/src/app/api/soul/`
- `/supabase/migrations/`

## Task

Run the full project checks and update documentation to describe Supabase setup, memory fallback scope, migration application, deterministic uniqueness, and result ownership. Keep live Supabase verification optional so CI and local development do not require credentials.

## Acceptance Criteria

```bash
npm run test
npm run lint
npm run build
```

## Verification

1. Run all acceptance criteria commands.
2. Check architecture and CRITICAL rules.
3. Update this phase and top-level phase indexes with completion summaries.

## Do Not

- Do not claim live Supabase verification without running it. Reason: mocked contract tests do not prove remote project configuration.
- Do not finish with a running dev/build process.
- Do not break existing tests.
