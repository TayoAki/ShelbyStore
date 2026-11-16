import { useEffect, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated"

import { colourways, ease, motion } from "@/constants/theme"

/**
 * The two-tone rope rule (APP_SPEC G.3, web G.5.4): a 4pt pill of skewed
 * stripes in the colourway's rope and crown colours. Draws in from the left
 * (M36: 800ms power3.out after 200ms); a colour change crossfades two stacked
 * layers (M36a: 200ms sine.in-out).
 */
export function RopeRule({ colourway, play = true }: { colourway: string | null | undefined; play?: boolean }) {
  const reduce = useReducedMotion()
  const [width, setWidth] = useState(0)
  const [layers, setLayers] = useState<{ prev: string | null; current: string | null }>({ prev: null, current: colourway ?? null })
  const draw = useSharedValue(reduce ? 1 : 0)
  const fade = useSharedValue(1)
  const started = useRef(false)

  useEffect(() => {
    if (!play || started.current) return
    started.current = true
    draw.set(withDelay(200, withTiming(1, { duration: 800, easing: ease.power3Out, reduceMotion: motion.reduceMotion })))
  }, [draw, play])

  if ((colourway ?? null) !== layers.current) {
    setLayers({ prev: layers.current, current: colourway ?? null })
  }
  useEffect(() => {
    if (!layers.prev) return
    fade.set(0)
    fade.set(withTiming(1, { duration: 200, easing: ease.sineInOut, reduceMotion: motion.reduceMotion }))
  }, [fade, layers])

  const drawStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: draw.value }] }))
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }))

  return (
    <Animated.View
      role="presentation"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.rule, drawStyle]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {layers.prev ? <Stripes colourway={layers.prev} width={width} /> : null}
      <Animated.View style={[StyleSheet.absoluteFill, fadeStyle]}>
        <Stripes colourway={layers.current} width={width} />
      </Animated.View>
    </Animated.View>
  )
}

function Stripes({ colourway, width }: { colourway: string | null; width: number }) {
  const cw = colourway ? colourways[colourway] : undefined
  const rope = cw?.rope ?? "#1F2A44"
  const crown = cw?.crown ?? "#F4F2EE"
  const n = Math.ceil(width / 8) + 2
  return (
    <View style={[StyleSheet.absoluteFill, styles.row]}>
      {Array.from({ length: n }, (_, i) => (
        <View key={i} style={[styles.stripe, { backgroundColor: i % 2 === 0 ? rope : crown }]} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  rule: {
    height: 4,
    borderRadius: 9999,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(33,33,33,.15)",
    alignSelf: "stretch",
    transformOrigin: "left center",
  },
  row: { flexDirection: "row", alignItems: "center" },
  stripe: { width: 8, height: 12, marginLeft: -2, transform: [{ skewX: "-45deg" }] },
})
