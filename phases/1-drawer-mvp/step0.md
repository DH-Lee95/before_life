# Step 0: nature-summary

## Task

Implement a deterministic `NatureSummary` derived from `SoulProfile.traits`. It must contain a headline, three stable signal lines, and a bridge to the first drawer. Store it on `SoulProfile` and expose it through `FreeResultContent`.

## Acceptance Criteria

```bash
npm run test -- src/lib/content/createNatureSummary.test.ts src/lib/content/createFreeResult.test.ts
```

## Do Not

- Do not call an external LLM or send raw birth data anywhere.
- Do not make the headline depend on random or current time.
