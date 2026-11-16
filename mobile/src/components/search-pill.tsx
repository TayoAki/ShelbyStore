import Ionicons from "@expo/vector-icons/Ionicons"
import { useEffect, useState } from "react"
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from "react-native"

import { colors, fonts, radius } from "@/constants/theme"

import { Text } from "./text"

const PLACEHOLDERS = ["Search", 'Search "cap"', 'Search "beanie"', 'Search "trucker"', 'Search "olive"']

function useRotatingPlaceholder() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % PLACEHOLDERS.length), 2000)
    return () => clearInterval(id)
  }, [])
  return PLACEHOLDERS[i]
}

/**
 * Melin's search pill (APP_SPEC §3): 36pt, #F8F8F9, a 14pt search icon and a
 * placeholder that rotates every 2s. With `onPress` it is a button (Home opens
 * Shop); with `onChangeText` it filters in place (Shop).
 */
export function SearchPill({
  value,
  onChangeText,
  onPress,
  style,
}: {
  value?: string
  onChangeText?: (text: string) => void
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}) {
  const placeholder = useRotatingPlaceholder()
  const icon = <Ionicons name="search" size={14} color={colors.text} style={styles.icon} />

  if (onPress || !onChangeText) {
    return (
      <Pressable accessibilityRole="search" accessibilityLabel="Search hats" onPress={onPress} style={[styles.pill, style]}>
        {icon}
        <Text style={styles.placeholder} numberOfLines={1}>
          {placeholder}
        </Text>
      </Pressable>
    )
  }

  return (
    <View style={[styles.pill, style]}>
      {icon}
      <TextInput
        accessibilityLabel="Search hats"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        style={styles.input}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.band,
    paddingLeft: 32,
    paddingRight: 12,
    justifyContent: "center",
  },
  icon: { position: "absolute", left: 10, top: 11 },
  placeholder: { fontFamily: fonts.system, fontSize: 16, lineHeight: 20, color: colors.textMuted },
  input: { fontFamily: fonts.system, fontSize: 16, color: colors.text, height: 36, paddingVertical: 0 },
})
