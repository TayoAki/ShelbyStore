import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"

import { colors, radius, spacing } from "@/constants/theme"

import { Text } from "./text"

type Variant = "primary" | "secondary" | "accent" | "ghost"

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  size = "md",
  style,
  accessibilityLabel,
}: {
  title: string
  onPress?: () => void
  variant?: Variant
  loading?: boolean
  disabled?: boolean
  size?: "sm" | "md"
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
}) {
  const inactive = disabled || loading
  const palette = {
    primary: { bg: colors.text, fg: colors.textInverse, border: colors.text },
    accent: { bg: colors.accent, fg: colors.textInverse, border: colors.accent },
    secondary: { bg: "transparent", fg: colors.text, border: colors.text },
    ghost: { bg: "transparent", fg: colors.text, border: "transparent" },
  }[variant]

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={inactive ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        size === "sm" ? styles.sm : styles.md,
        { backgroundColor: palette.bg, borderColor: palette.border },
        inactive && styles.inactive,
        pressed && !inactive && styles.pressed,
        style,
      ]}>
      <View style={styles.row}>
        {loading ? <ActivityIndicator size="small" color={palette.fg} /> : null}
        <Text variant={size === "sm" ? "small" : "bodyStrong"} style={{ color: palette.fg, fontWeight: "600" }}>
          {title}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  md: { minHeight: 50, paddingHorizontal: spacing.xl },
  sm: { minHeight: 36, paddingHorizontal: spacing.lg },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  inactive: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
})
