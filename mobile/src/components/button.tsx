import Ionicons from "@expo/vector-icons/Ionicons"
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native"
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

import { colors, dur, ease, golf, motion, radius, type } from "@/constants/theme"

import { Text } from "./text"

export type ButtonVariant = "primary" | "secondary" | "outlineBlack" | "outlineWhite" | "icon" | "link"
export type ButtonSize = "small" | "default" | "large" | "atc"

type IconName = React.ComponentProps<typeof Ionicons>["name"]

/** [fill, border, label] at rest and pressed (APP_SPEC v5 §3; M11). */
const PALETTE: Record<Exclude<ButtonVariant, "link" | "icon">, { rest: [string, string, string]; pressed: [string, string, string] }> = {
  primary: { rest: [colors.white, colors.white, colors.black], pressed: [colors.black, colors.black, colors.white] },
  secondary: { rest: [colors.black, colors.black, colors.white], pressed: [colors.muted, colors.muted, colors.white] },
  outlineBlack: { rest: ["rgba(33,33,33,0)", colors.black, colors.black], pressed: [colors.black, colors.black, colors.white] },
  outlineWhite: { rest: ["rgba(255,255,255,0)", colors.white, colors.white], pressed: [colors.white, colors.white, colors.black] },
}

const HEIGHT: Record<ButtonSize, number> = { small: 33, default: 33, large: 42, atc: 49 }
const PAD: Record<ButtonSize, number> = { small: 12, default: 16, large: 14, atc: 16 }

/**
 * Allbirds' pill buttons (radius 9999): colours change on press over 200ms
 * sine.in-out. `link` is golf green and underlined (G.2.2).
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
  /** Links on a dark or golf-green band render white. */
  inverse?: boolean
}) {
  const inactive = disabled || loading
  const pressed = useSharedValue(0)
  const kind = variant === "link" || variant === "icon" ? "outlineBlack" : variant
  const pal = PALETTE[kind]
  const animated = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(pressed.value, [0, 1], [pal.rest[0], pal.pressed[0]]),
    borderColor: interpolateColor(pressed.value, [0, 1], [pal.rest[1], pal.pressed[1]]),
  }))
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(pressed.value, [0, 1], [pal.rest[2], pal.pressed[2]]),
  }))
  const press = (to: number) => {
    pressed.set(withTiming(to, { duration: dur.button, easing: ease.sineInOut, reduceMotion: motion.reduceMotion }))
  }
  const common = {
    accessibilityRole: "button" as const,
    accessibilityLabel: accessibilityLabel ?? title,
    accessibilityState: { disabled: inactive, busy: loading },
    onPress: inactive ? undefined : onPress,
  }

  if (variant === "link") {
    return (
      <Pressable {...common} hitSlop={10} style={({ pressed: p }) => [styles.bare, p && { opacity: 0.6 }, style]}>
        <Text variant="meta" style={[styles.link, { color: inverse ? colors.white : golf.green }]}>
          {title}
        </Text>
      </Pressable>
    )
  }

  if (variant === "icon") {
    return (
      <Pressable
        {...common}
        style={({ pressed: p }) => [
          styles.icon,
          { backgroundColor: p ? colors.black : "transparent", borderColor: inverse ? colors.white : colors.black },
          inactive && { opacity: 0.5 },
          style,
        ]}>
        {({ pressed: p }) =>
          icon ? <Ionicons name={icon} size={16} color={p ? colors.white : inverse ? colors.white : colors.black} /> : null
        }
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
        style={[
          styles.box,
          { height: HEIGHT[size], paddingHorizontal: PAD[size] },
          animated,
          disabledLook && styles.disabled,
        ]}>
        {loading ? (
          <ActivityIndicator size="small" color={pal.rest[2]} />
        ) : (
          <>
            {icon ? <Ionicons name={icon} size={16} color={disabledLook ? colors.gray400 : pal.rest[2]} /> : null}
            <Animated.Text
              numberOfLines={1}
              style={[
                size === "large" ? type.buttonLarge : type.button,
                size === "small" && { fontSize: 11 },
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
  bare: { alignSelf: "flex-start" },
  link: { textDecorationLine: "underline" },
  block: { alignSelf: "stretch" },
  box: {
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  disabled: { backgroundColor: colors.gray200, borderColor: colors.gray300 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
})
