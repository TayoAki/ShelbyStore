import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"

import { colors, fonts } from "@/constants/theme"

import { Text } from "./text"

export type BadgeLabel = "Limited" | "Core" | "Low Stock" | "Coming Soon"

/** Melin's product badge: #EDEDED, square, body 15/22.5 (APP_SPEC §3). */
export function Badge({ label, small = false, style }: { label: string; small?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.badge, style]}>
      <Text style={[styles.label, small && styles.small]}>{label}</Text>
    </View>
  )
}

/** Absolutely placed at top 14 / left 14 over an image. */
export function ImageBadge({ label }: { label: string }) {
  return <Badge label={label} style={styles.onImage} />
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.mega,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  label: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22.5, color: colors.text },
  small: { fontSize: 12, lineHeight: 18 },
  onImage: { position: "absolute", top: 14, left: 14 },
})
