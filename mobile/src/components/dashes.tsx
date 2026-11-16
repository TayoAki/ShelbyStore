import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"

import { colors } from "@/constants/theme"

/** Carousel indicator (APP_SPEC §3): 21×4 dashes, 8 apart, active black. */
export function Dashes({ count, index, style }: { count: number; index: number; style?: StyleProp<ViewStyle> }) {
  if (count < 2) return null
  return (
    <View style={[styles.row, style]} accessibilityLabel={`Image ${index + 1} of ${count}`}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.dash, i === index && styles.on]} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "center", gap: 8 },
  dash: { width: 21, height: 4, backgroundColor: colors.line },
  on: { backgroundColor: colors.primary },
})
