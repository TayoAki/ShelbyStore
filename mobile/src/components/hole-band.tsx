import { Image } from "expo-image"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { StyleSheet, useWindowDimensions, View } from "react-native"
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated"

import { colors, ease, golf, motion, radius, shadow } from "@/constants/theme"
import { holeDate, type Hole } from "@/hooks/use-holes"
import { trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { pad2 } from "@/lib/holes"
import { Reveal, stadiumPoint } from "@/lib/motion"

import { Button } from "./button"
import { Countdown } from "./countdown"
import { EditionBadge } from "./edition-badge"
import { TeeSheet } from "./notify-me"
import { Text } from "./text"

/**
 * The next hole on a golf-green band (APP_SPEC G.5 Home "The next hole", Card
 * "next-hole band"): the edition photo in a white disc, the hole number and
 * name, the real countdown and the tee sheet, or SHOP when live. `orbit` adds
 * v5's brand-pill outline with orbiting dots and a marquee of true facts (M27).
 */
export function HoleBand({ hole, orbit = false, label = "next" }: { hole: Hole; orbit?: boolean; label?: "next" | "home" }) {
  const { width } = useWindowDimensions()
  const reduce = useReducedMotion()
  const w = Math.min(width, 720) - 20
  const [played, setPlayed] = useState(reduce)
  const rise = useSharedValue(reduce ? 1 : 0)
  const live = hole.status === "live"
  const eyebrow = live
    ? `Hole ${hole.number} · Live now`
    : label === "next"
      ? `Next · Hole ${hole.number}`
      : `Hole ${hole.number} · ${holeDate(hole.releaseAt ?? hole.dateIso)}`

  const play = () => {
    if (played) return
    setPlayed(true)
    rise.value = withTiming(1, { duration: 800, easing: ease.power3Out, reduceMotion: motion.reduceMotion })
  }
  const riseStyle = useAnimatedStyle(() => ({ opacity: rise.value, transform: [{ translateY: 16 * (1 - rise.value) }] }))

  const facts = [
    `Hole ${hole.number}`,
    hole.name,
    hole.editionSize ? `Edition of ${hole.editionSize}` : null,
    hole.releaseAt || hole.dateIso ? holeDate(hole.releaseAt ?? hole.dateIso).split(" · ")[0] : null,
    hole.price != null ? formatMoney(hole.price) : null,
    hole.config && hole.config.number >= 2 ? "Leather strap" : null,
  ].filter((f): f is string => !!f)

  return (
    <Reveal onReveal={play} fade={false} style={styles.outer}>
      <View style={[styles.band, { width: w }]}>
        {orbit ? <Orbit width={w - 40} active={played && !reduce} /> : null}
        <Animated.View style={[styles.content, riseStyle]}>
          {hole.image ? (
            <View style={[styles.disc, shadow.float]}>
              <Image source={hole.image} style={styles.discImage} contentFit="contain" accessibilityLabel={`${hole.name} rope cap`} />
            </View>
          ) : null}
          <Text variant="heroEyebrow" tone="tint" style={styles.center}>
            {eyebrow}
          </Text>
          <View style={styles.titleRow}>
            <Text variant="holeNumber" tone="inverse">
              {pad2(hole.number)}
            </Text>
            <Text variant="kicker" tone="inverse">
              {hole.name}
            </Text>
          </View>
          {label === "next" && !live ? (
            <Text variant="label" tone="tint" style={styles.center}>
              {holeDate(hole.releaseAt ?? hole.dateIso)}
            </Text>
          ) : null}
          {hole.promise ? (
            <Text variant="body" tone="inverse" style={styles.center}>
              {hole.promise}
            </Text>
          ) : null}
          {!live && hole.releaseAt ? <Countdown target={hole.releaseAt} inverse /> : null}
          {hole.editionSize ? <EditionBadge size={hole.editionSize} left={live ? hole.left : null} /> : null}
          {live && hole.product?.handle ? (
            <Button
              title={`Shop ${hole.name}`}
              variant="primary"
              onPress={() => {
                trackTap("hero_shop_drop", { hole: hole.number })
                router.push(`/products/${hole.product!.handle}`)
              }}
            />
          ) : hole.release ? (
            <TeeSheet releaseId={hole.release.id} hole={hole.number} name={hole.name} inverse />
          ) : null}
        </Animated.View>
        {orbit ? <Marquee facts={facts} active={played && !reduce} /> : null}
      </View>
    </Reveal>
  )
}

/** Three dots orbiting the upright stadium outline, 15s per lap on a phone (M27). */
function Orbit({ width, active }: { width: number; active: boolean }) {
  const h = width * 1.6
  const p = useSharedValue(0)
  useEffect(() => {
    if (!active) return
    p.value = withRepeat(withTiming(1, { duration: 15000, easing: Easing.linear }), -1)
  }, [active, p])
  return (
    <View pointerEvents="none" style={[styles.orbit, { width, height: h }]}>
      <View style={[StyleSheet.absoluteFill, styles.stadium, { borderRadius: width / 2 }]} />
      {[0, 1 / 3, 2 / 3].map((offset) => (
        <OrbitDot key={offset} p={p} offset={offset} w={width} h={h} />
      ))}
    </View>
  )
}

function OrbitDot({ p, offset, w, h }: { p: SharedValue<number>; offset: number; w: number; h: number }) {
  const style = useAnimatedStyle(() => {
    const pt = stadiumPoint(p.value + offset, w, h)
    return { transform: [{ translateX: pt.x - 3 }, { translateY: pt.y - 3 }] }
  })
  return <Animated.View style={[styles.orbitDot, style]} />
}

/** A strip of true facts crawling sideways, two copies side by side, 10s per loop. */
function Marquee({ facts, active }: { facts: string[]; active: boolean }) {
  const x = useSharedValue(0)
  const [copyW, setCopyW] = useState(0)
  useEffect(() => {
    if (!active || !copyW) return
    x.value = withDelay(0, withRepeat(withTiming(-copyW, { duration: 10000, easing: Easing.linear }), -1))
  }, [active, copyW, x])
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }))
  const copy = (measure: boolean) => (
    <View style={styles.marqueeCopy} onLayout={measure ? (e) => setCopyW(e.nativeEvent.layout.width) : undefined}>
      {facts.map((f) => (
        <Text key={f} variant="label" tone="tint" style={styles.fact}>
          {f}
        </Text>
      ))}
    </View>
  )
  return (
    <View style={styles.marquee} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Animated.View style={[styles.marqueeTrack, style]}>
        {copy(true)}
        {copy(false)}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  outer: { alignItems: "center", marginVertical: 20 },
  band: {
    backgroundColor: golf.green,
    borderRadius: radius.xxxl,
    paddingHorizontal: 20,
    paddingVertical: 32,
    overflow: "hidden",
    alignItems: "center",
  },
  content: { alignItems: "center", gap: 14, alignSelf: "stretch" },
  disc: { width: 200, height: 200, borderRadius: 100, backgroundColor: colors.white, overflow: "hidden" },
  discImage: { width: "86%", height: "86%", margin: "7%" },
  center: { textAlign: "center" },
  titleRow: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  orbit: { position: "absolute", top: 20, alignSelf: "center" },
  stadium: { borderWidth: 1, borderColor: "rgba(255,255,255,.35)" },
  orbitDot: { position: "absolute", left: 0, top: 0, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.white },
  marquee: { alignSelf: "stretch", overflow: "hidden", marginTop: 24, height: 20 },
  marqueeTrack: { flexDirection: "row", position: "absolute", left: 0 },
  marqueeCopy: { flexDirection: "row" },
  fact: { marginRight: 28 },
})
