import { Pressable, StyleSheet, View } from "react-native"

import { colors, radius, spacing } from "@/constants/theme"
import type { StockState } from "@/lib/product"

import { Text } from "./text"

/** Selectable option values (Color, Size) with per-value stock under the current selection. */
export function OptionPicker({
  title,
  values,
  selected,
  stockFor,
  onSelect,
  showStockHint,
}: {
  title: string
  values: string[]
  selected?: string
  stockFor: (value: string) => StockState
  onSelect: (value: string) => void
  showStockHint?: boolean
}) {
  const selectedState = selected ? stockFor(selected) : undefined
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text variant="eyebrow">
          {title}
          {selected ? <Text variant="eyebrow" tone="muted">{`  ${selected}`}</Text> : null}
        </Text>
        {showStockHint && selectedState === "low" ? (
          <Text variant="small" tone="accent" style={styles.hint}>
            Only a few left
          </Text>
        ) : null}
      </View>
      <View style={styles.row}>
        {values.map((value) => {
          const state = stockFor(value)
          const isSelected = value === selected
          const soldOut = state === "sold_out"
          return (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, disabled: soldOut }}
              accessibilityLabel={`${title} ${value}${soldOut ? ", sold out" : state === "low" ? ", low stock" : ""}`}
              disabled={soldOut}
              onPress={() => onSelect(value)}
              style={[styles.chip, isSelected && styles.chipSelected, soldOut && styles.chipOut]}>
              <Text
                variant="small"
                tone={isSelected ? "inverse" : soldOut ? "muted" : "default"}
                style={[styles.chipLabel, soldOut && styles.struck]}>
                {value}
              </Text>
              {state === "low" && !isSelected ? <View style={styles.lowDot} /> : null}
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hint: { fontWeight: "600" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    minWidth: 52,
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: { backgroundColor: colors.text, borderColor: colors.text },
  chipOut: { backgroundColor: colors.surfaceAlt, borderColor: colors.surfaceAlt },
  chipLabel: { fontWeight: "600" },
  struck: { textDecorationLine: "line-through" },
  lowDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
})
