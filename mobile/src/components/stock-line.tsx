import { StyleSheet, View } from "react-native"

import { colors, fonts } from "@/constants/theme"
import type { StockState } from "@/lib/product"

import { Text } from "./text"

/** The 10pt status dot used by the stock line, In Stock Today and the bag. */
export function StatusDot({ state }: { state: StockState }) {
  const bg = state === "sold_out" ? colors.textDisabled : state === "low" ? colors.primary : colors.inStock
  return <View style={[styles.dot, { backgroundColor: bg }]} />
}

/** "In stock, ready to ship!" / "Only N left, ready to ship!" / "Sold out in …" (APP_SPEC §3). */
export function StockLine({ state, quantity, where }: { state: StockState; quantity: number | null; where?: string }) {
  const label =
    state === "sold_out"
      ? `Sold out${where ? ` in ${where}` : ""}`
      : state === "low"
        ? `Only ${quantity} left, ready to ship!`
        : "In stock, ready to ship!"
  return (
    <View style={styles.row} accessibilityLiveRegion="polite">
      <StatusDot state={state} />
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { fontFamily: fonts.heading, fontSize: 14, lineHeight: 21, color: colors.text },
})
