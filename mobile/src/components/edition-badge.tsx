import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"

import { colors, radius, shadow } from "@/constants/theme"

import { Text } from "./text"

/**
 * Eastside's badge pill (APP_SPEC v8 V8.3): white, 11pt uppercase, radius 20,
 * a soft shadow. Reads "No. 02", "Hole 2 · Edition of 200" or, while live,
 * "143 of 200 left" (live stock only). `dark` is the #212121 "Sold out" pill.
 */
export function EditionBadge({
  size,
  left,
  hole,
  label,
  dark = false,
  style,
}: {
  size: number | null
  left?: number | null
  hole?: number | null
  /** Overrides the composed text (e.g. "Sold out", "No. 02"). */
  label?: string
  dark?: boolean
  style?: StyleProp<ViewStyle>
}) {
  if (!label && !size && !hole) return null
  const parts: string[] = []
  if (hole) parts.push(`Hole ${hole}`)
  if (size) parts.push(left != null ? `${left} of ${size} left` : `Edition of ${size}`)
  return (
    <View style={[styles.pill, dark ? styles.dark : styles.light, style]}>
      <Text variant="badge" style={{ color: dark ? colors.white : colors.text }}>
        {label ?? parts.join(" · ")}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: { alignSelf: "flex-start", paddingVertical: 2, paddingHorizontal: 8, borderRadius: radius.pill, justifyContent: "center" },
  light: { backgroundColor: colors.white, ...shadow.badge },
  dark: { backgroundColor: colors.text },
})
