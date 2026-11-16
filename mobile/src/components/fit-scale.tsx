import { StyleSheet, View } from "react-native"

import { colors, fonts, radius } from "@/constants/theme"

import { Text } from "./text"

/**
 * A 3-step fit scale (APP_SPEC §3): UPPERCASE label, a 6pt #EDEDED track with
 * a black third at the active step, and the step names under it.
 */
export function FitScale({ label, steps, active }: { label: string; steps: string[]; active: number }) {
  return (
    <View accessibilityLabel={`${label}: ${steps[active] ?? ""}`}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { left: `${(active / steps.length) * 100}%`, width: `${100 / steps.length}%` }]} />
      </View>
      <View style={styles.steps}>
        {steps.map((s, i) => (
          <Text key={s} style={[styles.step, i === active && styles.stepOn]}>
            {s}
          </Text>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19.5,
    letterSpacing: 0.65,
    textTransform: "uppercase",
    color: colors.text,
    marginBottom: 8,
  },
  track: { height: 6, borderRadius: radius.pill, backgroundColor: colors.mega, overflow: "hidden" },
  fill: { position: "absolute", top: 0, bottom: 0, borderRadius: radius.pill, backgroundColor: colors.primary },
  steps: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  step: { fontFamily: fonts.system, fontSize: 14, lineHeight: 20, textTransform: "uppercase", color: colors.textSteps },
  stepOn: { color: colors.text },
})
