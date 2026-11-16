import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"

import { colors } from "@/constants/theme"

import { Text } from "./text"

/**
 * The edition stripe (APP_SPEC v7 §3): sleeve red, the only place red prints.
 * "EDITION OF 200", "143 OF 200 LEFT" while live (live stock only), or with
 * its hole ("HOLE 2 · EDITION OF 200"). Sits in the meta line, never on a photo.
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
      <Text variant="edition" style={{ color: colors.paper }}>
        {parts.join(" · ")}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: { alignSelf: "flex-start", minHeight: 26, paddingHorizontal: 10, backgroundColor: colors.stripe, justifyContent: "center" },
})
