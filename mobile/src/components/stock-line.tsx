import { StyleSheet, View } from "react-native"

import { colors } from "@/constants/theme"
import type { StockState } from "@/lib/product"
import { POLICY } from "@/lib/policy"

import { Text } from "./text"

/** Live stock (APP_SPEC v5 §3): green in stock, red low (with the real count), muted sold out. */
export function StockLine({ state, quantity, inverse = false }: { state: StockState; quantity: number | null; inverse?: boolean }) {
  const color = inverse ? colors.white : state === "in_stock" ? colors.green : state === "low" ? colors.red : colors.muted
  const label =
    state === "in_stock"
      ? `In stock · ${POLICY.dispatch.toLowerCase()}`
      : state === "low"
        ? `Only ${quantity} left`
        : "Sold out"
  return (
    <View style={styles.row} accessibilityLiveRegion="polite">
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="meta" style={{ color }}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
})
