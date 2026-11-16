import { Pressable, ScrollView, StyleSheet, View } from "react-native"

import { colors, type } from "@/constants/theme"

import { usePanelInk } from "./box"
import { Text } from "./text"

/**
 * Printed tabs (APP_SPEC v7 §3), the way a box prints its index on a panel
 * edge: semi-condensed caps, the active tab underlined with a 3pt rule in the
 * face's ink. Every tab is a 44pt target.
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
  /** On an inked face: print in white. */
  inverse?: boolean
}) {
  const ink = usePanelInk()
  const line = inverse ? colors.paper : ink.ink
  const row = (
    <View style={[styles.row, { borderBottomColor: line }]} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[styles.tab, { borderBottomColor: active ? line : "transparent" }]}>
            <Text style={[type.tab, { color: line, opacity: active ? 1 : 0.72 }]}>{o.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
  if (!scroll) return row
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {row}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignSelf: "flex-start", gap: 20, borderBottomWidth: 1 },
  tab: { minHeight: 44, minWidth: 44, alignItems: "center", justifyContent: "center", borderBottomWidth: 3, marginBottom: -1 },
})
