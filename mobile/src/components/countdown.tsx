import { StyleSheet, View } from "react-native"

import { useNow } from "@/hooks/use-now"
import { countdownParts } from "@/lib/format"

import { Text } from "./text"

/**
 * DD : HH : MM : SS to a release's real `release_at` only (evidence rule G.1.5).
 * At zero it reads "Going live shortly" (a held release stays upcoming until
 * it passes its go/no-go checks).
 */
export function Countdown({ target, inverse = false, small = false }: { target: string | null; inverse?: boolean; small?: boolean }) {
  const now = useNow(1000)
  const parts = countdownParts(target, now)
  if (!parts) return null
  if (parts.done) {
    return (
      <Text variant="label" tone={inverse ? "inverse" : "default"}>
        Going live shortly
      </Text>
    )
  }
  const units: [number, string][] = [
    [parts.days, "Days"],
    [parts.hours, "Hrs"],
    [parts.minutes, "Min"],
    [parts.seconds, "Sec"],
  ]
  const digit = small ? styles.digitSmall : null
  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="timer"
      accessibilityLabel={`${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes to release`}>
      {units.map(([n, label], i) => (
        <View key={label} style={styles.unitWrap}>
          <View style={styles.unit}>
            <View style={[styles.cell, inverse && styles.cellInverse]}>
              <Text variant="countdown" tone={inverse ? "inverse" : "default"} style={digit}>
                {String(n).padStart(2, "0")}
              </Text>
            </View>
            <Text variant="badge" tone={inverse ? "inverse" : "charcoal"}>
              {label}
            </Text>
          </View>
          {i < units.length - 1 ? (
            <Text variant="countdown" tone={inverse ? "inverse" : "default"} style={[digit, styles.sep]}>
              :
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start" },
  unitWrap: { flexDirection: "row", alignItems: "flex-start" },
  unit: { alignItems: "center", gap: 6 },
  // measurements and countdowns sit in printed digit cells
  cell: { borderWidth: 2, borderColor: "#14213D", paddingHorizontal: 6, paddingTop: 6, paddingBottom: 2 },
  cellInverse: { borderColor: "#FFFFFF" },
  sep: { marginHorizontal: 4, marginTop: 8 },
  digitSmall: { fontSize: 28, lineHeight: 30 },
})
