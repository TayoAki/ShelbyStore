import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native"

import { colors, fonts, radius } from "@/constants/theme"

import { Text } from "./text"

/** v5 inputs: 42pt pill, 1pt #212121, white; mono label above, red error below. */
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
        placeholderTextColor={colors.gray500}
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
    height: 42,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 0,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.black,
  },
  multiline: { height: 110, borderRadius: radius.xl, paddingTop: 12, textAlignVertical: "top" },
})
