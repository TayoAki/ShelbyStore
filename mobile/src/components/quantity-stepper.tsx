import Ionicons from "@expo/vector-icons/Ionicons"
import { Pressable, StyleSheet, View } from "react-native"

import { colors, fonts } from "@/constants/theme"

import { Text } from "./text"

/** Melin's quantity pill (APP_SPEC §3): 114×34, 1pt #E4E4E4, radius 50, 44pt hit slop. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled,
}: {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  disabled?: boolean
}) {
  return (
    <View style={styles.pill}>
      <Step icon="remove" a11y="Decrease quantity" disabled={disabled || value <= min} onPress={() => onChange(value - 1)} />
      <Text style={styles.value} accessibilityLabel={`Quantity ${value}`}>
        {value}
      </Text>
      <Step icon="add" a11y="Increase quantity" disabled={disabled || value >= max} onPress={() => onChange(value + 1)} />
    </View>
  )
}

function Step({
  icon,
  a11y,
  disabled,
  onPress,
}: {
  icon: "add" | "remove"
  a11y: string
  disabled?: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 14, right: 14 }}
      style={({ pressed }) => [disabled && styles.off, pressed && styles.pressed]}>
      <Ionicons name={icon} size={12} color={colors.primary} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pill: {
    width: 114,
    height: 34,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: { fontFamily: fonts.body, fontSize: 16, lineHeight: 20, color: colors.text, textAlign: "center" },
  off: { opacity: 0.3 },
  pressed: { opacity: 0.6 },
})
