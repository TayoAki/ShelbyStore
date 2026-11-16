import Ionicons from "@expo/vector-icons/Ionicons"
import { Pressable, StyleSheet, View } from "react-native"

import { colors } from "@/constants/theme"

import { Text } from "./text"

/** APP_SPEC v7 §4: a keylined counter, square, 44pt tall; each button is a full 44pt target and the count sits in tight figures. */
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
    <View style={styles.box} accessibilityLabel={`${label} ${value}`}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label.toLowerCase()}`}
        disabled={disabled || value - step < min}
        onPress={() => onChange(Math.max(min, value - step))}
        style={({ pressed }) => [styles.btn, (disabled || value - step < min) && { opacity: 0.35 }, pressed && { opacity: 0.6 }]}>
        <Ionicons name="remove" size={18} color={colors.ink} />
      </Pressable>
      <Text variant="priceSm" style={styles.count}>
        {value}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label.toLowerCase()}`}
        disabled={disabled || value + step > max}
        onPress={() => onChange(Math.min(max, value + step))}
        style={({ pressed }) => [styles.btn, (disabled || value + step > max) && { opacity: 0.35 }, pressed && { opacity: 0.6 }]}>
        <Ionicons name="add" size={18} color={colors.ink} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  box: { height: 48, borderWidth: 2, borderColor: colors.ink, flexDirection: "row", alignItems: "center", backgroundColor: colors.paper },
  btn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  count: { minWidth: 32, textAlign: "center", color: colors.ink },
})
