import { Inter_400Regular } from "@expo-google-fonts/inter"
import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useFonts } from "expo-font"
import * as Notifications from "expo-notifications"
import { router, Stack, useGlobalSearchParams, usePathname } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import { Platform } from "react-native"

import { colors, fonts } from "@/constants/theme"
import { setAnalyticsContext, trackScreen } from "@/lib/analytics"
import { captureAttribution, readAttribution } from "@/lib/attribution"
import { AddedSheetProvider } from "@/providers/added-sheet-provider"
import { AuthProvider } from "@/providers/auth-provider"
import { CartProvider, useCart } from "@/providers/cart-provider"

SplashScreen.preventAutoHideAsync().catch(() => undefined)

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
  // The spec's families (APP_SPEC §2): Plus Jakarta Sans for Avenir's heading
  // weights, Inter for Avenir Book. Keep the splash until they load.
  const [loaded, error] = useFonts({
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Inter_400Regular,
  })
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => undefined)
  }, [loaded, error])
  if (!loaded && !error) return null

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <AuthProvider>
          <AddedSheetProvider>
            <AttributionListener />
            <ScreenTracker />
            {Platform.OS !== "web" ? <DropNotificationRouter /> : null}
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text,
                headerShadowVisible: true,
                headerBackButtonDisplayMode: "minimal",
                headerTitleStyle: { fontFamily: fonts.heading, fontSize: 14 },
                contentStyle: { backgroundColor: colors.background },
              }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Shelby" }} />
              <Stack.Screen name="drops/[handle]" options={{ title: "" }} />
              <Stack.Screen name="products/[handle]" options={{ title: "" }} />
              <Stack.Screen name="checkout" options={{ title: "CHECKOUT" }} />
              <Stack.Screen
                name="order/[id]"
                options={{ title: "ORDER", headerBackVisible: false, gestureEnabled: false }}
              />
            </Stack>
          </AddedSheetProvider>
        </AuthProvider>
      </CartProvider>
    </QueryClientProvider>
  )
}

/**
 * Any route opened with `?asset=<key>` (e.g. shelby://drops/corduroy-cap?asset=tiktok-tryon)
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
