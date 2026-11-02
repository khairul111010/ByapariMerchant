import { getCrashlytics, log, recordError, setCrashlyticsCollectionEnabled } from '@react-native-firebase/crashlytics';
import { ApiError } from '../api/errors';
import { scrub } from './scrub';

/** An error safe to send: never the server's text for API errors, always scrubbed. */
export function toSafeError(err: unknown): Error {
  if (err instanceof ApiError) {
    return new Error(`ApiError ${err.kind} ${err.status}${err.code ? ` ${err.code}` : ''}`);
  }
  const src = err instanceof Error ? err : new Error(String(err));
  const safe = new Error(scrub(src.message));
  safe.name = src.name;
  safe.stack = src.stack ? scrub(src.stack) : undefined;
  return safe;
}

/** Crash reporting only, and only in release builds. No user id, no PII. */
export function initTelemetry(): void {
  try {
    void setCrashlyticsCollectionEnabled(getCrashlytics(), !__DEV__);
  } catch {}
}

export function reportError(err: unknown): void {
  if (__DEV__) {
    return;
  }
  try {
    recordError(getCrashlytics(), toSafeError(err));
  } catch {}
}

export function breadcrumb(message: string): void {
  if (__DEV__) {
    return;
  }
  try {
    log(getCrashlytics(), scrub(message));
  } catch {}
}
