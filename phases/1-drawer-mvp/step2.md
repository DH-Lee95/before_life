# Step 2: drawer-result-ui

## Task

Render the nature summary before the main past-life record, use the `전생 서랍` display name, and keep the existing result token and locked-content analytics flow intact.

## Acceptance Criteria

```bash
npm run test -- src/components/ResultView.test.tsx
```

## Do Not

- Do not expose locked content or allow client-side unlock state changes.
- Do not use `display_soul_id` as the result authorization key.
