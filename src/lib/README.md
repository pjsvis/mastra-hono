# Libraries (`src/lib/`)

Shared libraries used across the application.

## Secrets Management (`secrets.ts`)

Uses [Skate](https://github.com/charmbracelet/skate) to securely retrieve API keys at runtime.

### Supported Keys

| Key | Used By |
|-----|---------|
| `ANTHROPIC_API_KEY` | Anthropic models |
| `OPENAI_API_KEY` | OpenAI models |
| `GROQ_API_KEY` | Groq models |

### Usage

```typescript
import { getSkateSecret } from '@src/lib/secrets';

// Automatically loads into process.env
const apiKey = process.env.OPENAI_API_KEY;
```

### Setting Keys

```bash
# Store a secret
skate set OPENAI_API_KEY "your-key-here"

# List keys
skate ls

# Delete a key
skate delete OPENAI_API_KEY
```

### How It Works

On Mastra initialization ([`src/mastra/index.ts`](../mastra/index.ts)):

```typescript
const secretKeys = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GROQ_API_KEY'];
for (const key of secretKeys) {
  if (!process.env[key]) {
    process.env[key] = getSkateSecret(key);
  }
}
```

### Error Handling

If a required key is missing, the application fails fast with a clear error:

```
[Skate Error] Could not retrieve OPENAI_API_KEY. Ensure it is set via 'skate set'.
Error: Missing Required Secret: OPENAI_API_KEY
```

## Adding New Secrets

1. Add the key to the `secretKeys` array in [`src/mastra/index.ts`](../mastra/index.ts)
2. Document it in this README
3. Update [`scripts/setup-mastra-env.sh`](../../scripts/setup-mastra-env.sh) if needed
