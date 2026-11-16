import Ionicons from "@expo/vector-icons/Ionicons"
import { useEffect, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

import { colors, fonts } from "@/constants/theme"

import { Text } from "./text"

/**
 * Accordion (APP_SPEC §3): 1pt #E4E4E4 rules, a 48pt UPPERCASE header with a
 * plus that rotates 45° when open.
 */
export function Accordion({
  title,
  children,
  initiallyOpen = false,
  first = false,
}: {
  title: string
  children: React.ReactNode
  initiallyOpen?: boolean
  /** Only the first of a stack draws a top rule, so rules don't double. */
  first?: boolean
}) {
  const [open, setOpen] = useState(initiallyOpen)
  const turn = useSharedValue(initiallyOpen ? 1 : 0)
  useEffect(() => {
    turn.set(withTiming(open ? 1 : 0, { duration: 200 }))
  }, [open, turn])
  const icon = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.get() * 45}deg` }] }))

  return (
    <View style={[styles.wrap, first && styles.first]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Animated.View style={icon}>
          <Ionicons name="add" size={14} color={colors.primary} />
        </Animated.View>
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: 1, borderBottomColor: colors.line },
  first: { borderTopWidth: 1, borderTopColor: colors.line },
  header: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: fonts.heading, fontSize: 14, lineHeight: 21, letterSpacing: 1.3, textTransform: "uppercase", color: colors.text },
  body: { paddingBottom: 16 },
})
