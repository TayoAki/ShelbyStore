import Ionicons from "@expo/vector-icons/Ionicons"
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native"
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

import { colors, dur, ease, motion, type } from "@/constants/theme"

import { usePanelInk } from "./box"
import { Text } from "./text"

export type ButtonVariant = "primary" | "secondary" | "outlineBlack" | "outlineWhite" | "icon" | "link" | "ink"
export type ButtonSize = "small" | "default" | "large" | "atc"

type IconName = React.ComponentProps<typeof Ionicons>["name"]
type Palette = { rest: [string, string, string]; pressed: [string, string, string] }

const PALETTE: Record<Exclude<ButtonVariant, "link" | "icon" | "ink">, Palette> = {
  primary: { rest: [colors.paper, colors.ink, colors.ink], pressed: [colors.ink, colors.ink, colors.paper] },
  secondary: { rest: [colors.ink, colors.ink, colors.paper], pressed: [colors.neutral800, colors.neutral800, colors.paper] },
  outlineBlack: { rest: ["rgba(20,33,61,0)", colors.ink, colors.ink], pressed: [colors.ink, colors.ink, colors.paper] },
  outlineWhite: { rest: ["rgba(255,255,255,0)", colors.paper, colors.paper], pressed: [colors.paper, colors.paper, colors.ink] },
}

/** Touch targets: every printed block is at least 44pt tall (48pt for the default). */
const HEIGHT: Record<ButtonSize, number> = { small: 44, default: 48, large: 52, atc: 56 }
const PAD: Record<ButtonSize, number> = { small: 14, default: 18, large: 20, atc: 20 }

/**
 * Printed ink blocks (APP_SPEC v7 §3): square-cut board, a 2pt keyline, a
 * semi-condensed caps label. Press darkens the block over 180ms; no shadows.
 * `ink` prints in the colours of the panel it sits on (white knock-out on a
 * navy face, navy on a white one). `link` is an underlined label in the ink.
 */
export function Button({
  title,
  onPress,
  variant = "secondary",
  size = "default",
  loading = false,
  disabled = false,
  icon,
  style,
  accessibilityLabel,
  inverse = false,
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
  /** Links and icons on a dark face render white. */
  inverse?: boolean
}) {
  const ink = usePanelInk()
  const inactive = disabled || loading
  const pressed = useSharedValue(0)
  const pal: Palette =
    variant === "ink"
      ? { rest: [ink.ink, ink.ink, ink.panel], pressed: [ink.panel, ink.ink, ink.ink] }
      : PALETTE[variant === "link" || variant === "icon" ? "outlineBlack" : variant]
  const animated = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(pressed.value, [0, 1], [pal.rest[0], pal.pressed[0]]),
    borderColor: interpolateColor(pressed.value, [0, 1], [pal.rest[1], pal.pressed[1]]),
  }))
  const labelStyle = useAnimatedStyle(() => ({ color: interpolateColor(pressed.value, [0, 1], [pal.rest[2], pal.pressed[2]]) }))
  const press = (to: number) => {
    pressed.set(withTiming(to, { duration: dur.button, easing: ease.box, reduceMotion: motion.reduceMotion }))
  }
  const common = {
    accessibilityRole: "button" as const,
    accessibilityLabel: accessibilityLabel ?? title,
    accessibilityState: { disabled: inactive, busy: loading },
    onPress: inactive ? undefined : onPress,
  }

  if (variant === "link") {
    return (
      <Pressable {...common} hitSlop={12} style={({ pressed: p }) => [styles.bare, p && { opacity: 0.6 }, style]}>
        <Text variant="meta" style={[styles.link, { color: inverse ? colors.paper : ink.ink }]}>
          {title}
        </Text>
      </Pressable>
    )
  }

  if (variant === "icon") {
    const line = inverse ? colors.paper : ink.ink
    return (
      <Pressable
        {...common}
        style={({ pressed: p }) => [
          styles.icon,
          { backgroundColor: p ? line : "transparent", borderColor: line },
          inactive && { opacity: 0.5 },
          style,
        ]}>
        {({ pressed: p }) => (icon ? <Ionicons name={icon} size={18} color={p ? (inverse ? colors.ink : ink.panel) : line} /> : null)}
      </Pressable>
    )
  }

  const disabledLook = disabled && !loading
  return (
    <Pressable
      {...common}
      onPressIn={() => !inactive && press(1)}
      onPressOut={() => press(0)}
      style={[size === "atc" && styles.block, style]}>
      <Animated.View
        style={[styles.box, { minHeight: HEIGHT[size], paddingHorizontal: PAD[size] }, animated, disabledLook && styles.disabled]}>
        {loading ? (
          <ActivityIndicator size="small" color={pal.rest[2]} />
        ) : (
          <>
            {icon ? <Ionicons name={icon} size={18} color={disabledLook ? colors.gray400 : pal.rest[2]} /> : null}
            <Animated.Text
              numberOfLines={1}
              style={[
                size === "large" || size === "atc" ? type.buttonLarge : type.button,
                labelStyle,
                disabledLook && { color: colors.gray400 },
              ]}>
              {title}
            </Animated.Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  bare: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center" },
  link: { textDecorationLine: "underline" },
  block: { alignSelf: "stretch" },
  box: { borderWidth: 2, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  disabled: { backgroundColor: colors.wash, borderColor: colors.stroke },
  icon: { width: 44, height: 44, borderWidth: 2, alignItems: "center", justifyContent: "center" },
})
