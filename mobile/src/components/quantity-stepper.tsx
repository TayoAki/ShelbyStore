import Ionicons from "@expo/vector-icons/Ionicons"
import { Pressable, StyleSheet, View } from "react-native"

import { colors } from "@/constants/theme"

import { Text } from "./text"

/** Eastside's quantity control (APP_SPEC v8 V8.3): − and + icons in 44pt hit areas, the count in 14.4 tabular, no outer border. */
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
  const less = disabled || value - step < min
  const more = disabled || value + step > max
  return (
    <View style={styles.row} accessibilityLabel={`${label} ${value}`}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label.toLowerCase()}`}
        disabled={less}
        onPress={() => onChange(Math.max(min, value - step))}
        style={({ pressed }) => [styles.btn, less && { opacity: 0.35 }, pressed && { opacity: 0.6 }]}>
        <Ionicons name="remove" size={12} color={colors.text} />
      </Pressable>
      <Text variant="scoreNumber" style={styles.count}>
        {value}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label.toLowerCase()}`}
        disabled={more}
        onPress={() => onChange(Math.min(max, value + step))}
        style={({ pressed }) => [styles.btn, more && { opacity: 0.35 }, pressed && { opacity: 0.6 }]}>
        <Ionicons name="add" size={12} color={colors.text} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  btn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  count: { minWidth: 24, textAlign: "center" },
})
