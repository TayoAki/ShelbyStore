import { Image } from "expo-image"
import { router } from "expo-router"
import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated"

import { colors, ease, golf, motion, radius } from "@/constants/theme"
import { holeDate, type Hole } from "@/hooks/use-holes"
import { trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { pad2 } from "@/lib/holes"

import { Badge } from "./badge"
import { Button } from "./button"
import { EditionBadge } from "./edition-badge"
import { TeeSheet } from "./notify-me"
import { RopeRule } from "./rope-rule"
import { Text } from "./text"

const STATUS: Record<Hole["status"], string> = {
  live: "Live",
  upcoming: "Upcoming",
  announced: "Announced",
  sold_out: "Sold out",
  ended: "Ended",
}

/**
 * A hole on The Card (APP_SPEC G.3): number and status, the edition photo
 * (or the hole number on golf tint when only announced), name, date, rope
 * rule, edition line and a CTA by phase. Sold-out holes stay visible.
 * Press: scale .98 (M37).
 */
export function HoleCard({ hole }: { hole: Hole }) {
  const reduce = useReducedMotion()
  const scale = useSharedValue(1)
  const [teeSheet, setTeeSheet] = useState(false)
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const press = (to: number) => {
    if (reduce) return
    scale.set(withTiming(to, { duration: 150, easing: ease.tailwind, reduceMotion: motion.reduceMotion }))
  }
  const open = () => {
    trackTap("card_hole", { hole: hole.number })
    if (hole.number === 1) router.push("/products/rope-cap")
    else if (hole.handle) router.push(`/card/${hole.handle}`)
  }
  const tappable = hole.number === 1 || !!hole.handle
  const isCore = hole.number === 1

  return (
    <Animated.View style={[styles.card, animated]}>
      <Pressable
        accessibilityRole={tappable ? "link" : undefined}
        accessibilityLabel={`Hole ${hole.number}, ${hole.name}, ${STATUS[hole.status]}`}
        disabled={!tappable}
        onPressIn={() => press(0.98)}
        onPressOut={() => press(1)}
        onPress={open}>
        <View style={styles.top}>
          <Text variant="scoreLabel">Hole {pad2(hole.number)}</Text>
          <Badge label={STATUS[hole.status]} />
        </View>
        {hole.status === "announced" || !hole.image ? (
          <View style={[styles.image, styles.announced]}>
            <Text variant="holeNumber" tone="midnight">
              {pad2(hole.number)}
            </Text>
          </View>
        ) : (
          <Image source={hole.image} style={styles.image} contentFit="contain" accessibilityLabel={`${hole.name} rope cap`} />
        )}
      </Pressable>
      <View style={styles.body}>
        <Text variant="kicker" numberOfLines={1}>
          {hole.name}
        </Text>
        <Text variant="scoreLabel" tone="muted" numberOfLines={2}>
          {isCore ? "Live now" : holeDate(hole.dateIso)}
        </Text>
        {hole.colourway ? <RopeRule colourway={hole.colourway} /> : isCore ? <RopeRule colourway="Tour White" /> : null}
        {!isCore && hole.editionSize ? (
          <EditionBadge size={hole.editionSize} left={hole.status === "live" ? hole.left : null} />
        ) : null}
        {hole.price != null ? <Text variant="priceSm">{formatMoney(hole.price)}</Text> : null}
        <View style={styles.cta}>
          {hole.status === "live" ? (
            <Button
              title={isCore ? "Shop the Rope Cap" : `Shop ${hole.name}`}
              size="small"
              onPress={() => router.push(`/products/${hole.product?.handle ?? "rope-cap"}`)}
            />
          ) : hole.status === "upcoming" && hole.release ? (
            teeSheet ? (
              <TeeSheet releaseId={hole.release.id} hole={hole.number} name={hole.name} showEyebrow={false} />
            ) : (
              <Button title="Join the tee sheet" variant="outlineBlack" size="small" onPress={() => setTeeSheet(true)} />
            )
          ) : hole.status === "announced" ? (
            <Text variant="meta" tone="muted">
              Announced. Details closer to the date.
            </Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.white, borderRadius: radius.xxl, overflow: "hidden" },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, gap: 8 },
  image: { width: "100%", aspectRatio: 1, backgroundColor: colors.white },
  announced: { backgroundColor: golf.tint, alignItems: "center", justifyContent: "center" },
  body: { padding: 16, gap: 4 },
  cta: { marginTop: 8 },
})
