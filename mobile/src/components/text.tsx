import { Text as RNText, type TextProps } from "react-native"

import { colors, type as typeScale } from "@/constants/theme"

export type TextVariant = keyof typeof typeScale
export type TextTone = "default" | "strong" | "muted" | "charcoal" | "inverse" | "onInk" | "error" | "success" | "golf" | "midnight" | "tint"

const toneColor: Record<TextTone, string> = {
  default: colors.text,
  strong: colors.textStrong,
  muted: colors.textLight,
  charcoal: colors.text,
  inverse: colors.white,
  onInk: colors.onInk,
  error: colors.error,
  success: colors.green,
  golf: colors.green,
  midnight: colors.textStrong,
  tint: colors.onInk,
}

/**
 * Text in one of the spec's type roles (APP_SPEC v8 V8.2). The Eastside roles
 * (displayXl ... note) sit beside the v7 role names, which resolve to them.
 * Nothing renders under 11pt. A role that sets its own colour (eyebrow, price)
 * keeps it unless a tone other than "default" is passed.
 */
export function Text({ variant = "body", tone = "default", style, ...props }: TextProps & { variant?: TextVariant; tone?: TextTone }) {
  const role = typeScale[variant] as { color?: string }
  const color = tone === "default" && role.color ? role.color : toneColor[tone]
  return <RNText {...props} style={[typeScale[variant], { color }, style]} />
}
