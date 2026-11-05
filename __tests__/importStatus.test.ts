import { isFinished, outcome, progressFraction } from '../src/features/imports/status';

describe('import status', () => {
  it('only pending and processing are unfinished', () => {
    expect(isFinished('pending')).toBe(false);
    expect(isFinished('processing')).toBe(false);
    expect(isFinished('completed')).toBe(true);
    expect(isFinished('completed_with_errors')).toBe(true);
    expect(isFinished('failed')).toBe(true);
  });
  it('an unknown future status stops polling instead of polling forever', () => {
    expect(isFinished('cancelled')).toBe(true);
  });
  it('classifies the outcome', () => {
    expect(outcome('processing', null)).toBe('running');
    expect(outcome('completed', 0)).toBe('success');
    expect(outcome('completed_with_errors', 2)).toBe('partial');
    expect(outcome('completed', 3)).toBe('partial');
    expect(outcome('failed', null)).toBe('failed');
  });
  it('progress fraction', () => {
    expect(progressFraction(3, 6)).toBe(0.5);
    expect(progressFraction(null, 6)).toBeNull();
    expect(progressFraction(2, 0)).toBeNull();
    expect(progressFraction(9, 6)).toBe(1);
  });
});
