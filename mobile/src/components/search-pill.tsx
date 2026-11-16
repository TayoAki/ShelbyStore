import Ionicons from "@expo/vector-icons/Ionicons"
import { useEffect, useState } from "react"
import { StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from "react-native"

import { colors, fonts, radius } from "@/constants/theme"

const PLACEHOLDERS = ["Search", 'Search "navy"', 'Search "pine"', 'Search "pair"', 'Search "azalea"']

/** v5 search pill: 42pt, white, 1pt #212121, an 18pt icon and a placeholder that rotates every 2s. */
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
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % PLACEHOLDERS.length), 2000)
    return () => clearInterval(id)
  }, [])
  return (
    <View style={[styles.pill, style]}>
      <Ionicons name="search-outline" size={18} color={colors.black} style={styles.icon} />
      <TextInput
        accessibilityLabel="Search the Rope Cap"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={PLACEHOLDERS[i]}
        placeholderTextColor={colors.gray500}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        autoFocus={autoFocus}
        style={styles.input}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    height: 42,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    justifyContent: "center",
  },
  icon: { position: "absolute", left: 14 },
  input: { paddingLeft: 40, paddingRight: 16, fontFamily: fonts.body, fontSize: 16, color: colors.black, height: 40 },
})
