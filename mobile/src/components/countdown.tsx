import { StyleSheet, View } from "react-native"

import { useNow } from "@/hooks/use-now"
import { countdownParts } from "@/lib/format"

import { Text } from "./text"

/**
 * DD : HH : MM : SS to a release's real `release_at` only (evidence rule G.1.5),
 * set in Montserrat 700 26 tabular (APP_SPEC v8 V8.3), or `countdownSm` in a
 * line. At zero it reads "Going live shortly" (a held release stays upcoming
 * until it passes its go/no-go checks).
 */
export function Countdown({ target, inverse = false, small = false }: { target: string | null; inverse?: boolean; small?: boolean }) {
  const now = useNow(1000)
  const parts = countdownParts(target, now)
  if (!parts) return null
  const tone = inverse ? "onInk" : "default"
  if (parts.done) {
    return (
      <Text variant="labelCaps" tone={tone}>
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
  const label = `${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes to release`
  if (small) {
    return (
      <Text variant="countdownSm" tone={tone} accessibilityRole="timer" accessibilityLabel={label}>
        {units.map(([n, l]) => `${String(n).padStart(2, "0")} ${l}`).join(" · ")}
      </Text>
    )
  }
  return (
    <View style={styles.row} accessible accessibilityRole="timer" accessibilityLabel={label}>
      {units.map(([n, l], i) => (
        <View key={l} style={styles.unitWrap}>
          <View style={styles.unit}>
            <Text variant="countdown" tone={tone}>
              {String(n).padStart(2, "0")}
            </Text>
            <Text variant="micro" tone={inverse ? "onInk" : "muted"}>
              {l}
            </Text>
          </View>
          {i < units.length - 1 ? (
            <Text variant="countdown" tone={tone} style={styles.sep}>
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
  unit: { alignItems: "center", gap: 2 },
  sep: { marginHorizontal: 6 },
})
