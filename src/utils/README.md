# Utilities (`src/utils/`)

Shared utility functions used across the application.

## `to()` - Async Result Wrapper

A strongly-typed version of [await-to-js](https://github.com/scopsy/await-to-js). Wraps promises to return a tuple of `[error, result]` instead of using try/catch.

### Usage

```typescript
import { to } from '@src/utils/to';

// Instead of try/catch:
async function fetchData() {
  const [err, data] = await to(fetch('/api/data'));
  
  if (err) {
    console.error('Failed:', err.message);
    return;
  }
  
  console.log('Data:', data);
}

// With custom error type
interface MyError {
  code: string;
}

const [err, result] = await to<MyResponse, MyError>(promise, { code: 'CUSTOM' });
```

### Why?

- **Explicit error handling**: No hidden control flow
- **Type-safe**: Full TypeScript support
- **Cleaner code**: Avoids nested try/catch blocks
- **Extended errors**: Add context to errors via `errorExt` parameter

### Signature

```typescript
type AsyncResult<T, E = Error> = Promise<[E, undefined] | [null, T]>;

function to<T, E = Error>(
  promise: Promise<T>, 
  errorExt?: object
): AsyncResult<T, E>
```

## Adding Utilities

1. Create `src/utils/your-util.ts`
2. Export your functions
3. Import elsewhere via `@src/utils/your-util`

```typescript
// src/utils/format.ts
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
```
