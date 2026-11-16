import Ionicons from "@expo/vector-icons/Ionicons"
import { Tabs } from "expo-router/js-tabs"
import type { ColorValue } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { colors, fonts } from "@/constants/theme"
import { useCart } from "@/providers/cart-provider"

type IconName = React.ComponentProps<typeof Ionicons>["name"]

function icon(name: IconName, focusedName: IconName) {
  function TabBarIcon({ color, focused }: { color: ColorValue; size: number; focused: boolean }) {
    return <Ionicons name={focused ? focusedName : name} size={22} color={typeof color === "string" ? color : colors.text} />
  }
  return TabBarIcon
}

/** Tabs (APP_SPEC §4.2): Home · Shop · Drops · Bag · Account, white bar, UPPERCASE 10pt labels. */
export default function TabsLayout() {
  const { itemCount } = useCart()
  const insets = useSafeAreaInsets()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.secondary,
          borderTopColor: colors.lineHeader,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: fonts.heading, fontSize: 10, letterSpacing: 1.3, textTransform: "uppercase" },
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: icon("home-outline", "home") }} />
      <Tabs.Screen name="shop" options={{ title: "Shop", tabBarIcon: icon("grid-outline", "grid") }} />
      <Tabs.Screen name="drops" options={{ title: "Drops", tabBarIcon: icon("flash-outline", "flash") }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Bag",
          tabBarIcon: icon("bag-outline", "bag"),
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: colors.textInverse,
            fontFamily: fonts.heading,
            fontSize: 10,
          },
        }}
      />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: icon("person-outline", "person") }} />
    </Tabs>
  )
}
