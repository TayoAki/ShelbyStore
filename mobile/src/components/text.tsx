import { Text as RNText, type TextProps } from "react-native"

import { colors, type as typeScale } from "@/constants/theme"

type Variant = keyof typeof typeScale
type Tone = "default" | "muted" | "accent" | "inverse" | "danger" | "success"

const toneColor: Record<Tone, string> = {
  default: colors.text,
  muted: colors.textMuted,
  accent: colors.accent,
  inverse: colors.textInverse,
  danger: colors.danger,
  success: colors.success,
}

export function Text({
  variant = "body",
  tone = "default",
  style,
  ...props
}: TextProps & { variant?: Variant; tone?: Tone }) {
  return <RNText {...props} style={[typeScale[variant], { color: toneColor[tone] }, style]} />
}
