import { RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
import { SafeAreaView, type Edge } from "react-native-safe-area-context"

import { colors, MAX_CONTENT_WIDTH, spacing } from "@/constants/theme"

/**
 * Standard scrolling page: off-white background, centered column on wide screens,
 * optional pull-to-refresh. Tab screens pass edges={["top"]} since they have no header.
 */
export function Screen({
  children,
  edges = [],
  refreshing,
  onRefresh,
  scroll = true,
  contentStyle,
  footer,
}: {
  children: React.ReactNode
  edges?: Edge[]
  refreshing?: boolean
  onRefresh?: () => void
  scroll?: boolean
  contentStyle?: StyleProp<ViewStyle>
  footer?: React.ReactNode
}) {
  const body = <View style={[styles.column, contentStyle]}>{children}</View>
  return (
    <SafeAreaView edges={edges} style={styles.root}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
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
      {footer}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xxxl },
  column: { width: "100%", maxWidth: MAX_CONTENT_WIDTH, alignSelf: "center" },
})
