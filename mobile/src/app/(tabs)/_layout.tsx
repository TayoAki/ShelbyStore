import Ionicons from "@expo/vector-icons/Ionicons"
import { Tabs } from "expo-router/js-tabs"
import { useEffect } from "react"
import { StyleSheet, View, type ColorValue } from "react-native"
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { BEAT, colors, ease, motion, type } from "@/constants/theme"
import { useCart } from "@/providers/cart-provider"

type IconName = React.ComponentProps<typeof Ionicons>["name"]

function icon(name: IconName, focusedName: IconName) {
  function TabBarIcon({ color, focused }: { color: ColorValue; size: number; focused: boolean }) {
    return <BouncyIcon name={focused ? focusedName : name} focused={focused} color={typeof color === "string" ? color : colors.black} />
  }
  return TabBarIcon
}

/** Focus change: the icon presses in and out once on the beat (1 → 1.08 → 1); none under Reduce Motion. */
function BouncyIcon({ name, focused, color }: { name: IconName; focused: boolean; color: string }) {
  const s = useSharedValue(1)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!focused || reduce) return
    const t = { duration: BEAT / 2, easing: ease.box, reduceMotion: motion.reduceMotion }
    s.value = withSequence(withTiming(1.08, t), withTiming(1, t))
  }, [focused, reduce, s])
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }))
  return (
    <Animated.View style={style}>
      <Ionicons name={name} size={22} color={color} />
    </Animated.View>
  )
}

/**
 * Tabs (APP_SPEC v7 §4): Home · Shop · Card · Bag · Account. The native tab
 * bar, printed: white board with a 2pt ink keyline along its top edge, square,
 * no shadow; the active tab in ink with a 3pt ink rule under its label, the
 * rest in the meta ink. Labels are 11pt Sofia Sans Semi Condensed.
 */
export default function TabsLayout() {
  const { itemCount } = useCart()
  const insets = useSafeAreaInsets()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.ink3,
        tabBarStyle: [styles.bar, { height: 60 + insets.bottom, paddingBottom: insets.bottom }],
        tabBarLabel: ({ focused, children, color }) => (
          <View style={styles.labelWrap}>
            <Animated.Text style={[type.tabBar, { color }]}>{children}</Animated.Text>
            <View style={[styles.underline, { opacity: focused ? 1 : 0 }]} />
          </View>
        ),
        sceneStyle: { backgroundColor: colors.page },
      }}>
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
            backgroundColor: colors.ink,
            color: colors.paper,
            ...type.countBadge,
            borderRadius: 0,
            minWidth: 18,
            height: 18,
            lineHeight: 18,
          },
        }}
      />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: icon("person-outline", "person") }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.paper,
    borderTopWidth: 2,
    borderColor: colors.ink,
    borderTopColor: colors.ink,
    paddingTop: 6,
    elevation: 0,
    shadowOpacity: 0,
  },
  labelWrap: { alignItems: "center", gap: 3 },
  underline: { height: 3, width: 20, backgroundColor: colors.ink },
})
