import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"

import { colors, fonts, radius } from "@/constants/theme"

import { Text } from "./text"

/**
 * Melin's pill segmented control (APP_SPEC §3). Default: 43pt, 1pt #EEEEEE,
 * active tab a black pill. `compact` is the drops tab switch: 28pt on #EDEDED,
 * active tab a white pill with a 1pt black border.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  compact = false,
  style,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  compact?: boolean
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View accessibilityRole="tablist" style={[compact ? styles.trackCompact : styles.track, style]}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[
              compact ? styles.tabCompact : styles.tab,
              active && (compact ? styles.activeCompact : styles.active),
            ]}>
            <Text style={[compact ? styles.labelCompact : styles.label, active && !compact && styles.labelOn]}>
              {o.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    height: 43,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.pill,
    padding: 1,
    flexDirection: "row",
  },
  tab: { flex: 1, height: 39, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  active: { backgroundColor: colors.primary },
  label: { fontFamily: fonts.body, fontSize: 13, lineHeight: 13, textTransform: "capitalize", color: colors.textTab },
  labelOn: { color: colors.textInverse },
  trackCompact: {
    width: 240,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.mega,
    flexDirection: "row",
    alignSelf: "center",
  },
  tabCompact: {
    flex: 1,
    height: 28,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeCompact: { backgroundColor: colors.secondary, borderColor: colors.primary },
  labelCompact: { fontFamily: fonts.body, fontSize: 12, lineHeight: 14, textTransform: "capitalize", color: colors.text },
})
