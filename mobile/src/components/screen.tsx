import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import { SafeAreaView, type Edge } from "react-native-safe-area-context"

import { colors, MAX_CONTENT_WIDTH } from "@/constants/theme"

/**
 * Standard page: white, an optional fixed header above the scroll (the app
 * header), a centred column on wide screens and optional pull-to-refresh.
 */
export function Screen({
  children,
  edges = [],
  header,
  refreshing,
  onRefresh,
  onScrollY,
  scroll = true,
  background = colors.background,
  contentStyle,
  footer,
  overlay,
  scrollRef,
}: {
  children: React.ReactNode
  edges?: Edge[]
  header?: React.ReactNode
  refreshing?: boolean
  onRefresh?: () => void
  onScrollY?: (y: number) => void
  scroll?: boolean
  background?: string
  contentStyle?: StyleProp<ViewStyle>
  footer?: React.ReactNode
  /** Rendered over the scroll area (e.g. the sticky buy bar). */
  overlay?: React.ReactNode
  scrollRef?: React.Ref<React.ComponentRef<typeof ScrollView>>
}) {
  const body = <View style={[styles.column, contentStyle]}>{children}</View>
  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: background }]}>
      {header}
      <View style={styles.flex}>
        {scroll ? (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={32}
            onScroll={
              onScrollY
                ? (e: NativeSyntheticEvent<NativeScrollEvent>) => onScrollY(e.nativeEvent.contentOffset.y)
                : undefined
            }
            refreshControl={
              onRefresh ? (
                <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.textMuted} />
              ) : undefined
            }>
            {body}
          </ScrollView>
        ) : (
          body
        )}
        {overlay}
      </View>
      {footer}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  column: { width: "100%", maxWidth: MAX_CONTENT_WIDTH, alignSelf: "center" },
})
