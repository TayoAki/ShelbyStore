import { Pressable, StyleSheet, View } from "react-native"

import { colors, radius, spacing } from "@/constants/theme"

import { Text } from "./text"

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
    <View style={styles.row}>
      <StepButton label="−" a11y="Decrease quantity" disabled={disabled || value <= min} onPress={() => onChange(value - 1)} />
      <Text variant="bodyStrong" style={styles.value} accessibilityLabel={`Quantity ${value}`}>
        {value}
      </Text>
      <StepButton label="+" a11y="Increase quantity" disabled={disabled || value >= max} onPress={() => onChange(value + 1)} />
    </View>
  )
}

function StepButton({ label, a11y, disabled, onPress }: { label: string; a11y: string; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && styles.pressed]}>
      <Text variant="heading">{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  button: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  value: { minWidth: 28, textAlign: "center" },
  disabled: { opacity: 0.3 },
  pressed: { opacity: 0.6 },
})
