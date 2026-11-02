import { ZodType } from 'zod';
import {
  ApiError,
  ErrorBody,
  invalidResponse,
  mapError,
  networkError,
} from './errors';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions<T> {
  schema?: ZodType<T>;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** JSON body, or FormData for multipart (always sent with POST). */
  body?: unknown;
  /** Use the central domain (signup) instead of the store's host. */
  central?: boolean;
  /** Explicit base URL, for login where no session exists yet. */
  baseUrl?: string;
  /** Skip the Authorization header (login, signup, forgot-password). */
  anonymous?: boolean;
  signal?: AbortSignal;
}

export interface ClientDeps {
  centralBaseUrl: string;
  getStoreBaseUrl: () => string | null;
  getToken: () => string | null;
  /** Called on any 401 from an authenticated call. */
  onUnauthorized: () => void;
  /** Called on 503 store_suspended. */
  onSuspended: () => void;
  fetchImpl?: typeof fetch;
}

const buildQuery = (query: RequestOptions<unknown>['query']): string => {
  if (!query) {
    return '';
  }
  const parts = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join('&')}` : '';
};

export function createApiClient(deps: ClientDeps) {
  const doFetch = deps.fetchImpl ?? fetch;

  async function request<T = unknown>(
    method: HttpMethod,
    path: string,
    opts: RequestOptions<T> = {},
  ): Promise<T> {
    const base =
      opts.baseUrl ??
      (opts.central ? deps.centralBaseUrl : deps.getStoreBaseUrl());
    if (!base) {
      throw new ApiError('unauthenticated', 401);
    }

    const headers: Record<string, string> = { Accept: 'application/json' };
    const token = deps.getToken();
    if (!opts.anonymous && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let body: string | FormData | undefined;
    if (opts.body instanceof FormData) {
      body = opts.body; // let fetch set the multipart boundary
    } else if (opts.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(opts.body);
    }

    let res: Response;
    try {
      res = await doFetch(`${base}${path}${buildQuery(opts.query)}`, {
        method,
        headers,
        body,
        signal: opts.signal,
      });
    } catch {
      throw networkError();
    }

    let json: unknown;
    const text = await res.text();
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = undefined;
      }
    }

    if (!res.ok) {
      const err = mapError(res.status, (json ?? {}) as ErrorBody);
      if (err.kind === 'unauthenticated' && !opts.anonymous) {
        deps.onUnauthorized();
      } else if (err.kind === 'store_suspended') {
        deps.onSuspended();
      }
      throw err;
    }

    if (!opts.schema) {
      return json as T;
    }
    const parsed = opts.schema.safeParse(json);
    if (!parsed.success) {
      throw invalidResponse();
    }
    return parsed.data;
  }

  return {
    request,
    get: <T>(path: string, o?: RequestOptions<T>) => request<T>('GET', path, o),
    post: <T>(path: string, o?: RequestOptions<T>) => request<T>('POST', path, o),
    put: <T>(path: string, o?: RequestOptions<T>) => request<T>('PUT', path, o),
    delete: <T>(path: string, o?: RequestOptions<T>) =>
      request<T>('DELETE', path, o),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
