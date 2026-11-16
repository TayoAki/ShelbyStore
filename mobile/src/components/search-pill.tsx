import Ionicons from "@expo/vector-icons/Ionicons"
import { useEffect, useState } from "react"
import { StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from "react-native"

import { colors, fonts, radius } from "@/constants/theme"

const PLACEHOLDERS = ["Search", 'Search "navy"', 'Search "pine"', 'Search "pair"', 'Search "azalea"']

/** The search field (APP_SPEC v8 V8.3): a 44pt field, radius 3, 1pt #8C8C8C, a leading search icon. Not a pill. */
export function SearchPill({
  value,
  onChangeText,
  onSubmit,
  autoFocus,
  style,
}: {
  value: string
  onChangeText: (text: string) => void
  onSubmit?: () => void
  autoFocus?: boolean
  style?: StyleProp<ViewStyle>
}) {
  const [i, setI] = useState(0)
  const [focused, setFocused] = useState(false)
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % PLACEHOLDERS.length), 2000)
    return () => clearInterval(id)
  }, [])
  return (
    <View style={[styles.field, focused && styles.focused, style]}>
      <Ionicons name="search" size={18} color={colors.text} style={styles.icon} />
      <TextInput
        accessibilityLabel="Search the Rope Cap"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={PLACEHOLDERS[i]}
        placeholderTextColor={colors.textLight}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.input}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  field: { height: 44, borderWidth: 1, borderColor: colors.fieldBorder, borderRadius: radius.button, backgroundColor: colors.white, justifyContent: "center" },
  focused: { borderColor: colors.text },
  icon: { position: "absolute", left: 12 },
  input: { paddingLeft: 38, paddingRight: 12, fontFamily: fonts.body, fontSize: 16, color: colors.text, height: 42 },
})
