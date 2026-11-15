import { Platform } from "react-native"

/**
 * Shelby brand tokens. Light, editorial, one accent.
 * The accent is reserved for drop moments (live badges, countdowns) so it keeps meaning.
 */
export const colors = {
  background: "#F6F3EE",
  surface: "#FFFFFF",
  surfaceAlt: "#ECE7DF",
  border: "#DDD6CB",
  text: "#141414",
  textMuted: "#6B665E",
  textInverse: "#FFFFFF",
  accent: "#B4532A",
  accentSoft: "#F3E2D8",
  success: "#2F6B3F",
  danger: "#A3271F",
  overlay: "rgba(20, 20, 20, 0.45)",
} as const

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const

export const radius = {
  sm: 4,
  md: 8,
  lg: 14,
  pill: 999,
} as const

export const fonts = {
  sans: Platform.select({ ios: "System", android: "sans-serif", default: "system-ui" }),
  serif: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" }),
}

export const type = {
  display: { fontSize: 34, lineHeight: 38, fontWeight: "700" as const, letterSpacing: -0.8 },
  title: { fontSize: 24, lineHeight: 29, fontWeight: "700" as const, letterSpacing: -0.4 },
  heading: { fontSize: 18, lineHeight: 23, fontWeight: "600" as const, letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "400" as const },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: "600" as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const },
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700" as const,
    letterSpacing: 1.6,
    textTransform: "uppercase" as const,
  },
  quote: { fontSize: 20, lineHeight: 27, fontWeight: "400" as const, fontStyle: "italic" as const },
}

export const MAX_CONTENT_WIDTH = 720
