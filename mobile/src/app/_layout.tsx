import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as Notifications from "expo-notifications"
import { router, Stack, useGlobalSearchParams, usePathname } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import { Platform } from "react-native"

import { colors } from "@/constants/theme"
import { setAnalyticsContext, trackScreen } from "@/lib/analytics"
import { captureAttribution, readAttribution } from "@/lib/attribution"
import { AuthProvider } from "@/providers/auth-provider"
import { CartProvider, useCart } from "@/providers/cart-provider"

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  })
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <AuthProvider>
          <AttributionListener />
          <ScreenTracker />
          {Platform.OS !== "web" ? <DropNotificationRouter /> : null}
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              headerShadowVisible: false,
              headerBackButtonDisplayMode: "minimal",
              headerTitleStyle: { fontWeight: "600" },
              contentStyle: { backgroundColor: colors.background },
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Shelby" }} />
            <Stack.Screen name="drops/[handle]" options={{ title: "" }} />
            <Stack.Screen name="products/[handle]" options={{ title: "" }} />
            <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
            <Stack.Screen
              name="order/[id]"
              options={{ title: "Order confirmed", headerBackVisible: false, gestureEnabled: false }}
            />
          </Stack>
        </AuthProvider>
      </CartProvider>
    </QueryClientProvider>
  )
}

/**
 * Any route opened with `?asset=<key>` (e.g. shelby://drops/linen-camp?asset=tiktok-tryon)
 * records the creative asset that brought the shopper in, then tags the open cart.
 */
function AttributionListener() {
  const params = useGlobalSearchParams<{ asset?: string | string[] }>()
  const { syncAttribution } = useCart()
  const asset = Array.isArray(params.asset) ? params.asset[0] : params.asset

  useEffect(() => {
    if (!asset) return
    captureAttribution({ asset })
      .then(() => syncAttribution())
      .catch(() => undefined)
  }, [asset, syncAttribution])

  return null
}

/** Screen views for first-party analytics (docs/analytics.md). Restores stored attribution on launch. */
function ScreenTracker() {
  const pathname = usePathname()
  const params = useGlobalSearchParams<{ asset?: string | string[] }>()
  const asset = Array.isArray(params.asset) ? params.asset[0] : params.asset

  useEffect(() => {
    readAttribution()
      .then((a) => a && setAnalyticsContext(a))
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    trackScreen(pathname, { asset })
  }, [pathname, asset])

  return null
}

/** Tapping a "drop is live" push opens that drop. Payload: { release_handle } or { url }. */
function DropNotificationRouter() {
  const response = Notifications.useLastNotificationResponse()

  useEffect(() => {
    const data = response?.notification.request.content.data as
      | { release_handle?: string; url?: string }
      | undefined
    if (data?.release_handle) router.push(`/drops/${data.release_handle}`)
    else if (data?.url && data.url.startsWith("/")) router.push(data.url as never)
  }, [response])

  return null
}
