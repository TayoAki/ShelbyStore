import Ionicons from "@expo/vector-icons/Ionicons"
import { useEffect } from "react"
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

import { colors, fonts, radius, type } from "@/constants/theme"

import { Text } from "./text"

export type ButtonVariant = "primary" | "light" | "highlight" | "link" | "micro" | "action"
export type ButtonSize = "default" | "atc" | "checkout" | "large" | "hero" | "small"

type IconName = React.ComponentProps<typeof Ionicons>["name"]

const AnimatedView = Animated.createAnimatedComponent(View)

/**
 * Melin's button system (APP_SPEC §3): 39pt boxes with a 3pt radius and an
 * UPPERCASE 14pt label tracked 1.3. `light` and `highlight` fill on press
 * (the native stand-in for Melin's ink-fill hover).
 */
export function Button({
  title,
  onPress,
  variant = "primary",
  size = "default",
  loading = false,
  disabled = false,
  icon,
  style,
  accessibilityLabel,
}: {
  title: string
  onPress?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  icon?: IconName
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
}) {
  const inactive = disabled || loading
  const common = {
    accessibilityRole: "button" as const,
    accessibilityLabel: accessibilityLabel ?? title,
    accessibilityState: { disabled: inactive, busy: loading },
    onPress: inactive ? undefined : onPress,
  }

  if (variant === "link" || variant === "micro") {
    return (
      <Pressable {...common} hitSlop={10} style={({ pressed }) => [styles.bare, pressed && { opacity: 0.6 }, style]}>
        <Text variant={variant === "link" ? "link" : "micro"} style={variant === "micro" ? styles.micro : undefined}>
          {title}
        </Text>
      </Pressable>
    )
  }

  if (variant === "action") {
    return (
      <Pressable {...common} style={({ pressed }) => [styles.action, pressed && { backgroundColor: colors.tile }, style]}>
        {icon ? <Ionicons name={icon} size={14} color={colors.text} /> : null}
        <Text variant="micro" style={styles.actionLabel}>
          {title}
        </Text>
      </Pressable>
    )
  }

  return <BoxButton {...{ title, variant, size, loading, inactive, style }} common={common} />
}

function BoxButton({
  title,
  variant,
  size,
  loading,
  inactive,
  style,
  common,
}: {
  title: string
  variant: "primary" | "light" | "highlight"
  size: ButtonSize
  loading: boolean
  inactive: boolean
  style?: StyleProp<ViewStyle>
  common: object
}) {
  const fill = useSharedValue(0)
  const ink = variant === "highlight" ? colors.secondary : colors.primary
  const rest = variant === "primary" ? colors.primary : "rgba(0,0,0,0)"
  const restLabel = variant === "primary" ? colors.textInverse : variant === "highlight" ? colors.textInverse : colors.text
  const pressedLabel = variant === "highlight" ? colors.text : colors.textInverse

  useEffect(() => {
    if (inactive) fill.set(0)
  }, [inactive, fill])

  const animated = useAnimatedStyle(() =>
    variant === "primary"
      ? { opacity: 1 - fill.get() * 0.15 }
      : { backgroundColor: interpolateColor(fill.get(), [0, 1], [rest, ink]) }
  )
  const label = useAnimatedStyle(() =>
    variant === "primary" ? {} : { color: interpolateColor(fill.get(), [0, 1], [restLabel, pressedLabel]) }
  )

  const box = sizeBox[size]
  return (
    <Pressable
      {...common}
      onPressIn={() => fill.set(withTiming(1, { duration: variant === "primary" ? 100 : 250 }))}
      onPressOut={() => fill.set(withTiming(0, { duration: 250 }))}
      style={[inactive && styles.disabled, style]}>
      <AnimatedView
        style={[
          styles.box,
          box,
          { borderColor: variant === "primary" ? colors.primary : ink, backgroundColor: rest },
          animated,
        ]}>
        {loading ? (
          <ActivityIndicator size="small" color={restLabel} />
        ) : (
          <Animated.Text
            numberOfLines={1}
            style={[type.button, size === "hero" || size === "small" ? styles.labelSmall : null, { color: restLabel }, label]}>
            {title}
          </Animated.Text>
        )}
      </AnimatedView>
    </Pressable>
  )
}

const sizeBox: Record<ButtonSize, ViewStyle> = {
  default: { height: 39, paddingHorizontal: 18 },
  large: { height: 39, paddingHorizontal: 18 },
  atc: { height: 52, paddingHorizontal: 18 },
  checkout: { height: 52, paddingHorizontal: 18, borderRadius: radius.none },
  hero: { height: 28, paddingHorizontal: 12, borderWidth: 1.5 },
  small: { height: 30, paddingHorizontal: 12 },
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: radius.button,
    alignItems: "center",
    justifyContent: "center",
  },
  labelSmall: { fontSize: 11, lineHeight: 16.5, letterSpacing: 1.6 },
  disabled: { opacity: 0.2 },
  bare: { alignSelf: "flex-start" },
  micro: { textDecorationLine: "underline", textTransform: "capitalize" },
  action: {
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  actionLabel: { fontFamily: fonts.body },
})
