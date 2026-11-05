export const MAX_CSV_BYTES = 10 * 1024 * 1024;

/**
 * pending/processing are the only unfinished states. Anything else (completed,
 * completed_with_errors, failed, or a status added later) stops the polling,
 * so an unexpected value can never poll forever.
 */
export const isFinished = (status: string): boolean => status !== 'pending' && status !== 'processing';

export type ImportOutcome = 'running' | 'success' | 'partial' | 'failed';

export function outcome(status: string, failedCount: number | null): ImportOutcome {
  if (!isFinished(status)) {
    return 'running';
  }
  if (status === 'failed') {
    return 'failed';
  }
  return status === 'completed_with_errors' || (failedCount ?? 0) > 0 ? 'partial' : 'success';
}

/** Share of rows handled so far, 0..1, or null when the total is not known yet. */
export function progressFraction(processed: number | null, total: number | null): number | null {
  if (processed === null || total === null || total <= 0) {
    return null;
  }
  return Math.min(1, Math.max(0, processed / total));
}
