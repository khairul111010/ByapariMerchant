import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useTranslation } from 'react-i18next';
import { queryClient } from '../../app/queryClient';
import { startPush } from './push';

/** While signed in: push wiring, plus a gentle refresh on foreground (push is best-effort). */
export function usePush() {
  const { t } = useTranslation();
  const channelName = t('push.channelName');
  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;
    void startPush(channelName)
      .then((cleanup) => (cancelled ? cleanup() : (stop = cleanup)))
      .catch(() => {});
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        void queryClient.invalidateQueries({ queryKey: ['orders'] });
        void queryClient.invalidateQueries({ queryKey: ['me'] });
      }
    });
    return () => {
      cancelled = true;
      stop?.();
      sub.remove();
    };
  }, [channelName]);
}
