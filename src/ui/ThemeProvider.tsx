import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  ImageStyle,
  StyleSheet,
  TextStyle,
  useColorScheme,
  ViewStyle,
} from 'react-native';
import { KV_KEYS, kv } from '../storage/mmkv';
import {
  font,
  Palette,
  palettes,
  radius,
  Scheme,
  shadows,
  spacing,
  type,
} from './theme';

export type ColorPreference = 'system' | 'light' | 'dark';

/**
 * Dark mode is built into every kit component, but most screens still read the static
 * light tokens. Until they move to useTheme(), a dark kit on light screens would look
 * broken, so the app resolves to light. Flip this once the screens are migrated.
 */
export const DARK_MODE_ENABLED = false;

export interface Theme {
  scheme: Scheme;
  c: Palette;
  shadow: ReturnType<typeof shadows>;
  spacing: typeof spacing;
  radius: typeof radius;
  type: typeof type;
  font: typeof font;
}

export const buildTheme = (scheme: Scheme): Theme => ({
  scheme,
  c: palettes[scheme],
  shadow: shadows(scheme),
  spacing,
  radius,
  type,
  font,
});

/** Which scheme to show, from the person's choice and the phone's setting. */
export function resolveScheme(
  pref: ColorPreference,
  system: 'light' | 'dark' | null | undefined,
  enabled = DARK_MODE_ENABLED,
): Scheme {
  if (!enabled) {
    return 'light';
  }
  if (pref === 'system') {
    return system === 'dark' ? 'dark' : 'light';
  }
  return pref;
}

const readPref = (): ColorPreference => {
  const v = kv.getString(KV_KEYS.colorScheme);
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
};

// Default value: light, so components (and tests) work without a provider.
const ThemeContext = createContext<{
  theme: Theme;
  pref: ColorPreference;
  setPref: (p: ColorPreference) => void;
}>({
  theme: buildTheme('light'),
  pref: 'system',
  setPref: () => undefined,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [pref, setPrefState] = useState<ColorPreference>(readPref);
  const scheme = resolveScheme(pref, system);
  const value = useMemo(
    () => ({
      theme: buildTheme(scheme),
      pref,
      setPref: (p: ColorPreference) => {
        kv.set(KV_KEYS.colorScheme, p);
        setPrefState(p);
      },
    }),
    [scheme, pref],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = (): Theme => useContext(ThemeContext).theme;
export const useColorPreference = () => {
  const { pref, setPref } = useContext(ThemeContext);
  return { pref, setPref };
};

/** Theme-aware StyleSheet, rebuilt only when the scheme changes. */
type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

export function useStyles<T extends NamedStyles>(factory: (t: Theme) => T): T {
  const theme = useTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => StyleSheet.create(factory(theme)), [theme.scheme]);
}
