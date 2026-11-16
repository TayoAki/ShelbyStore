import { Image, type ImageSource } from "expo-image"
import { useState } from "react"
import { StyleSheet, useWindowDimensions, View } from "react-native"
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from "react-native-reanimated"

import { colors, ease, motion, radius, shadow } from "@/constants/theme"
import { circlePoint, Reveal } from "@/lib/motion"

import { Text } from "./text"

export type Callout = { title: string; body: string }

/** Dot resting points on the ring (fractions of the path), in reveal order. */
const DOTS = [0.681, 0.181, 0.431, 0.931]

/**
 * The material ring (M26, APP_SPEC v5 §5.2): on a photo with a veil, three
 * circles scale in (1500ms sine.out), four dots run to their resting points,
 * callouts fade in in order 4, 3, 1, 2, then the centre content.
 */
export function MaterialRing({
  background,
  centre,
  callouts,
  title,
  children,
}: {
  background: ImageSource | string
  centre: ImageSource | string | null
  callouts: Callout[]
  title?: string
  children?: React.ReactNode
}) {
  const { width } = useWindowDimensions()
  const reduce = useReducedMotion()
  const ringW = Math.min(width, 720) - 80
  const unit = ringW / 200
  const band = useSharedValue(reduce ? 1 : 0)
  const circles = useSharedValue(reduce ? 1 : 0)
  const dots = [useSharedValue(reduce ? 1 : 0), useSharedValue(reduce ? 1 : 0), useSharedValue(reduce ? 1 : 0), useSharedValue(reduce ? 1 : 0)]
  const calls = [useSharedValue(reduce ? 1 : 0), useSharedValue(reduce ? 1 : 0), useSharedValue(reduce ? 1 : 0), useSharedValue(reduce ? 1 : 0)]
  const centreO = useSharedValue(reduce ? 1 : 0)
  const [played, setPlayed] = useState(reduce)

  const play = () => {
    if (played) return
    setPlayed(true)
    const t = (d: number, delay = 0) => withDelay(delay, withTiming(1, { duration: d, easing: ease.sineOut, reduceMotion: motion.reduceMotion }))
    band.value = t(800)
    circles.value = t(1500)
    dots.forEach((d, i) => (d.value = t(1500, 800 + i * 400)))
    // callouts in order 4, 3, 1, 2
    ;[3, 2, 0, 1].forEach((idx, k) => (calls[idx].value = withDelay(1600 + k * 400, withTiming(1, { duration: 500, easing: ease.sineOut }))))
    centreO.value = withDelay(1400, withTiming(1, { duration: 600, easing: ease.sineOut }))
  }

  const bandStyle = useAnimatedStyle(() => ({ opacity: band.value }))
  const centreStyle = useAnimatedStyle(() => ({ opacity: centreO.value }))

  return (
    <Reveal onReveal={play} fade={false} style={styles.outer}>
      <Animated.View style={[styles.band, bandStyle]}>
        <Image source={background} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,.3)" }]} />
        {title ? (
          <Text variant="section" tone="inverse" style={styles.title}>
            {title}
          </Text>
        ) : null}
        <View style={{ width: ringW, height: ringW, alignSelf: "center" }}>
          {[180, 160, 140].map((d, i) => (
            <Circle key={d} size={d * unit} ringW={ringW} progress={circles} fill={i === 2} stroke={i === 0 ? colors.white : i === 1 ? colors.ringStroke2 : colors.ringStroke3} />
          ))}
          {DOTS.map((s, i) => (
            <Dot key={s} rest={s} progress={dots[i]} unit={unit} />
          ))}
          <Animated.View style={[styles.centre, { width: ringW * 0.5, height: ringW * 0.5, left: ringW * 0.25, top: ringW * 0.25 }, shadow.float, centreStyle]}>
            {centre ? <Image source={centre} style={styles.centreImage} contentFit="contain" /> : null}
          </Animated.View>
        </View>
        <View style={styles.callouts}>
          {callouts.slice(0, 4).map((c, i) => (
            <CalloutBox key={c.title} callout={c} progress={calls[i]} />
          ))}
        </View>
        {children ? <View style={styles.cta}>{children}</View> : null}
      </Animated.View>
    </Reveal>
  )
}

function Circle({ size, ringW, progress, stroke, fill }: { size: number; ringW: number; progress: SharedValue<number>; stroke: string; fill: boolean }) {
  const style = useAnimatedStyle(() => ({ opacity: progress.value, transform: [{ scale: progress.value }] }))
  return (
    <Animated.View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, left: (ringW - size) / 2, top: (ringW - size) / 2, borderColor: stroke },
        fill && { backgroundColor: colors.ringFill },
        style,
      ]}
    />
  )
}

function Dot({ rest, progress, unit }: { rest: number; progress: SharedValue<number>; unit: number }) {
  const style = useAnimatedStyle(() => {
    const p = rest + 0.15 * (1 - progress.value)
    const pt = circlePoint(p, 100, 100, 90)
    return {
      opacity: progress.value,
      transform: [{ translateX: pt.x * unit - 3 }, { translateY: pt.y * unit - 3 }, { scale: progress.value }],
    }
  })
  return <Animated.View style={[styles.dot, style]} />
}

function CalloutBox({ callout, progress }: { callout: Callout; progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({ opacity: progress.value }))
  return (
    <Animated.View style={[styles.callout, style]}>
      <Text variant="scoreLabel" tone="inverse">
        {callout.title}
      </Text>
      <Text variant="meta" tone="inverse">
        {callout.body}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  outer: { marginHorizontal: 10, marginVertical: 20 },
  band: { borderRadius: radius.xl, overflow: "hidden", paddingVertical: 32, paddingHorizontal: 20, gap: 24 },
  title: { textAlign: "center" },
  circle: { position: "absolute", borderWidth: 1 },
  dot: { position: "absolute", left: 0, top: 0, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.white },
  centre: { position: "absolute", borderRadius: 9999, backgroundColor: colors.white, overflow: "hidden" },
  centreImage: { width: "100%", height: "100%" },
  callouts: { flexDirection: "row", flexWrap: "wrap", gap: 16, justifyContent: "space-between" },
  callout: { width: "47%", gap: 4 },
  cta: { alignItems: "center" },
})
