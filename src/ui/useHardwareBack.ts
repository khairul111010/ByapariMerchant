import { useContext, useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { NavigationContext } from '@react-navigation/native';

/**
 * Makes the phone's back button (or back gesture) do the same as the on-screen
 * back arrow. Only the screen in the focused tab listens, so a detail screen left
 * open in another tab never steals the press. The newest listener wins, which is
 * always the deepest screen on show. Without a handler, nothing is registered and
 * the navigator's own back behaviour applies (for example, return to Home).
 */
export function useHardwareBack(handler?: () => void) {
  const navigation = useContext(NavigationContext);
  const ref = useRef(handler);
  ref.current = handler;
  const [focused, setFocused] = useState(() => navigation?.isFocused() ?? true);

  useEffect(() => {
    if (!navigation) {
      return;
    }
    setFocused(navigation.isFocused());
    const offFocus = navigation.addListener('focus', () => setFocused(true));
    const offBlur = navigation.addListener('blur', () => setFocused(false));
    return () => {
      offFocus();
      offBlur();
    };
  }, [navigation]);

  const enabled = focused && handler !== undefined;
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      ref.current?.();
      return true;
    });
    return () => sub.remove();
  }, [enabled]);
}
