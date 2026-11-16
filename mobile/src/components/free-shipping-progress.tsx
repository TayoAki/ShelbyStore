import Ionicons from "@expo/vector-icons/Ionicons"
import { useEffect } from "react"
import { StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

import { colors, ease, motion } from "@/constants/theme"
import { formatMoney } from "@/lib/format"
import { POLICY } from "@/lib/policy"

import { Text } from "./text"

/**
 * The true free-shipping progress (APP_SPEC G.3, v7 §5.6): the real $85
 * threshold only, printed as a keylined bar that fills in the ink on the beat.
 * The charged price is always Medusa's.
 */
export function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const threshold = POLICY.freeShippingThreshold
  const p = useSharedValue(0)
  const target = Math.min(1, Math.max(0, subtotal / threshold))
  useEffect(() => {
    p.value = withTiming(target, { duration: 420, easing: ease.box, reduceMotion: motion.reduceMotion })
  }, [p, target])
  const fill = useAnimatedStyle(() => ({ transform: [{ scaleX: p.value }] }))
  const unlocked = subtotal >= threshold
  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <View style={styles.line}>
        {unlocked ? <Ionicons name="checkmark" size={16} color={colors.ink} /> : null}
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
  track: { height: 12, borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.paper, overflow: "hidden" },
  fill: { height: 8, backgroundColor: colors.ink, transformOrigin: "left center" },
})
