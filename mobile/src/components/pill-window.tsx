import { Image, type ImageSource } from "expo-image"
import { useState } from "react"
import { StyleSheet, useWindowDimensions, View } from "react-native"
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated"

import { colors, ease, motion, radius } from "@/constants/theme"
import { Reveal } from "@/lib/motion"

import { Text } from "./text"

/**
 * The expanding pill window (M28): the pill scales .01 → 1 over 2200ms
 * power3.out with the photo counter-scaled inside (Allbirds' technique), two
 * border pills scale in with it, then the quote fades in (1500ms, +1700ms).
 */
export function PillWindow({ image, quote, children }: { image: ImageSource | string; quote: string; children?: React.ReactNode }) {
  const { width } = useWindowDimensions()
  const reduce = useReducedMotion()
  const w = Math.min(width, 720) - 20
  const h = w * 1.25
  const container = useSharedValue(reduce ? 1 : 0)
  const s = useSharedValue(reduce ? 1 : 0.01)
  const borders = useSharedValue(reduce ? 1 : 0)
  const q = useSharedValue(reduce ? 1 : 0)
  const [played, setPlayed] = useState(reduce)

  const play = () => {
    if (played) return
    setPlayed(true)
    container.value = withTiming(1, { duration: 300, easing: ease.sineOut, reduceMotion: motion.reduceMotion })
    s.value = withDelay(800, withTiming(1, { duration: 2200, easing: ease.power3Out, reduceMotion: motion.reduceMotion }))
    borders.value = withDelay(800, withTiming(1, { duration: 2200, easing: ease.power3Out, reduceMotion: motion.reduceMotion }))
    q.value = withDelay(1700, withTiming(1, { duration: 1500, easing: ease.sineOut, reduceMotion: motion.reduceMotion }))
  }

  const containerStyle = useAnimatedStyle(() => ({ opacity: container.value }))
  const pillStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }))
  const imageStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 / Math.max(0.01, s.value) }] }))
  const borderStyle = useAnimatedStyle(() => ({ transform: [{ scale: borders.value }] }))
  const quoteStyle = useAnimatedStyle(() => ({ opacity: q.value }))

  return (
    <Reveal onReveal={play} fade={false} style={styles.outer}>
      <Animated.View style={[{ width: w, height: h }, styles.frame, containerStyle]}>
        <Animated.View style={[styles.border, { width: w * 0.9, height: h * 0.96, left: w * 0.05, top: h * 0.02 }, borderStyle]} />
        <Animated.View style={[styles.border, { width: w * 0.8, height: h * 0.92, left: w * 0.1, top: h * 0.04 }, borderStyle]} />
        <Animated.View style={[styles.pill, { width: w * 0.7, height: h * 0.88, left: w * 0.15, top: h * 0.06 }, pillStyle]}>
          <Animated.View style={[StyleSheet.absoluteFill, imageStyle]}>
            <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" />
          </Animated.View>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,.28)" }]} />
          <Animated.View style={[styles.quoteWrap, quoteStyle]}>
            <Text variant="quote" tone="inverse" style={styles.quote}>
              {quote}
            </Text>
          </Animated.View>
        </Animated.View>
      </Animated.View>
      {children ? <View style={styles.after}>{children}</View> : null}
    </Reveal>
  )
}

const styles = StyleSheet.create({
  outer: { marginHorizontal: 10, marginVertical: 20, alignItems: "center", gap: 20 },
  frame: { position: "relative" },
  border: { position: "absolute", borderRadius: radius.full, borderWidth: 1, borderColor: colors.pillBorder },
  pill: { position: "absolute", borderRadius: radius.full, overflow: "hidden", justifyContent: "center" },
  quoteWrap: { paddingHorizontal: 28 },
  quote: { textAlign: "center" },
  after: { alignItems: "center" },
})
