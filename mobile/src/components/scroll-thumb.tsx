import { StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated"

import { colors } from "@/constants/theme"

/** Allbirds' slider scroll bar (APP_SPEC v5 §3): a 2pt track with a thumb that follows the offset. */
export function ScrollThumb({
  count,
  offset,
  pageWidth,
  width,
}: {
  count: number
  offset: SharedValue<number>
  pageWidth: number
  width: number
}) {
  const thumbW = count > 0 ? width / count : width
  const style = useAnimatedStyle(() => {
    const max = Math.max(1, pageWidth * (count - 1))
    const p = Math.min(1, Math.max(0, offset.value / max))
    return { transform: [{ translateX: p * (width - thumbW) }] }
  })
  if (count <= 1) return null
  return (
    <View style={[styles.track, { width }]}>
      <Animated.View style={[styles.thumb, { width: thumbW }, style]} />
    </View>
  )
}

const styles = StyleSheet.create({
  track: { height: 2, backgroundColor: colors.naturalWhite, alignSelf: "center", overflow: "hidden" },
  thumb: { height: 2, backgroundColor: colors.black },
})
