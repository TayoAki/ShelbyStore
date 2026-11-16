import { Pressable, ScrollView, StyleSheet, View } from "react-native"
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated"

import { colors, dur, ease, motion, radius, type } from "@/constants/theme"
import { confirmHaptic } from "@/lib/haptics"

/**
 * Eastside's tabs (APP_SPEC v8 V8.3, M16): bordered 1pt #212121, radius 4,
 * padding 4/16, 44pt targets; the active tab fills #141414 with white bold
 * text over 200ms. The row scrolls sideways at an 8pt gap.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  scroll = true,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  scroll?: boolean
  /** Kept for older call sites; tabs always print on white. */
  inverse?: boolean
}) {
  const row = (
    <View style={styles.row} accessibilityRole="tablist">
      {options.map((o) => (
        <Tab
          key={o.value}
          label={o.label}
          active={o.value === value}
          onPress={() => {
            if (o.value !== value) confirmHaptic()
            onChange(o.value)
          }}
        />
      ))}
    </View>
  )
  if (!scroll) return row
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {row}
    </ScrollView>
  )
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const on = useDerivedValue(() => withTiming(active ? 1 : 0, { duration: dur.tab, easing: ease.out, reduceMotion: motion.reduceMotion }), [active])
  const fill = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(on.value, [0, 1], ["rgba(20,20,20,0)", colors.tabActive]) }))
  const text = useAnimatedStyle(() => ({ color: interpolateColor(on.value, [0, 1], [colors.text, colors.white]) }))
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress}>
      <Animated.View style={[styles.tab, fill]}>
        <Animated.Text style={[active ? type.tabLabelActive : type.tabLabel, text]}>{label}</Animated.Text>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  scroll: { paddingRight: 12 },
  row: { flexDirection: "row", gap: 8 },
  tab: {
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.text,
    borderRadius: radius.tab,
  },
})
