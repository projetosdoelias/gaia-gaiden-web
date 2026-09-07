import { APIClientError, NetworkError, type HttpOptions } from "./errors";

/**
 * A thin generic HTTP client.
 *
 * Responsibility:
 * - Send an HTTP request to the configured backend URL.
 * - Attach base headers (Content-Type).
 * - Parse the JSON response.
 * - Represent HTTP-level failures as APIClientError.
 *
 * It does NOT know about:
 * - Authentication, sessions, tokens, or business rules.
 * - Specific endpoints, features, or domain concepts.
 */
export async function httpClient(
  path: string,
  options?: HttpOptions,
): Promise<unknown> {
  const baseUrl = process.env.GAIA_GARDEN_API_URL;
  if (!baseUrl) {
    throw new Error("GAIA_GARDEN_API_URL environment variable is not set");
  }

  const url = new URL(path, baseUrl);

  // Attach query parameters if provided
  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers = new Headers(options?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorDetails: unknown;
      try {
        errorDetails = (await response.json()) as unknown;
      } catch {
        errorDetails = await response.text();
      }

      throw new APIClientError(
        response.status,
        response.statusText,
        errorDetails,
      );
    }

    // Handle 204 No Content
    const contentType = response.headers.get("content-type");
    if (response.status === 204 || !contentType?.includes("application/json")) {
      return undefined;
    }

    return (await response.json()) as unknown;
  } catch (error) {
    if (error instanceof APIClientError) {
      throw error;
    }
    throw new NetworkError(error);
  }
}

/**
 * Higher-order helper: wraps the generic httpClient to attach
 * an Authorization header from a token supplier.
 *
 * This keeps the token injection explicit at the call site
 * rather than hiding it inside httpClient.
 */
export function authenticatedHttpClient(
  getToken: () => Promise<string | null>,
) {
  return async (path: string, options?: HttpOptions): Promise<unknown> => {
    const token = await getToken();
    const headers = new Headers(options?.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return httpClient(path, { ...options, headers });
  };
}