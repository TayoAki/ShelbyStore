import Ionicons from "@expo/vector-icons/Ionicons"
import { Tabs } from "expo-router/js-tabs"
import type { ColorValue } from "react-native"

import { colors } from "@/constants/theme"
import { useCart } from "@/providers/cart-provider"

type IconName = React.ComponentProps<typeof Ionicons>["name"]

function icon(name: IconName, focusedName: IconName) {
  return ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? focusedName : name} size={size - 2} color={typeof color === "string" ? color : colors.text} />
  )
}

export default function TabsLayout() {
  const { itemCount } = useCart()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: icon("home-outline", "home") }} />
      <Tabs.Screen name="drops" options={{ title: "Drops", tabBarIcon: icon("flash-outline", "flash") }} />
      <Tabs.Screen name="shop" options={{ title: "Shop", tabBarIcon: icon("grid-outline", "grid") }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Bag",
          tabBarIcon: icon("bag-outline", "bag"),
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent, color: colors.textInverse, fontSize: 11 },
        }}
      />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: icon("person-outline", "person") }} />
    </Tabs>
  )
}
