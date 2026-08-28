# Step 1: input-validation

## Task

Validate unknown JSON at `POST /api/soul/create` before calling the Soul Engine. Reject malformed nickname, date, time, missing or unknown answers with a 400 response.

## Acceptance Criteria

```bash
npm run test -- src/lib/soul/validateSoulInput.test.ts
```

## Do Not

- Do not trust client-side TypeScript casts as validation.
- Do not include birth data or raw answers in error payloads or analytics.
