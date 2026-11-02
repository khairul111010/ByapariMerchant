import { RELOCK_AFTER_MS, shouldLock } from '../src/store/lock';

describe('shouldLock', () => {
  it('never locks when disabled', () => {
    expect(shouldLock(false, RELOCK_AFTER_MS * 10)).toBe(false);
  });
  it('does not lock on a quick app switch', () => {
    expect(shouldLock(true, 5_000)).toBe(false);
    expect(shouldLock(true, RELOCK_AFTER_MS)).toBe(false);
  });
  it('locks after being away longer than the threshold', () => {
    expect(shouldLock(true, RELOCK_AFTER_MS + 1)).toBe(true);
  });
});

describe('logout wipe', () => {
  it('resets the lock preference so it cannot leak to the next login', async () => {
    const { useLock } = require('../src/store/lock');
    const { useSession } = require('../src/store/session');
    useLock.getState().setEnabled(true);
    useLock.getState().lock();
    await useSession.getState().signOut();
    expect(useLock.getState().enabled).toBe(false);
    expect(useLock.getState().locked).toBe(false);
  });
});
