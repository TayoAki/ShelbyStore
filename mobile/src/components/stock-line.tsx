import { StyleSheet, View } from "react-native"

import { colors } from "@/constants/theme"
import type { StockState } from "@/lib/product"
import { POLICY } from "@/lib/policy"

import { usePanelInk } from "./box"
import { Text } from "./text"

/**
 * Live stock, printed on whatever face it sits on: on white board the state
 * colours (green in stock, red low with the real count, ink sold out); on an
 * inked face everything prints in that face's ink so it keeps its contrast.
 */
export function StockLine({ state, quantity, inverse = false }: { state: StockState; quantity: number | null; inverse?: boolean }) {
  const ink = usePanelInk()
  const onBoard = ink.panel.toUpperCase() === colors.paper
  const color = inverse
    ? colors.paper
    : !onBoard
      ? ink.ink
      : state === "in_stock"
        ? colors.green
        : state === "low"
          ? colors.red
          : colors.ink3
  const label =
    state === "in_stock" ? `In stock · ${POLICY.dispatch.toLowerCase()}` : state === "low" ? `Only ${quantity} left` : "Sold out"
  return (
    <View style={styles.row} accessibilityLiveRegion="polite">
      <View style={[styles.mark, { backgroundColor: color }]} />
      <Text variant="meta" style={{ color }}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 8 }, mark: { width: 8, height: 8 } })
