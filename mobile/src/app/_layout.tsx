import { SofiaSans_400Regular, SofiaSans_500Medium, SofiaSans_600SemiBold, SofiaSans_700Bold } from "@expo-google-fonts/sofia-sans"
import { SofiaSansExtraCondensed_700Bold, SofiaSansExtraCondensed_800ExtraBold } from "@expo-google-fonts/sofia-sans-extra-condensed"
import { SofiaSansSemiCondensed_600SemiBold, SofiaSansSemiCondensed_700Bold } from "@expo-google-fonts/sofia-sans-semi-condensed"
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

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  })
}

export default function RootLayout() {
  // APP_SPEC v7: one superfamily, as a box's print is set. Extra Condensed for
  // model names and numerals, Semi Condensed for labels, Sofia Sans for copy.
  // Keep the splash until all load.
  const [loaded, error] = useFonts({
    SofiaSans_400Regular,
    SofiaSans_500Medium,
    SofiaSans_600SemiBold,
    SofiaSans_700Bold,
    SofiaSansSemiCondensed_600SemiBold,
    SofiaSansSemiCondensed_700Bold,
    SofiaSansExtraCondensed_700Bold,
    SofiaSansExtraCondensed_800ExtraBold,
  })
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => undefined)
  }, [loaded, error])
  if (!loaded && !error) return null

  const plain = { headerShown: false, contentStyle: { backgroundColor: colors.page } }
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <AuthProvider>
          <AddedSheetProvider>
            <AttributionListener />
            <ScreenTracker />
            {Platform.OS !== "web" ? <HoleNotificationRouter /> : null}
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.page },
                headerTintColor: colors.black,
                headerShadowVisible: false,
                headerBackButtonDisplayMode: "minimal",
                headerTitleStyle: { fontFamily: fonts.label, fontSize: 15 },
                contentStyle: { backgroundColor: colors.page },
              }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Shelby" }} />
              <Stack.Screen name="products/[handle]" options={plain} />
              <Stack.Screen name="offer/[handle]" options={plain} />
              <Stack.Screen name="card/[handle]" options={plain} />
              <Stack.Screen name="custom" options={plain} />
              <Stack.Screen name="drops/index" options={plain} />
              <Stack.Screen name="drops/[handle]" options={plain} />
              <Stack.Screen name="checkout" options={{ title: "CHECKOUT" }} />
              <Stack.Screen name="order/[id]" options={{ title: "ORDER", headerBackVisible: false, gestureEnabled: false }} />
            </Stack>
          </AddedSheetProvider>
        </AuthProvider>
      </CartProvider>
    </QueryClientProvider>
  )
}

/**
 * Any route opened with `?asset=<key>` (e.g. shelby://card/rope-cap-azalea?asset=tiktok-1)
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

/**
 * Tapping a hole's release push opens that hole. The push is sent at the
 * hole's real release time, the same moment the web goes live (G.1 rule 3).
 * Payload: { release_handle } or { url }.
 */
function HoleNotificationRouter() {
  const response = Notifications.useLastNotificationResponse()

  useEffect(() => {
    const data = response?.notification.request.content.data as { release_handle?: string; url?: string } | undefined
    if (data?.release_handle) router.push(`/card/${data.release_handle}`)
    else if (data?.url && data.url.startsWith("/")) router.push(data.url as never)
  }, [response])

  return null
}
