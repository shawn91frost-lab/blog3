/**
 * Payload CMS Client Configuration and Base Fetcher
 * Resilient HTTP client with timeout, error handling, and offline fallback support
 */

export interface PayloadApiResponse<T> {
  docs?: T[];
  totalDocs?: number;
  limit?: number;
  totalPages?: number;
  page?: number;
  pagingCounter?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
  doc?: T;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number = 500, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Read Payload CMS Base URL from environment, defaulting to standard CMS port 3001 or current host
export const getPayloadApiUrl = (): string => {
  if (typeof window !== 'undefined' && (window as unknown as { __PAYLOAD_API_URL__?: string }).__PAYLOAD_API_URL__) {
    return (window as unknown as { __PAYLOAD_API_URL__: string }).__PAYLOAD_API_URL__;
  }
  const envUrl = import.meta.env.VITE_PAYLOAD_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  // Default to local CMS server or proxy
  return 'http://localhost:3001/api';
};

/**
 * Base fetcher with configurable timeout and error normalization
 */
export async function fetchFromPayload<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 4000
): Promise<T> {
  const baseUrl = getPayloadApiUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      throw new ApiError(
        `Payload API error [${response.status}]: ${response.statusText}`,
        response.status,
        'API_ERROR',
        errorData
      );
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if ((err as Error).name === 'AbortError') {
      throw new ApiError(`Request timeout after ${timeoutMs}ms for ${cleanEndpoint}`, 408, 'TIMEOUT');
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      (err as Error)?.message || 'Failed to communicate with Payload CMS API',
      0,
      'NETWORK_ERROR'
    );
  }
}
