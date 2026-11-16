import { StyleSheet, View } from "react-native"

import { colors, golf } from "@/constants/theme"

import { Text } from "./text"

/** A 3-step scale (APP_SPEC v5 §3; G.2.2 golf-green active segment). */
export function FitScale({
  label,
  value,
  steps,
  active,
  large = false,
  inverse = false,
}: {
  label: string
  value: string
  steps: [string, string, string]
  active: number
  large?: boolean
  /** On a golf-green band: white active segment and labels. */
  inverse?: boolean
}) {
  return (
    <View style={styles.wrap} accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.head}>
        <Text variant="label" tone={inverse ? "inverse" : "default"}>
          {label}
        </Text>
        <Text variant="meta" tone={inverse ? "tint" : "muted"}>
          {value}
        </Text>
      </View>
      <View style={styles.track}>
        {steps.map((s, i) => (
          <View
            key={s}
            style={[
              styles.segment,
              { height: large ? 12 : 7, borderRadius: large ? 6 : 4 },
              { backgroundColor: inverse ? "rgba(255,255,255,.25)" : colors.naturalWhite },
              i === active && { backgroundColor: inverse ? colors.white : golf.green },
            ]}
          />
        ))}
      </View>
      <View style={styles.steps}>
        {steps.map((s, i) => (
          <Text
            key={s}
            variant="badge"
            tone={inverse ? (i === active ? "inverse" : "tint") : i === active ? "default" : "muted"}
            style={styles.step}>
            {s}
          </Text>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  track: { flexDirection: "row", gap: 4 },
  segment: { flex: 1 },
  steps: { flexDirection: "row", justifyContent: "space-between" },
  step: { flex: 1, textAlign: "center" },
})
