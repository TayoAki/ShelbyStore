import Ionicons from "@expo/vector-icons/Ionicons"
import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

import { colors, dur, ease, motion } from "@/constants/theme"

import { Text } from "./text"

/** Printed rows, ruled in the ink: height opens on the beat and the + turns 45°; Reduce Motion cuts. */
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
  const toggle = () => {
    const next = !open
    setOpen(next)
    progress.set(withTiming(next ? 1 : 0, { duration: dur.accordion, easing: ease.box, reduceMotion: motion.reduceMotion }))
  }
  const body = useAnimatedStyle(() => ({ height: measured.value * progress.value, opacity: progress.value }))
  const icon = useAnimatedStyle(() => ({ transform: [{ rotate: `${progress.value * 45}deg` }] }))
  return (
    <View style={styles.wrap}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={toggle} style={styles.head}>
        <Text variant="menuItem" style={styles.flex}>
          {title}
        </Text>
        <Animated.View style={icon}>
          <Ionicons name="add" size={20} color={colors.ink} />
        </Animated.View>
      </Pressable>
      <Animated.View style={[styles.clip, body]}>
        <View
          style={styles.inner}
          onLayout={(e) => {
            measured.set(e.nativeEvent.layout.height)
          }}>
          {children}
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: 1.5, borderBottomColor: colors.ink },
  head: { minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  flex: { flex: 1 },
  clip: { overflow: "hidden" },
  inner: { position: "absolute", left: 0, right: 0, top: 0, paddingBottom: 20, gap: 8 },
})
