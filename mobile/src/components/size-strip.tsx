import { StyleSheet, View } from "react-native"

import { colors, radius, spacing } from "@/constants/theme"
import type { StockState } from "@/lib/product"

import { Text } from "./text"

/** Read-only size availability, e.g. on the core card: S M L XL with sold-out sizes struck through. */
export function SizeStrip({ sizes }: { sizes: { size: string; state: StockState }[] }) {
  if (!sizes.length) return null
  return (
    <View style={styles.row} accessibilityLabel={describe(sizes)}>
      {sizes.map(({ size, state }) => (
        <View key={size} style={[styles.chip, state === "sold_out" && styles.chipOut]}>
          <Text
            variant="small"
            tone={state === "sold_out" ? "muted" : "default"}
            style={[styles.label, state === "sold_out" && styles.struck]}>
            {size}
          </Text>
          {state === "low" ? <View style={styles.lowDot} /> : null}
        </View>
      ))}
    </View>
  )
}

function describe(sizes: { size: string; state: StockState }[]) {
  return sizes
    .map(({ size, state }) => `${size} ${state === "sold_out" ? "sold out" : state === "low" ? "low stock" : "in stock"}`)
    .join(", ")
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    minWidth: 40,
    height: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  chipOut: { backgroundColor: colors.surfaceAlt },
  label: { fontWeight: "600" },
  struck: { textDecorationLine: "line-through" },
  lowDot: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
})
