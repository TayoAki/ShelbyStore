import Ionicons from "@expo/vector-icons/Ionicons"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import Animated, { useReducedMotion, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated"

import { colors, dur, ease, layout, motion } from "@/constants/theme"
import { useTickerItems, type TickerItem } from "@/hooks/use-holes"
import { trackTap } from "@/lib/analytics"

import { Text } from "./text"

/**
 * Eastside's announcement strip (APP_SPEC v8 V8.3, M7): 36pt, black, real
 * ticker items only (next hole and date, live edition stock, the core cap).
 * Items cross-fade every 5s over 500ms; a pause button sits at the right edge.
 * Under Reduce Motion autoplay stops and prev/next arrows show at both ends.
 */
export function Announcement() {
  const items = useTickerItems().slice(0, 3)
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const opacity = useSharedValue(1)
  const autoplay = !reduce && !paused && items.length > 1

  useEffect(() => {
    if (!autoplay) return
    const id = setInterval(() => {
      opacity.value = withTiming(0, { duration: dur.announceFade / 2, easing: ease.css, reduceMotion: motion.reduceMotion }, () => undefined)
      setTimeout(() => {
        setI((n) => (n + 1) % items.length)
        opacity.value = withTiming(1, { duration: dur.announceFade, easing: ease.css, reduceMotion: motion.reduceMotion })
      }, dur.announceFade / 2)
    }, dur.announce)
    return () => clearInterval(id)
  }, [autoplay, items.length, opacity])

  const fade = useAnimatedStyle(() => ({ opacity: opacity.value }))
  if (!items.length) return null
  const item = items[i % items.length]
  const step = (d: number) => setI((n) => (n + d + items.length) % items.length)

  return (
    <View style={styles.bar}>
      {reduce && items.length > 1 ? <Arrow name="chevron-back" label="Previous announcement" onPress={() => step(-1)} /> : <View style={styles.side} />}
      <Pressable
        accessibilityRole={item.href ? "link" : "text"}
        accessibilityLabel={item.text}
        disabled={!item.href}
        onPress={() => open(item)}
        style={styles.center}>
        <Animated.View style={fade}>
          <Text variant="announce" tone="onInk" numberOfLines={1} style={styles.text}>
            {item.text}
          </Text>
        </Animated.View>
      </Pressable>
      {reduce ? (
        items.length > 1 ? (
          <Arrow name="chevron-forward" label="Next announcement" onPress={() => step(1)} />
        ) : (
          <View style={styles.side} />
        )
      ) : items.length > 1 ? (
        <Arrow name={paused ? "play" : "pause"} label={paused ? "Play announcements" : "Pause announcements"} onPress={() => setPaused((p) => !p)} />
      ) : (
        <View style={styles.side} />
      )}
    </View>
  )
}

function Arrow({ name, label, onPress }: { name: React.ComponentProps<typeof Ionicons>["name"]; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={10} style={styles.side}>
      <Ionicons name={name} size={14} color={colors.onInk} />
    </Pressable>
  )
}

/** v6 name kept for imports. */
export const Ticker = Announcement

function open(item: TickerItem) {
  trackTap("ticker_item", { item: item.key })
  if (item.href) router.push(item.href as never)
}

const styles = StyleSheet.create({
  bar: { height: layout.announcement, backgroundColor: colors.ink, flexDirection: "row", alignItems: "center" },
  side: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, height: 36, justifyContent: "center" },
  text: { textAlign: "center" },
})
