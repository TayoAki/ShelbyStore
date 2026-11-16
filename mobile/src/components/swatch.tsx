import { useEffect } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

import { colors, colourways, dur, ease, golf, LIGHT_CROWNS, motion } from "@/constants/theme"

import { Text } from "./text"

/**
 * A Rope Cap swatch (APP_SPEC G.3): the crown colour with a rope band across
 * the lower third (M38 scaleX .6 → 1 on select), a golf-green selected ring
 * and an inner ring on light crowns.
 */
export function Swatch({
  name,
  selected = false,
  size = 36,
  soldOut = false,
  caption,
  onPress,
  accessibilityHint,
}: {
  name: string
  selected?: boolean
  size?: 36 | 20
  soldOut?: boolean
  /** A 10pt mono date under upcoming limited swatches. */
  caption?: string | null
  onPress?: () => void
  accessibilityHint?: string
}) {
  const cw = colourways[name]
  const crown = cw?.crown ?? "#8c867c"
  const rope = cw?.rope ?? colors.white
  const ring = useSharedValue(selected ? 1 : 0)
  const band = useSharedValue(selected ? 1 : 0.6)

  useEffect(() => {
    ring.value = withTiming(selected ? 1 : 0, { duration: dur.button, easing: ease.tailwind, reduceMotion: motion.reduceMotion })
    band.value = selected
      ? withTiming(1, { duration: dur.button, easing: ease.tailwind, reduceMotion: motion.reduceMotion })
      : withTiming(1, { duration: 0 })
  }, [band, ring, selected])

  const ringStyle = useAnimatedStyle(() => ({ opacity: ring.value }))
  const bandStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: band.value }] }))

  const outer = size + 2
  const body = (
    <View style={{ alignItems: "center", gap: 4 }}>
      <View style={{ width: outer, height: outer, alignItems: "center", justifyContent: "center" }}>
        <Animated.View
          pointerEvents="none"
          style={[styles.selectedRing, { width: outer, height: outer, borderRadius: outer / 2 }, ringStyle]}
        />
        <View
          style={[
            styles.fill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: size === 36 ? 3 : 2,
              backgroundColor: crown,
            },
          ]}>
          {LIGHT_CROWNS.has(name) ? <View style={[StyleSheet.absoluteFill, styles.inner, { borderRadius: size }]} /> : null}
          <Animated.View
            style={[
              styles.band,
              { top: "62%", height: size === 36 ? 3 : 2, backgroundColor: rope },
              bandStyle,
            ]}
          />
          {soldOut ? <View style={styles.cross} /> : null}
        </View>
      </View>
      {caption ? (
        <Text variant="badge" tone="muted">
          {caption}
        </Text>
      ) : null}
    </View>
  )

  if (!onPress) return body
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected }}
      hitSlop={4}
      onPress={onPress}>
      {body}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  selectedRing: { position: "absolute", borderWidth: 1, borderColor: golf.green },
  fill: { borderColor: colors.white, overflow: "hidden" },
  inner: { borderWidth: 1, borderColor: colors.swatchRing },
  band: { position: "absolute", left: "18%", right: "18%", borderRadius: 9999 },
  cross: {
    position: "absolute",
    width: "140%",
    height: 1.6,
    top: "50%",
    left: "-20%",
    backgroundColor: "rgba(0,0,0,.5)",
    transform: [{ rotate: "-45deg" }],
  },
})
