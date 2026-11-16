import { StyleSheet, View } from "react-native"

import { colors, fonts } from "@/constants/theme"
import { useNow } from "@/hooks/use-now"
import { countdownParts } from "@/lib/format"

import { Text } from "./text"

/**
 * Countdown to a real release_at (APP_SPEC §5.9): tabular digits with
 * DAYS · HRS · MIN · SEC labels; "Going live shortly" at zero.
 */
export function Countdown({
  releaseAt,
  large = false,
  inverse = false,
}: {
  releaseAt: string | null
  large?: boolean
  inverse?: boolean
}) {
  const now = useNow(1000)
  const parts = countdownParts(releaseAt, now)
  if (!parts) return null
  const ink = inverse ? colors.textInverse : colors.text
  if (parts.done) {
    return <Text style={[styles.done, { color: ink }]}>Going live shortly</Text>
  }
  const pad = (n: number) => String(n).padStart(2, "0")
  const units: [string, string][] = [
    [String(parts.days), "Days"],
    [pad(parts.hours), "Hrs"],
    [pad(parts.minutes), "Min"],
    [pad(parts.seconds), "Sec"],
  ]
  const digit = [styles.digit, large && styles.digitLarge, { color: ink }]
  return (
    <View
      style={styles.row}
      accessibilityLabel={`${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes until release`}>
      {units.map(([n, label], i) => (
        <View key={label} style={styles.row}>
          {i > 0 ? <Text style={digit}> : </Text> : null}
          <View style={styles.unit}>
            <Text style={digit}>{n}</Text>
            <Text style={[styles.label, inverse && styles.labelInverse]}>{label}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start" },
  unit: { alignItems: "center" },
  digit: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 26, fontVariant: ["tabular-nums"] },
  digitLarge: { fontSize: 34, lineHeight: 38 },
  label: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  labelInverse: { color: "rgba(255,255,255,0.8)" },
  done: { fontFamily: fonts.heading, fontSize: 14, lineHeight: 21 },
})
