import Ionicons from "@expo/vector-icons/Ionicons"
import { ActivityIndicator, StyleSheet, View } from "react-native"

import { colors, fonts } from "@/constants/theme"
import { errorMessage } from "@/lib/medusa"

import { Button } from "./button"
import { Text } from "./text"

type IconName = React.ComponentProps<typeof Ionicons>["name"]

export function LoadingState({ label }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.text} />
      {label ? (
        <Text variant="micro" tone="muted">
          {label}
        </Text>
      ) : null}
    </View>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>We Couldn&apos;t Load This</Text>
      <Text variant="bodySm" tone="muted" style={styles.copy}>
        {errorMessage(error)}
      </Text>
      {onRetry ? <Button title="Try again" variant="light" onPress={onRetry} /> : null}
    </View>
  )
}

export function EmptyState({
  title,
  body,
  icon,
  actionTitle,
  onAction,
}: {
  title: string
  body?: string
  icon?: IconName
  actionTitle?: string
  onAction?: () => void
}) {
  return (
    <View style={styles.center}>
      {icon ? <Ionicons name={icon} size={48} color={colors.text} /> : null}
      <Text style={styles.title}>{title}</Text>
      {body ? (
        <Text variant="bodySm" tone="muted" style={styles.copy}>
          {body}
        </Text>
      ) : null}
      {actionTitle && onAction ? <Button title={actionTitle} onPress={onAction} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 48, paddingHorizontal: 24, gap: 12 },
  title: { fontFamily: fonts.heading, fontSize: 16, lineHeight: 24, color: colors.text, textAlign: "center" },
  copy: { textAlign: "center" },
})
