import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
import Animated, { type AnimatedRef } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { colors, MAX_CONTENT_WIDTH } from "@/constants/theme"
import { RevealScrollView } from "@/lib/motion"

import { Announcement } from "./announcement-bar"
import { AppHeader } from "./app-header"

/**
 * A v7 screen: white board, the announcement line (Home) and the header bar
 * as the box's top flap, laid out in the flow above the content (never
 * floating over it), and a scroll view that drives the box's motion.
 */
export function Screen({
  children,
  header = true,
  ticker = false,
  under: _under = "pill",
  scroll = true,
  refreshing,
  onRefresh,
  onScrollY,
  overlay,
  footer,
  scrollRef,
  contentStyle,
  background = colors.board,
  back = false,
}: {
  children: React.ReactNode
  header?: boolean
  ticker?: boolean
  /** v6 option kept for call sites; content always starts 12pt under the header. */
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
  /** Stack screens show a back chevron in the header. */
  back?: boolean
}) {
  const insets = useSafeAreaInsets()
  const body = <View style={[styles.column, contentStyle]}>{children}</View>
  return (
    <View style={[styles.root, { backgroundColor: background }]}>
      <View style={{ paddingTop: insets.top, backgroundColor: ticker ? colors.ink : header ? colors.paper : background }}>
        {ticker ? <Announcement /> : null}
      </View>
      {header ? <AppHeader back={back} /> : null}
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
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingTop: 12, paddingBottom: 48 },
  column: { width: "100%", maxWidth: MAX_CONTENT_WIDTH, alignSelf: "center" },
})
