import Ionicons from "@expo/vector-icons/Ionicons"
import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

import { colors, dur, ease, motion } from "@/constants/theme"

import { Text } from "./text"

/**
 * Eastside's accordion (APP_SPEC v8 V8.3, M15): 48pt+ rows ruled 1pt #F0F0F0,
 * the title in Roboto 500 18 capitalized, a + that turns 45° when open. The
 * body fades in over 300ms ease-out while sliding −8 → 0 over 300ms ease-in;
 * Reduce Motion cuts.
 */
export function Accordion({
  title,
  children,
  initiallyOpen = false,
}: {
  title: string
  children: React.ReactNode
  initiallyOpen?: boolean
}) {
  const [open, setOpen] = useState(initiallyOpen)
  const measured = useSharedValue(0)
  const progress = useSharedValue(initiallyOpen ? 1 : 0)
  const slide = useSharedValue(initiallyOpen ? 1 : 0)
  const toggle = () => {
    const next = !open
    setOpen(next)
    progress.set(withTiming(next ? 1 : 0, { duration: dur.accordion, easing: ease.out, reduceMotion: motion.reduceMotion }))
    slide.set(withTiming(next ? 1 : 0, { duration: dur.accordion, easing: ease.in, reduceMotion: motion.reduceMotion }))
  }
  const body = useAnimatedStyle(() => ({ height: measured.value * progress.value, opacity: progress.value }))
  const inner = useAnimatedStyle(() => ({ transform: [{ translateY: (slide.value - 1) * 8 }] }))
  const icon = useAnimatedStyle(() => ({ transform: [{ rotate: `${progress.value * 45}deg` }] }))
  return (
    <View style={styles.wrap}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={toggle} style={styles.head}>
        <Text variant="accordionTitle" style={styles.flex}>
          {title}
        </Text>
        <Animated.View style={icon}>
          <Ionicons name="add" size={16} color={colors.text} />
        </Animated.View>
      </Pressable>
      <Animated.View style={[styles.clip, body]}>
        <Animated.View
          style={[styles.inner, inner]}
          onLayout={(e) => {
            measured.set(e.nativeEvent.layout.height)
          }}>
          {children}
        </Animated.View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: 1, borderBottomColor: colors.border },
  head: { minHeight: 48, paddingVertical: 14, paddingRight: 30, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  flex: { flex: 1 },
  clip: { overflow: "hidden" },
  inner: { position: "absolute", left: 0, right: 0, top: 0, paddingBottom: 16, gap: 8 },
})
