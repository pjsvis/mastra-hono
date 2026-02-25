import { execSync } from 'node:child_process';

/**
 * Fetches a secret from Skate by key.
 * Fails fast if the key is missing to prevent downstream auth errors.
 */
export function getSkateSecret(key: string): string {
  try {
    const value = execSync(`skate get ${key}`, { stdio: ['ignore', 'pipe', 'pipe'] })
      .toString()
      .trim();

    if (!value) {
      throw new Error('Empty value returned');
    }

    return value;
  } catch (error) {
    console.error(`[Skate Error] Could not retrieve ${key}. Ensure it is set via 'skate set'.`);
    throw new Error(`Missing Required Secret: ${key}`, { cause: error });
  }
}
