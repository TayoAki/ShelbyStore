import { ActivityIndicator, StyleSheet, View } from "react-native"

import { colors, spacing } from "@/constants/theme"
import { errorMessage } from "@/lib/medusa"

import { Button } from "./button"
import { Text } from "./text"

export function LoadingState({ label }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.textMuted} />
      {label ? (
        <Text variant="small" tone="muted">
          {label}
        </Text>
      ) : null}
    </View>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text variant="heading">We couldn't load this</Text>
      <Text tone="muted" style={styles.copy}>
        {errorMessage(error)}
      </Text>
      {onRetry ? <Button title="Try again" variant="secondary" size="sm" onPress={onRetry} /> : null}
    </View>
  )
}

export function EmptyState({
  title,
  body,
  actionTitle,
  onAction,
}: {
  title: string
  body?: string
  actionTitle?: string
  onAction?: () => void
}) {
  return (
    <View style={styles.center}>
      <Text variant="heading">{title}</Text>
      {body ? (
        <Text tone="muted" style={styles.copy}>
          {body}
        </Text>
      ) : null}
      {actionTitle && onAction ? <Button title={actionTitle} onPress={onAction} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  copy: { textAlign: "center" },
})
