import Ionicons from "@expo/vector-icons/Ionicons"
import { router, useFocusEffect } from "expo-router"
import { useCallback, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"

import { colors, layout } from "@/constants/theme"
import { useTickerItems, type TickerItem } from "@/hooks/use-holes"
import { trackTap } from "@/lib/analytics"

import { Text } from "./text"

const SPEED = 40 // points per second (M34)
const MIN_MS = 20000

/**
 * The leaderboard ticker (APP_SPEC G.3, web G.5.3): a 32pt bar of real data
 * crawling at 40pt/s. Long-press pauses; tapping an item opens it. Reduced
 * motion: one item at a time with chevrons.
 */
export function Ticker() {
  const items = useTickerItems()
  const reduce = useReducedMotion()
  if (!items.length) return null
  return reduce ? <StaticTicker items={items} /> : <CrawlingTicker items={items} />
}

function open(item: TickerItem) {
  trackTap("ticker_item", { item: item.key })
  if (item.href) router.push(item.href as never)
}

function CrawlingTicker({ items }: { items: TickerItem[] }) {
  const x = useSharedValue(0)
  const [copyW, setCopyW] = useState(0)

  const start = useCallback(() => {
    if (!copyW) return
    const full = Math.max(MIN_MS, (copyW / SPEED) * 1000)
    const remaining = Math.max(0, copyW + x.value)
    x.set(
      withTiming(-copyW, { duration: (full * remaining) / copyW, easing: Easing.linear }, (finished) => {
        if (!finished) return
        x.set(0)
        x.set(withRepeat(withTiming(-copyW, { duration: full, easing: Easing.linear }), -1))
      })
    )
  }, [copyW, x])

  useFocusEffect(
    useCallback(() => {
      start()
      return () => cancelAnimation(x)
    }, [start, x])
  )

  const track = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }))
  const label = items.map((i) => i.text).join(", ")

  return (
    <Pressable
      accessibilityRole="text"
      accessibilityLabel={label}
      delayLongPress={250}
      onLongPress={() => cancelAnimation(x)}
      onPressOut={() => start()}
      style={styles.bar}>
      <Animated.View style={[styles.track, track]}>
        <Copy items={items} onLayoutWidth={setCopyW} />
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Copy items={items} />
        </View>
      </Animated.View>
    </Pressable>
  )
}

function Copy({ items, onLayoutWidth }: { items: TickerItem[]; onLayoutWidth?: (w: number) => void }) {
  return (
    <View style={styles.copy} onLayout={onLayoutWidth ? (e) => onLayoutWidth(e.nativeEvent.layout.width) : undefined}>
      {items.map((item) => (
        <View key={item.key} style={styles.item}>
          <Pressable disabled={!item.href} onPress={() => open(item)} hitSlop={6}>
            <Text variant="ticker" tone="inverse" numberOfLines={1}>
              {item.text}
            </Text>
          </Pressable>
          <View style={styles.dot} />
        </View>
      ))}
    </View>
  )
}

function StaticTicker({ items }: { items: TickerItem[] }) {
  const [i, setI] = useState(0)
  const item = items[i % items.length]
  return (
    <View style={[styles.bar, styles.static]} accessibilityLabel="Shelby leaderboard">
      <Pressable accessibilityRole="button" accessibilityLabel="Previous" hitSlop={8} onPress={() => setI((n) => (n - 1 + items.length) % items.length)}>
        <Ionicons name="chevron-back" size={16} color={colors.white} />
      </Pressable>
      <Pressable disabled={!item.href} onPress={() => open(item)} style={styles.flex}>
        <Text variant="ticker" tone="inverse" numberOfLines={1} style={styles.center}>
          {item.text}
        </Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Next" hitSlop={8} onPress={() => setI((n) => (n + 1) % items.length)}>
        <Ionicons name="chevron-forward" size={16} color={colors.white} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: { height: layout.ticker, backgroundColor: colors.black, overflow: "hidden", justifyContent: "center" },
  track: { flexDirection: "row", position: "absolute", left: 0, top: 0, bottom: 0, alignItems: "center" },
  copy: { flexDirection: "row", alignItems: "center" },
  item: { flexDirection: "row", alignItems: "center" },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,.6)", marginHorizontal: 16 },
  static: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, gap: 8 },
  flex: { flex: 1 },
  center: { textAlign: "center" },
})
