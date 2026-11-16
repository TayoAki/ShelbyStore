import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
import Animated, { type AnimatedRef } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { colors, layout, MAX_CONTENT_WIDTH } from "@/constants/theme"
import { RevealScrollView } from "@/lib/motion"

import { Ticker } from "./announcement-bar"
import { AppHeader, useHeaderInset } from "./app-header"

/**
 * A v5 page: the natural-white background, an optional ticker (Home) and the
 * floating header pill, and a scroll view that drives the reveal motion.
 * `under="pill"` starts content under the pill; `under="ticker"` lets a hero
 * sit 10pt under the ticker so the pill floats over the photo.
 */
export function Screen({
  children,
  header = true,
  ticker = false,
  under = "pill",
  scroll = true,
  refreshing,
  onRefresh,
  onScrollY,
  overlay,
  footer,
  scrollRef,
  contentStyle,
  background = colors.page,
  back = false,
}: {
  children: React.ReactNode
  header?: boolean
  ticker?: boolean
  under?: "pill" | "ticker" | "safe"
  scroll?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  onScrollY?: (y: number) => void
  overlay?: React.ReactNode
  footer?: React.ReactNode
  scrollRef?: AnimatedRef<Animated.ScrollView>
  contentStyle?: StyleProp<ViewStyle>
  background?: string
  /** Stack screens show a back chevron in the pill. */
  back?: boolean
}) {
  const insets = useSafeAreaInsets()
  const pillInset = useHeaderInset(ticker)
  const top =
    under === "pill" && header ? pillInset - (ticker ? layout.ticker + insets.top : 0) : under === "ticker" ? 10 : insets.top + 10
  const body = <View style={[styles.column, { paddingTop: top }, contentStyle]}>{children}</View>
  return (
    <View style={[styles.root, { backgroundColor: background }]}>
      {ticker ? (
        <View style={{ paddingTop: insets.top, backgroundColor: colors.black }}>
          <Ticker />
        </View>
      ) : null}
      <View style={styles.flex}>
        {scroll ? (
          <RevealScrollView
            scrollRef={scrollRef}
            onScrollY={onScrollY}
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={styles.scrollContent}>
            {body}
          </RevealScrollView>
        ) : (
          body
        )}
        {overlay}
      </View>
      {footer}
      {header ? <AppHeader belowTicker={ticker} back={back} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  column: { width: "100%", maxWidth: MAX_CONTENT_WIDTH, alignSelf: "center" },
})
