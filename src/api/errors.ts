export type ApiErrorKind =
  | 'unauthenticated'
  | 'forbidden'
  | 'plan_gate'
  | 'not_found'
  | 'conflict'
  | 'validation'
  | 'business_refusal'
  | 'throttled'
  | 'store_suspended'
  | 'server'
  | 'network'
  | 'invalid_response';

export type FieldErrors = Record<string, string[]>;

export interface ErrorBody {
  message?: string;
  code?: string;
  errors?: FieldErrors;
  [extra: string]: unknown;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number;
  readonly code?: string;
  readonly fieldErrors: FieldErrors;
  /** Extra server fields such as `stock_quantity`, `max_staff_accounts`. */
  readonly extra: Record<string, unknown>;

  constructor(
    kind: ApiErrorKind,
    status: number,
    body: ErrorBody = {},
  ) {
    super(body.message ?? kind);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.code = typeof body.code === 'string' ? body.code : undefined;
    this.fieldErrors = body.errors ?? {};
    const { message: _m, code: _c, errors: _e, ...extra } = body;
    this.extra = extra;
  }
}

const PLAN_GATE_CODES = new Set([
  'staff_limit_reached',
  'custom_domain_not_in_plan',
  'driver_not_in_plan',
  'product_limit_reached',
]);

/** The single place HTTP statuses and server codes become typed errors. */
export function mapError(status: number, body: ErrorBody = {}): ApiError {
  const code = typeof body.code === 'string' ? body.code : undefined;

  if (status === 503 && code === 'store_suspended') {
    return new ApiError('store_suspended', status, body);
  }
  switch (status) {
    case 401:
      return new ApiError('unauthenticated', status, body);
    case 403:
      return new ApiError(
        code && PLAN_GATE_CODES.has(code) ? 'plan_gate' : 'forbidden',
        status,
        body,
      );
    case 404:
      return new ApiError('not_found', status, body);
    case 409:
      return new ApiError('conflict', status, body);
    case 422:
      return new ApiError(
        code ? 'business_refusal' : 'validation',
        status,
        body,
      );
    case 429:
      return new ApiError('throttled', status, body);
    default:
      return new ApiError('server', status, body);
  }
}

export const networkError = (): ApiError => new ApiError('network', 0);
export const invalidResponse = (): ApiError =>
  new ApiError('invalid_response', 0);
