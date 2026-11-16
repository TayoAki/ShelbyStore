import Ionicons from "@expo/vector-icons/Ionicons"
import { Tabs } from "expo-router/js-tabs"
import { useEffect } from "react"
import { StyleSheet, View, type ColorValue } from "react-native"
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { colors, ease, motion, type } from "@/constants/theme"
import { confirmHaptic } from "@/lib/haptics"
import { useCart } from "@/providers/cart-provider"

type IconName = React.ComponentProps<typeof Ionicons>["name"]

function icon(name: IconName, focusedName: IconName) {
  function TabBarIcon({ color, focused }: { color: ColorValue; size: number; focused: boolean }) {
    return <BouncyIcon name={focused ? focusedName : name} focused={focused} color={typeof color === "string" ? color : colors.text} />
  }
  return TabBarIcon
}

/** M16: on select the icon presses in and out once (1 → 0.92 → 1, 100ms + 100ms ease-out); none under Reduce Motion. */
function BouncyIcon({ name, focused, color }: { name: IconName; focused: boolean; color: string }) {
  const s = useSharedValue(1)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!focused || reduce) return
    const t = { duration: 100, easing: ease.out, reduceMotion: motion.reduceMotion }
    s.value = withSequence(withTiming(0.92, t), withTiming(1, t))
  }, [focused, reduce, s])
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }))
  return (
    <Animated.View style={style}>
      <Ionicons name={name} size={22} color={color} />
    </Animated.View>
  )
}

/**
 * Tabs (APP_SPEC v8 V8.3): Home · Shop · Card · Bag · Account. The native tab
 * bar on white, 56pt plus the safe area, a 1pt #F0F0F0 hairline on top.
 * Inactive #212121 outline glyphs; the active tab is golf green with the
 * filled glyph. Labels are 11pt Roboto 500 uppercase. The bag badge is a 16pt
 * green circle. A light haptic on select.
 */
export default function TabsLayout() {
  const { itemCount } = useCart()
  const insets = useSafeAreaInsets()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: [styles.bar, { height: 56 + insets.bottom, paddingBottom: insets.bottom }],
        tabBarLabel: ({ children, color }) => (
          <View style={styles.labelWrap}>
            <Animated.Text style={[type.tabBar, { color }]}>{children}</Animated.Text>
          </View>
        ),
        sceneStyle: { backgroundColor: colors.bg },
      }}
      screenListeners={{ tabPress: () => confirmHaptic() }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: icon("home-outline", "home") }} />
      <Tabs.Screen name="shop" options={{ title: "Shop", tabBarIcon: icon("grid-outline", "grid") }} />
      <Tabs.Screen name="card" options={{ title: "Card", tabBarIcon: icon("reader-outline", "reader") }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Bag",
          tabBarIcon: icon("bag-handle-outline", "bag-handle"),
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.green,
            color: colors.white,
            ...type.countBadge,
            borderRadius: 8,
            minWidth: 16,
            height: 16,
            lineHeight: 16,
          },
        }}
      />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: icon("person-outline", "person") }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: colors.border,
    borderTopColor: colors.border,
    paddingTop: 4,
    elevation: 0,
    shadowOpacity: 0,
  },
  labelWrap: { alignItems: "center" },
})
