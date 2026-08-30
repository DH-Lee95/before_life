# Step 2: unlock-result-ui

## Files To Read

- `/AGENTS.md`
- `/docs/ARCHITECTURE.md`
- `/src/app/api/soul/result/[profileId]/route.ts`
- `/src/components/ResultView.tsx`

## Task

Return only the authenticated account's entitled content from the result API. Connect locked record buttons to the server unlock API, route unauthenticated users through Kakao login, show insufficient-balance guidance, prevent repeated clicks while a request is active, and restore entitled records after reload.

## Acceptance Criteria

```bash
npm run test -- --run src/app/api/soul/result/[profileId]/route.test.ts src/components/ResultView.test.tsx
```

## Do Not

- Do not expose paid content to anonymous sessions or share-token viewers.
- Do not mutate balance or unlock state optimistically on the client.
