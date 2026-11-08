import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatNumber, Lang, MONTHS } from '../i18n/format';
import { useLang } from '../i18n';
import {
  addMonths,
  monthGrid,
  parseDate,
  toISODate,
  todayInDhaka,
} from './calendar';
import { Icon } from './Icon';
import { Sheet } from './Sheet';
import { Button, Text } from './index';
import { touch } from './theme';
import { useStyles, useTheme } from './ThemeProvider';

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

const label = (iso: string, lang: Lang): string => {
  const p = parseDate(iso);
  return p
    ? `${formatNumber(p.d, lang)} ${MONTHS[lang][p.m - 1]} ${formatNumber(
        p.y,
        lang,
      )}`
    : '';
};

/**
 * A date picked from a month grid in a bottom sheet. The value is a plain "YYYY-MM-DD" string
 * (or ""), with no time or timezone, which is what the server's date fields take.
 */
export function DateField({
  label: fieldLabel,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  error?: string;
}) {
  const styles = useDateStyles();
  const { c } = useTheme();
  const { t } = useTranslation();
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const today = todayInDhaka();
  const selected = parseDate(value);
  const [view, setView] = useState({
    y: (selected ?? today).y,
    m: (selected ?? today).m,
  });

  const show = () => {
    const base = parseDate(value) ?? todayInDhaka();
    setView({ y: base.y, m: base.m });
    setOpen(true);
  };
  const choose = (iso: string) => {
    onChange(iso);
    setOpen(false);
  };

  return (
    <View style={styles.wrap}>
      <Text variant="label" style={styles.fieldLabel}>
        {fieldLabel}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${fieldLabel}: ${
          selected ? label(value, lang) : t('calendar.none')
        }`}
        onPress={show}
        style={[styles.field, error ? styles.fieldError : null]}
      >
        <Text
          style={[styles.fieldText, selected ? undefined : styles.placeholder]}
        >
          {selected ? label(value, lang) : t('calendar.choose')}
        </Text>
        <Icon name="chevronRight" size={20} color={c.textSecondary} />
      </Pressable>
      {error ? <Text variant="error">{error}</Text> : null}

      <Sheet visible={open} onClose={() => setOpen(false)} title={fieldLabel}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('calendar.prev')}
            onPress={() => setView(v => addMonths(v.y, v.m, -1))}
            style={styles.nav}
          >
            <Icon name="chevronLeft" size={24} />
          </Pressable>
          <Text variant="label" accessibilityRole="header">
            {MONTHS[lang][view.m - 1]} {formatNumber(view.y, lang)}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('calendar.next')}
            onPress={() => setView(v => addMonths(v.y, v.m, 1))}
            style={styles.nav}
          >
            <Icon name="chevronRight" size={24} />
          </Pressable>
        </View>
        <View style={styles.week}>
          {WEEKDAYS.map(w => (
            <Text key={w} variant="caption" style={styles.weekday}>
              {t(`calendar.weekdays.${w}`)}
            </Text>
          ))}
        </View>
        {monthGrid(view.y, view.m).map((week, i) => (
          <View key={i} style={styles.week}>
            {week.map((d, j) => {
              if (d === null) {
                return <View key={j} style={styles.cell} />;
              }
              const iso = toISODate({ y: view.y, m: view.m, d });
              const isSelected = iso === value;
              const isToday = iso === toISODate(today);
              return (
                <Pressable
                  key={j}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={label(iso, lang)}
                  onPress={() => choose(iso)}
                  style={[
                    styles.cell,
                    styles.day,
                    isToday && styles.today,
                    isSelected && styles.selected,
                  ]}
                >
                  <Text style={isSelected ? styles.selectedText : undefined}>
                    {formatNumber(d, lang)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
        <View style={styles.actions}>
          <View style={styles.flex}>
            <Button
              title={t('calendar.today')}
              kind="secondary"
              onPress={() => choose(toISODate(today))}
            />
          </View>
          <View style={styles.flex}>
            <Button
              title={t('calendar.clear')}
              kind="secondary"
              onPress={() => choose('')}
            />
          </View>
        </View>
      </Sheet>
    </View>
  );
}

function useDateStyles() {
  return useStyles(({ c, radius, spacing, shadow }) => ({
    wrap: { gap: spacing.xs },
    fieldLabel: { color: c.textSecondary, fontSize: 13 },
    field: {
      minHeight: 54,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1.5,
      borderColor: 'transparent',
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      backgroundColor: c.card,
      ...shadow.card,
    },
    fieldError: { borderColor: c.dangerText },
    fieldText: { fontSize: 16 },
    placeholder: { color: c.textSecondary },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    nav: {
      minWidth: touch,
      minHeight: touch,
      alignItems: 'center',
      justifyContent: 'center',
    },
    week: { flexDirection: 'row' },
    weekday: { flex: 1, textAlign: 'center' },
    cell: { flex: 1, height: touch },
    day: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
    },
    today: { borderWidth: 1.5, borderColor: c.primaryFill },
    selected: { backgroundColor: c.primaryFill },
    selectedText: { color: c.textOnPrimary },
    actions: { flexDirection: 'row', gap: spacing.sm },
    flex: { flex: 1 },
  }));
}
