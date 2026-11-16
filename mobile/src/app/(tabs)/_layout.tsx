import Ionicons from "@expo/vector-icons/Ionicons"
import { Tabs } from "expo-router/js-tabs"
import { useEffect } from "react"
import { StyleSheet, View, type ColorValue } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { colors, ease, golf, radius, shadow, type } from "@/constants/theme"
import { useCart } from "@/providers/cart-provider"

type IconName = React.ComponentProps<typeof Ionicons>["name"]

function icon(name: IconName, focusedName: IconName) {
  function TabBarIcon({ color, focused }: { color: ColorValue; size: number; focused: boolean }) {
    return <BouncyIcon name={focused ? focusedName : name} focused={focused} color={typeof color === "string" ? color : colors.black} />
  }
  return TabBarIcon
}

/** Focus change: icon scale 1 → 1.08 → 1 (150 + 150, sine.out). */
function BouncyIcon({ name, focused, color }: { name: IconName; focused: boolean; color: string }) {
  const s = useSharedValue(1)
  useEffect(() => {
    if (!focused) return
    s.value = withSequence(withTiming(1.08, { duration: 150, easing: ease.sineOut }), withTiming(1, { duration: 150, easing: ease.sineOut }))
  }, [focused, s])
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }))
  return (
    <Animated.View style={style}>
      <Ionicons name={name} size={22} color={color} />
    </Animated.View>
  )
}

/**
 * Tabs (APP_SPEC G.5): Home · Shop · Card · Bag · Account. White bar with
 * rounded top corners; the active label carries a golf-green underline.
 */
export default function TabsLayout() {
  const { itemCount } = useCart()
  const insets = useSafeAreaInsets()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.black,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: [
          styles.bar,
          shadow.sm,
          { height: 56 + insets.bottom, paddingBottom: insets.bottom },
        ],
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
          tabBarBadgeStyle: { backgroundColor: colors.black, color: colors.white, ...type.countBadge, fontSize: 10 },
        }}
      />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: icon("person-outline", "person") }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.white,
    borderTopWidth: 0,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: 6,
  },
  labelWrap: { alignItems: "center", gap: 3 },
  underline: { height: 2, width: 16, borderRadius: 1, backgroundColor: golf.green },
})
