import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native"

import { colors, fonts } from "@/constants/theme"

import { Text } from "./text"

/** v7 fields: a 48pt square-cut field with a 2pt ink keyline; the label sits above, the error below. */
export function TextField({
  label,
  error,
  style,
  multiline,
  ...props
}: TextInputProps & { label: string; error?: string | null; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.wrap, style]}>
      <Text variant="label">{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        accessibilityLabel={label}
        placeholderTextColor={colors.ink3}
        style={[styles.input, multiline && styles.multiline, !!error && { borderColor: colors.red }]}
      />
      {error ? (
        <Text variant="meta" tone="error">
          {error}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  input: {
    height: 48,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.paper,
    paddingHorizontal: 14,
    paddingVertical: 0,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
  },
  multiline: { height: 120, paddingTop: 12, textAlignVertical: "top" },
})
