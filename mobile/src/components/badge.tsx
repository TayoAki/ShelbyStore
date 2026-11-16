import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"

import { colors, radius } from "@/constants/theme"

import { Text } from "./text"

/** Allbirds' badge (APP_SPEC v5 §3): natural-white fill, pill, 10pt UPPERCASE. */
export function Badge({
  label,
  white = false,
  style,
}: {
  label: string
  white?: boolean
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View style={[styles.badge, white && styles.white, style]}>
      <Text variant="badge">{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.naturalWhite,
    borderRadius: radius.full,
    padding: 8,
  },
  white: { backgroundColor: colors.white },
})
