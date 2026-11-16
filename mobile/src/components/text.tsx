import { Text as RNText, type TextProps } from "react-native"

import { colors, type as typeScale } from "@/constants/theme"

export type TextVariant = keyof typeof typeScale
export type TextTone = "default" | "muted" | "charcoal" | "inverse" | "error" | "success" | "golf" | "midnight" | "tint"

const toneColor: Record<TextTone, string> = {
  default: colors.black,
  muted: colors.muted,
  charcoal: colors.charcoal,
  inverse: colors.white,
  error: colors.red,
  success: colors.green,
  golf: colors.pine,
  midnight: colors.ink,
  tint: colors.pineInk,
}

/** Text in one of the spec's type roles (APP_SPEC v7 §2). Sofia Sans widths carry the weight; nothing under 11pt. */
export function Text({ variant = "body", tone = "default", style, ...props }: TextProps & { variant?: TextVariant; tone?: TextTone }) {
  return <RNText {...props} style={[typeScale[variant], { color: toneColor[tone] }, style]} />
}
