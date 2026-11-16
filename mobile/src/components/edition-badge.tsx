import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"

import { colors, golf, radius } from "@/constants/theme"

import { Text } from "./text"

/**
 * The edition badge (APP_SPEC G.3): "EDITION OF 200", or "143 OF 200 LEFT"
 * while live (live stock only), or a hole label ("HOLE 2 · EDITION OF 200").
 */
export function EditionBadge({
  size,
  left,
  hole,
  style,
}: {
  size: number | null
  left?: number | null
  hole?: number | null
  style?: StyleProp<ViewStyle>
}) {
  if (!size && !hole) return null
  const parts: string[] = []
  if (hole) parts.push(`Hole ${hole}`)
  if (size) parts.push(left != null ? `${left} of ${size} left` : `Edition of ${size}`)
  return (
    <View style={[styles.badge, style]}>
      <Text variant="edition" tone="midnight">
        {parts.join(" · ")}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    height: 24,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: golf.midnight,
    backgroundColor: colors.white,
    justifyContent: "center",
  },
})
