import Ionicons from "@expo/vector-icons/Ionicons"
import { Pressable, StyleSheet, View } from "react-native"

import { colors, radius } from "@/constants/theme"

import { Text } from "./text"

/** APP_SPEC v5 §3: 32pt pill, 1pt #CDCDCD, 44pt hit slop. */
export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  disabled = false,
  label = "Quantity",
}: {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  label?: string
}) {
  return (
    <View style={styles.pill} accessibilityLabel={`${label} ${value}`}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label.toLowerCase()}`}
        hitSlop={12}
        disabled={disabled || value - step < min}
        onPress={() => onChange(Math.max(min, value - step))}
        style={({ pressed }) => [styles.btn, (disabled || value - step < min) && { opacity: 0.35 }, pressed && { opacity: 0.6 }]}>
        <Ionicons name="remove" size={14} color={colors.black} />
      </Pressable>
      <Text variant="priceSm" style={styles.count}>
        {value}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label.toLowerCase()}`}
        hitSlop={12}
        disabled={disabled || value + step > max}
        onPress={() => onChange(Math.min(max, value + step))}
        style={({ pressed }) => [styles.btn, (disabled || value + step > max) && { opacity: 0.35 }, pressed && { opacity: 0.6 }]}>
        <Ionicons name="add" size={14} color={colors.black} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    height: 32,
    width: 96,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.stroke,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    backgroundColor: colors.white,
  },
  btn: { width: 20, alignItems: "center" },
  count: { minWidth: 24, textAlign: "center" },
})
