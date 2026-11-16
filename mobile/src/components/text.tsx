import { Text as RNText, type TextProps } from "react-native"

import { colors, type as typeScale } from "@/constants/theme"

export type TextVariant = keyof typeof typeScale
export type TextTone = "default" | "muted" | "mutedCard" | "mutedSub" | "inverse" | "error" | "success"

const toneColor: Record<TextTone, string> = {
  default: colors.text,
  muted: colors.textMuted,
  mutedCard: colors.textMutedCard,
  mutedSub: colors.textMutedSub,
  inverse: colors.textInverse,
  error: colors.error,
  success: colors.inStock,
}

/** Text in one of the spec's type styles (APP_SPEC §2). Families carry the weight; never set fontWeight. */
export function Text({
  variant = "body",
  tone = "default",
  style,
  ...props
}: TextProps & { variant?: TextVariant; tone?: TextTone }) {
  return <RNText {...props} style={[typeScale[variant], { color: toneColor[tone] }, style]} />
}
