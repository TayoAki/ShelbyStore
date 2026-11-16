import { StatusBar } from "expo-status-bar"
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
import Animated, { type AnimatedRef } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { colors, MAX_CONTENT_WIDTH } from "@/constants/theme"
import { PageScrollView } from "@/lib/motion"

import { Announcement } from "./announcement-bar"
import { AppHeader } from "./app-header"

/**
 * A v8 screen: white. On Home (`ticker`) the black announcement strip and the
 * header scroll with the page and the header pins once the strip has gone
 * (sticky header index), as Eastside's sticky header does; the status bar is
 * light over the black strip. Elsewhere the header is fixed above the content.
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
  background = colors.bg,
  back = false,
}: {
  children: React.ReactNode
  header?: boolean
  ticker?: boolean
  /** v6 option kept for call sites. */
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
  const pinned = ticker && header && scroll
  return (
    <View style={[styles.root, { backgroundColor: background }]}>
      <StatusBar style={ticker ? "light" : "dark"} />
      <View style={{ height: insets.top, backgroundColor: ticker ? colors.ink : colors.white }} />
      {!pinned && ticker ? <Announcement /> : null}
      {!pinned && header ? <AppHeader back={back} /> : null}
      <View style={styles.flex}>
        {scroll ? (
          <PageScrollView
            scrollRef={scrollRef}
            onScrollY={onScrollY}
            refreshing={refreshing}
            onRefresh={onRefresh}
            stickyHeaderIndices={pinned ? [1] : undefined}
            contentContainerStyle={styles.scrollContent}>
            {pinned ? <Announcement /> : null}
            {pinned ? <AppHeader back={back} /> : null}
            {body}
          </PageScrollView>
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
  scrollContent: { paddingBottom: 0 },
  column: { width: "100%", maxWidth: MAX_CONTENT_WIDTH, alignSelf: "center" },
})
