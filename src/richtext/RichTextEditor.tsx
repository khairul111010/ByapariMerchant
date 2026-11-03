import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../ui';
import { colors, font, radius, spacing, touch } from '../ui/theme';
import { Block, isList } from './model';

const TYPES: Array<{ type: Block['type']; label: string }> = [
  { type: 'p', label: 'P' },
  { type: 'h2', label: 'H2' },
  { type: 'h3', label: 'H3' },
  { type: 'ul', label: '•' },
  { type: 'ol', label: '1.' },
  { type: 'blockquote', label: '❝' },
];

const textOf = (b: Block): string => (isList(b) ? b.items.join('\n') : b.text);

function withText(b: Block, text: string): Block {
  return isList(b) ? { ...b, items: text.split('\n') } : { ...b, text };
}

function withType(b: Block, type: Block['type']): Block {
  const text = textOf(b);
  return type === 'ul' || type === 'ol'
    ? { type, items: text.split('\n') }
    : { type, text: text.replace(/\n/g, ' ') };
}

/** Block editor. It can only produce the server's allowed tags (see model.ts). */
export function RichTextEditor({
  value,
  onChange,
}: {
  value: Block[];
  onChange: (b: Block[]) => void;
}) {
  const { t } = useTranslation();
  const selection = useRef<{ index: number; start: number; end: number }>({
    index: 0,
    start: 0,
    end: 0,
  });
  const [, force] = useState(0);

  const set = (i: number, b: Block) =>
    onChange(value.map((x, j) => (j === i ? b : x)));

  const wrap = (marker: string) => {
    const { index, start, end } = selection.current;
    const b = value[index];
    if (!b || start === end) {
      return;
    }
    const text = textOf(b);
    set(
      index,
      withText(
        b,
        `${text.slice(0, start)}${marker}${text.slice(
          start,
          end,
        )}${marker}${text.slice(end)}`,
      ),
    );
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.toolbar}>
        {[
          ['B', '**'],
          ['I', '*'],
          ['U', '__'],
        ].map(([label, marker]) => (
          <Pressable
            key={label}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => wrap(marker)}
            style={styles.tool}
          >
            <Text variant="label">{label}</Text>
          </Pressable>
        ))}
      </View>
      {value.map((b, i) => (
        <View key={i} style={styles.block}>
          <View style={styles.types}>
            {TYPES.map(o => (
              <Pressable
                key={o.type}
                accessibilityRole="button"
                accessibilityState={{ selected: b.type === o.type }}
                onPress={() => set(i, withType(b, o.type))}
                style={[styles.type, b.type === o.type && styles.typeOn]}
              >
                <Text
                  variant="label"
                  style={b.type === o.type ? styles.typeTextOn : undefined}
                >
                  {o.label}
                </Text>
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('images.remove')}
              onPress={() => onChange(value.filter((_, j) => j !== i))}
              style={styles.type}
            >
              <Text variant="label">✕</Text>
            </Pressable>
          </View>
          <TextInput
            multiline
            value={textOf(b)}
            onChangeText={x => set(i, withText(b, x))}
            onSelectionChange={e => {
              selection.current = { index: i, ...e.nativeEvent.selection };
              force(n => n + 1);
            }}
            style={styles.input}
            accessibilityLabel={t('products.form.description')}
            textAlignVertical="top"
          />
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange([...value, { type: 'p', text: '' }])}
        style={styles.add}
      >
        <Text variant="label">+ {t('products.form.description')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  toolbar: { flexDirection: 'row', gap: spacing.sm },
  tool: {
    minWidth: touch,
    minHeight: touch,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  block: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  type: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeTextOn: { color: colors.primaryText },
  input: {
    minHeight: 72,
    fontFamily: font.regular,
    fontSize: 16,
    color: colors.text,
    padding: spacing.sm,
  },
  add: {
    minHeight: touch,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.md,
  },
});
