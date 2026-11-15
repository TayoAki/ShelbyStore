import { StyleSheet, TextInput, View, type TextInputProps } from "react-native"

import { colors, radius, spacing } from "@/constants/theme"

import { Text } from "./text"

export function TextField({ label, error, style, ...props }: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={[styles.wrap, style as object]}>
      <Text variant="eyebrow" tone="muted">
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        {...props}
        accessibilityLabel={props.accessibilityLabel ?? label}
        style={[styles.input, error ? styles.inputError : null]}
      />
      {error ? (
        <Text variant="small" tone="danger">
          {error}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs + 2 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  inputError: { borderColor: colors.danger },
})
