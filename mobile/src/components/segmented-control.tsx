import { Pressable, ScrollView, StyleSheet, View } from "react-native"

import { colors, golf, radius, type } from "@/constants/theme"

import { Text } from "./text"

/**
 * Allbirds' pill segmented control (APP_SPEC v5 §3) with the golf-green
 * active segment (G.2.2): white label on #1E3B2F.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  scroll = false,
  inverse = false,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  scroll?: boolean
  /** On a golf-green band: white outline and labels, white active segment. */
  inverse?: boolean
}) {
  const row = (
    <View style={[styles.pill, inverse && { borderColor: colors.white }]} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, active && (inverse ? styles.activeInverse : styles.active)]}>
            <Text
              style={[
                type.button,
                { fontSize: 11, color: inverse ? (active ? golf.green : colors.white) : active ? colors.white : colors.black },
              ]}>
              {o.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
  if (!scroll) return row
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 0 }}>
      {row}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: radius.full,
    padding: 4,
    gap: 4,
  },
  segment: {
    height: 33,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  active: { backgroundColor: golf.green },
  activeInverse: { backgroundColor: colors.white },
})
