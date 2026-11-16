import Ionicons from "@expo/vector-icons/Ionicons"
import { useEffect } from "react"
import { StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

import { colors, ease, golf, motion, radius } from "@/constants/theme"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"

import { Text } from "./text"

/**
 * The true free-shipping progress (APP_SPEC G.3, web G.6.8): the real $85
 * threshold only; the fill grows with M21 (600ms power3.in-out). The charged
 * price is always Medusa's.
 */
export function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const threshold = POLICY.freeShippingThreshold
  const p = useSharedValue(0)
  const target = Math.min(1, Math.max(0, subtotal / threshold))
  useEffect(() => {
    p.value = withTiming(target, { duration: 600, easing: ease.power3InOut, reduceMotion: motion.reduceMotion })
  }, [p, target])
  const fill = useAnimatedStyle(() => ({ transform: [{ scaleX: p.value }] }))
  const unlocked = subtotal >= threshold
  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <View style={styles.line}>
        {unlocked ? <Ionicons name="checkmark-circle-outline" size={16} color={golf.green} /> : null}
        <Text variant="meta">
          {unlocked ? "Free shipping unlocked." : `Add ${formatMoney(Math.ceil((threshold - subtotal) * 100) / 100)} for free shipping.`}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fill]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  line: { flexDirection: "row", alignItems: "center", gap: 6 },
  track: { height: 7, borderRadius: radius.sm, backgroundColor: colors.naturalWhite, overflow: "hidden" },
  fill: { height: 7, backgroundColor: golf.green, transformOrigin: "left center" },
})
