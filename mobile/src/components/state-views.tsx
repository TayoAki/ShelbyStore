import Ionicons from "@expo/vector-icons/Ionicons"
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"

import { colors } from "@/constants/theme"
import { errorMessage } from "@/lib/medusa"

import { Button } from "./button"
import { Text } from "./text"

/** Loading skeletons are flat #F6F6F6 blocks with no shimmer (APP_SPEC v8 V8.3). */
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.skeleton, style]} />
}

export function LoadingState() {
  return (
    <View style={styles.loading} accessibilityLabel="Loading">
      <Skeleton style={{ height: 240 }} />
      <Skeleton style={{ height: 20, width: "60%" }} />
      <Skeleton style={{ height: 16, width: "40%" }} />
    </View>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text variant="titleCard" accessibilityRole="header" style={styles.text}>
        We couldn&apos;t load this.
      </Text>
      <Text variant="bodyPdp" tone="muted" style={styles.text}>
        {errorMessage(error)}
      </Text>
      {onRetry ? <Button title="Try again" variant="secondary" onPress={onRetry} style={styles.action} /> : null}
    </View>
  )
}

export function EmptyState({
  icon,
  title,
  body,
  actionTitle,
  onAction,
}: {
  icon?: React.ComponentProps<typeof Ionicons>["name"]
  title: string
  body?: string
  actionTitle?: string
  onAction?: () => void
}) {
  return (
    <View style={styles.center}>
      {icon ? <Ionicons name={icon} size={32} color={colors.text} /> : null}
      <Text variant="titleCard" accessibilityRole="header" style={styles.text}>
        {title}
      </Text>
      {body ? (
        <Text variant="bodyPdp" tone="muted" style={styles.text}>
          {body}
        </Text>
      ) : null}
      {actionTitle && onAction ? <Button title={actionTitle} variant="secondary" onPress={onAction} style={styles.action} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: { backgroundColor: colors.tile, height: 16 },
  loading: { padding: 12, gap: 12 },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 40, paddingHorizontal: 24, gap: 14 },
  text: { textAlign: "center" },
  action: { alignSelf: "stretch" },
})
