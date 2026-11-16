import { useState } from "react"
import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native"

import { colors, fonts, radius } from "@/constants/theme"

import { Text } from "./text"

/**
 * Eastside fields (APP_SPEC v8 V8.3): 44pt, padding 10/12, 1pt #8C8C8C,
 * radius 3, 16pt text. Focus turns the border #212121 with a 2pt green ring;
 * errors sit in a pink error box below.
 */
export function TextField({
  label,
  error,
  style,
  multiline,
  onFocus,
  onBlur,
  inverse = false,
  ...props
}: TextInputProps & { label: string; error?: string | null; style?: StyleProp<ViewStyle>; inverse?: boolean }) {
  const [focused, setFocused] = useState(false)
  return (
    <View style={[styles.wrap, style]}>
      <Text variant="labelCaps" tone={inverse ? "onInk" : "default"}>
        {label}
      </Text>
      <View style={[styles.ring, focused && styles.ringOn]}>
        <TextInput
          {...props}
          multiline={multiline}
          accessibilityLabel={label}
          placeholderTextColor={colors.textLight}
          onFocus={(e) => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            onBlur?.(e)
          }}
          style={[styles.input, multiline && styles.multiline, focused && styles.inputOn, !!error && { borderColor: colors.error }]}
        />
      </View>
      {error ? <ErrorBox message={error} /> : null}
    </View>
  )
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <View style={styles.error} accessibilityRole="alert">
      <Text variant="meta" style={{ color: colors.error }}>
        {message}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  ring: { borderRadius: radius.button + 2, borderWidth: 2, borderColor: "transparent", margin: -2 },
  ringOn: { borderColor: colors.green },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: radius.button,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
  },
  inputOn: { borderColor: colors.text },
  multiline: { minHeight: 120, textAlignVertical: "top" },
  error: { backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder, borderRadius: radius.button, padding: 10 },
})
