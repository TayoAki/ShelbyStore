import Ionicons from "@expo/vector-icons/Ionicons"
import { useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native"
import Animated from "react-native-reanimated"

import { colors, radius, type } from "@/constants/theme"
import { usePressSweep } from "@/lib/motion"

import { Text } from "./text"

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "black"
  | "white"
  | "outline"
  | "outlineWhite"
  | "kit"
  | "sticky"
  | "link"
  | "icon"
  // v7 names kept so older call sites compile
  | "outlineBlack"
  | "ink"
export type ButtonSize = "small" | "default" | "large" | "atc"

type IconName = React.ComponentProps<typeof Ionicons>["name"]
type Look = { fill: string; border: string; text: string; pressed: string; height: number; corner: number; label: TextStyle }

const LOOK: Record<Exclude<ButtonVariant, "link" | "icon" | "outlineBlack" | "ink">, Look> = {
  primary: { fill: colors.green, border: colors.green, text: colors.white, pressed: colors.greenPressed, height: 52, corner: radius.button, label: type.btnAtc },
  secondary: { fill: colors.text, border: colors.text, text: colors.white, pressed: colors.charcoalPressed, height: 48, corner: radius.button, label: type.btn },
  black: { fill: colors.ink, border: colors.ink, text: colors.white, pressed: colors.blackPressed, height: 50, corner: radius.button, label: type.btn },
  white: { fill: colors.white, border: colors.white, text: colors.textStrong, pressed: colors.bgBrighter, height: 44, corner: radius.button, label: type.btn },
  outline: { fill: "transparent", border: colors.text, text: colors.text, pressed: "rgba(33, 33, 33, 0.1)", height: 44, corner: radius.button, label: type.btn },
  outlineWhite: { fill: "transparent", border: colors.white, text: colors.white, pressed: "rgba(255, 255, 255, 0.1)", height: 40, corner: radius.button, label: type.btn },
  kit: { fill: colors.white, border: colors.text, text: colors.textStrong, pressed: colors.bgBrighter, height: 38, corner: radius.button, label: type.btnKit },
  sticky: { fill: colors.green, border: colors.green, text: colors.white, pressed: colors.greenPressed, height: 47, corner: radius.tab, label: type.btnSticky },
}

const resolve = (v: ButtonVariant): keyof typeof LOOK | "link" | "icon" =>
  v === "outlineBlack" ? "outline" : v === "ink" ? "secondary" : v

/**
 * Eastside buttons (APP_SPEC v8 V8.3): 3pt corners (4pt on the sticky bar),
 * Title Case labels, no shadows. Press runs the M1 sweep, a skewed overlay in
 * the pressed colour; under Reduce Motion the fill switches at once instead.
 * Short variants (white small, outline white, kit) keep a 44pt hit area.
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
  /** Links and icons on a dark band render white. */
  inverse?: boolean
}) {
  const v = resolve(variant)
  const inactive = disabled || loading
  const [width, setWidth] = useState(320)
  const sweep = usePressSweep(width)
  const [down, setDown] = useState(false)
  const common = {
    accessibilityRole: "button" as const,
    accessibilityLabel: accessibilityLabel ?? title,
    accessibilityState: { disabled: inactive, busy: loading },
    onPress: inactive ? undefined : onPress,
  }

  if (v === "link") {
    return (
      <Pressable {...common} hitSlop={12} style={({ pressed: p }) => [styles.bare, style]}>
        {({ pressed: p }) => (
          <Text
            variant="meta"
            style={[styles.link, { color: inverse ? (p ? colors.onInkPressed : colors.onInk) : p ? colors.linkPressed : colors.text }]}>
            {title}
          </Text>
        )}
      </Pressable>
    )
  }

  if (v === "icon") {
    const line = inverse ? colors.white : colors.text
    return (
      <Pressable {...common} style={({ pressed: p }) => [styles.icon, p && { opacity: 0.7 }, inactive && { opacity: 0.5 }, style]}>
        {icon ? <Ionicons name={icon} size={20} color={line} /> : null}
      </Pressable>
    )
  }

  const look = LOOK[v]
  const small = size === "small" && (v === "white" || v === "outline" || v === "black")
  const height = small ? 33 : look.height
  const label = small ? type.btnSm : look.label
  const hitSlop = height < 44 ? { top: (44 - height) / 2, bottom: (44 - height) / 2 } : undefined
  const pressedFill = sweep.reduce && down

  return (
    <Pressable
      {...common}
      hitSlop={hitSlop}
      onPressIn={() => {
        if (inactive) return
        setDown(true)
        sweep.pressIn()
      }}
      onPressOut={() => {
        setDown(false)
        sweep.pressOut()
      }}
      style={[v === "primary" || v === "sticky" || size === "atc" || size === "large" ? styles.block : null, style]}>
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={[
          styles.box,
          {
            minHeight: height,
            borderRadius: look.corner,
            backgroundColor: pressedFill ? look.pressed : look.fill,
            borderColor: look.border,
          },
          disabled && !loading && styles.disabled,
        ]}>
        {!sweep.reduce ? (
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { width: sweep.overlayWidth, backgroundColor: look.pressed }, sweep.style]}
          />
        ) : null}
        {loading ? <ActivityIndicator size="small" color={look.text} /> : null}
        {icon && !loading ? <Ionicons name={icon} size={18} color={look.text} /> : null}
        <Text numberOfLines={1} style={[label, styles.label, { color: look.text }]}>
          {title}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  bare: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center" },
  link: { textDecorationLine: "underline" },
  block: { alignSelf: "stretch" },
  box: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  label: { textTransform: "capitalize" },
  disabled: { opacity: 0.5 },
  icon: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
})
