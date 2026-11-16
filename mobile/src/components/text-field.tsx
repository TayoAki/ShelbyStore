import { useState } from "react"
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native"

import { colors, fonts, radius, type } from "@/constants/theme"

import { Text } from "./text"

/** Checkout / account input (APP_SPEC §5.7): 48pt, 1pt #E4E4E4 (black on focus), radius 3. */
export function TextField({ label, error, style, ...props }: TextInputProps & { label: string; error?: string }) {
  const [focused, setFocused] = useState(false)
  return (
    <View style={[styles.wrap, style as object]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        {...props}
        onFocus={(e) => {
          setFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          props.onBlur?.(e)
        }}
        accessibilityLabel={props.accessibilityLabel ?? label}
        style={[styles.input, focused && styles.focused, error ? styles.inputError : null]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19.5, color: colors.text },
  input: {
    ...type.system,
    height: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.button,
    backgroundColor: colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 0,
    color: colors.text,
  },
  focused: { borderColor: colors.primary },
  inputError: { borderColor: colors.error },
  error: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.error },
})
