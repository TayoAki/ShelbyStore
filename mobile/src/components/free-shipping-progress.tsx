import { useEffect } from "react"
import { StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

import { colors, dur, ease, motion, radius } from "@/constants/theme"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"

import { Text } from "./text"

/**
 * Eastside's free-shipping bar (APP_SPEC v8 V8.3, M20): a centred message and
 * an 8pt rounded bar, track #EEE, green fill that grows over 300ms ease-out.
 * The threshold is the real $85; the charged price is always Medusa's.
 */
export function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const threshold = POLICY.freeShippingThreshold
  const p = useSharedValue(0)
  const target = Math.min(1, Math.max(0, subtotal / threshold))
  useEffect(() => {
    p.value = withTiming(target, { duration: dur.progress, easing: ease.out, reduceMotion: motion.reduceMotion })
  }, [p, target])
  const fill = useAnimatedStyle(() => ({ transform: [{ scaleX: p.value }] }))
  const unlocked = subtotal >= threshold
  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <Text variant="bodyPdp" style={styles.center}>
        {unlocked
          ? "You've got free standard shipping."
          : `You're ${formatMoney(Math.ceil((threshold - subtotal) * 100) / 100)} away from free shipping.`}
      </Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fill]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  center: { textAlign: "center" },
  track: { height: 8, borderRadius: radius.bar, backgroundColor: colors.track, overflow: "hidden" },
  fill: { height: 8, borderRadius: radius.bar, backgroundColor: colors.green, transformOrigin: "left center" },
})
