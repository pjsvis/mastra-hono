/**
 * A strongly-typed version of await-to-js.
 * Wraps a promise to return a tuple of [error, result].
 * This avoids try/catch blocks and makes error handling explicit.
 */
export type AsyncResult<T, E = Error> = Promise<[E, undefined] | [null, T]>;

export async function to<T, E = Error>(promise: Promise<T>, errorExt?: object): AsyncResult<T, E> {
  try {
    const data = await promise;
    return [null, data];
  } catch (err) {
    if (errorExt) {
      const parsedError = Object.assign({}, err, errorExt);
      return [parsedError as E, undefined];
    }
    return [err as E, undefined];
  }
}
