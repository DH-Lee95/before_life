# Step 0: oauth-result-return

## Files To Read

- `/AGENTS.md`
- `/docs/ARCHITECTURE.md`
- `/src/app/auth/login/route.ts`
- `/src/app/auth/callback/route.ts`

## Task

Preserve a validated local result return path across the Kakao OAuth redirect in an HTTP-only cookie, claim the anonymous session for the authenticated user, and clear the temporary cookie after a successful callback.

## Acceptance Criteria

```bash
npm run test -- --run src/app/auth/login/route.test.ts src/app/auth/callback/route.test.ts
```

## Do Not

- Do not accept an external return URL. Reason: the OAuth callback must not become an open redirect.
- Do not expose auth cookies to client JavaScript.
