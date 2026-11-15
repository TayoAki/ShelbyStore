import { StyleSheet, View } from "react-native"

import { colors, radius, spacing } from "@/constants/theme"
import type { ReleasePhase } from "@/lib/types"

import { Text } from "./text"

const labels: Record<ReleasePhase, string> = { live: "Live now", upcoming: "Coming up", past: "Dropped" }

export function PhaseBadge({ phase, onImage = false }: { phase: ReleasePhase; onImage?: boolean }) {
  const style =
    phase === "live"
      ? { backgroundColor: colors.accent, borderColor: colors.accent, color: colors.textInverse }
      : phase === "upcoming"
        ? {
            backgroundColor: onImage ? colors.surface : "transparent",
            borderColor: colors.text,
            color: colors.text,
          }
        : { backgroundColor: colors.surfaceAlt, borderColor: colors.surfaceAlt, color: colors.textMuted }
  return (
    <View style={[styles.badge, { backgroundColor: style.backgroundColor, borderColor: style.borderColor }]}>
      {phase === "live" ? <View style={styles.dot} /> : null}
      <Text variant="eyebrow" style={{ color: style.color }}>
        {labels[phase]}
      </Text>
    </View>
  )
}

export function Tag({ label, tone = "default" }: { label: string; tone?: "default" | "accent" }) {
  return (
    <View
      style={[
        styles.badge,
        tone === "accent"
          ? { backgroundColor: colors.accentSoft, borderColor: colors.accentSoft }
          : { backgroundColor: colors.surface, borderColor: colors.border },
      ]}>
      <Text variant="eyebrow" tone={tone === "accent" ? "accent" : "default"}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textInverse },
})
