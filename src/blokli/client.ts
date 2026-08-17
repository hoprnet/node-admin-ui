/**
 * Minimal GraphQL client for a blokli instance.
 *
 * Blokli exposes GraphQL only, at `<baseUrl>/graphql`, with no auth and fully open
 * CORS, so a plain browser fetch is enough. Every root field returns a union, so
 * callers must send __typename and branch on it - see `api.ts`.
 */

export class blokliApiError extends Error {
  code: string;

  constructor({ code, message }: { code: string; message: string }) {
    super(message);
    this.name = 'blokliApiError';
    this.code = code;
  }
}

/**
 * The stored blokli url is a base url which can carry a path, so `new URL('graphql', base)`
 * is wrong here - it would drop the last path segment.
 */
export const blokliGraphqlUrl = (baseUrl: string) => {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/graphql') ? trimmed : `${trimmed}/graphql`;
};

export const queryBlokli = async <T>(
  baseUrl: string,
  query: string,
  variables: Record<string, unknown>,
  timeout = 30_000,
): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(blokliGraphqlUrl(baseUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables,
      }),
      signal: AbortSignal.timeout(timeout),
    });
  } catch (e) {
    if (e instanceof Error && e.name === 'TimeoutError') {
      throw new blokliApiError({
        code: 'TIMEOUT',
        message: `Blokli did not answer within ${timeout}ms`,
      });
    }
    throw new blokliApiError({
      code: 'FETCH_ERROR',
      message: e instanceof Error ? e.message : 'Could not reach blokli',
    });
  }

  if (!response.ok) {
    throw new blokliApiError({
      code: 'HTTP_ERROR',
      message: `Blokli responded with ${response.status} ${response.statusText}`,
    });
  }

  const json = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  // a malformed query fails at the GraphQL level rather than in a union member
  if (json.errors?.length) {
    throw new blokliApiError({
      code: 'GRAPHQL_ERROR',
      message: json.errors.map((error) => error.message).join(', '),
    });
  }

  if (!json.data) {
    throw new blokliApiError({
      code: 'EMPTY_RESPONSE',
      message: 'Blokli returned no data',
    });
  }

  return json.data;
};

/**
 * Union error members come back with HTTP 200, so success is decided by __typename.
 */
export const unwrapUnion = <T>(
  result: { __typename?: string; code?: string; message?: string } | null,
  expected: string,
): T => {
  if (!result) {
    throw new blokliApiError({
      code: 'EMPTY_RESPONSE',
      message: 'Blokli returned no result',
    });
  }
  if (result.__typename !== expected) {
    throw new blokliApiError({
      code: result.code ?? result.__typename ?? 'UNKNOWN_ERROR',
      message: result.message ?? `Blokli returned ${result.__typename} instead of ${expected}`,
    });
  }
  return result as T;
};

/**
 * Lenient variant of unwrapUnion for batched per-node root fields: one node's
 * error member should null that node's cell, not fail the whole query.
 */
export const tryUnwrapUnion = <T>(
  result: { __typename?: string; code?: string; message?: string } | null | undefined,
  expected: string,
): T | null => {
  if (!result || result.__typename !== expected) {
    if (result) {
      console.warn(`Blokli returned ${result.__typename} instead of ${expected}`, result.code, result.message);
    }
    return null;
  }
  return result as T;
};
