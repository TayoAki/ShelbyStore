import { Pressable, StyleSheet, View } from "react-native"

import { spacing } from "@/constants/theme"

import { Text } from "./text"

export function SectionHeader({
  eyebrow,
  title,
  actionTitle,
  onAction,
}: {
  eyebrow?: string
  title: string
  actionTitle?: string
  onAction?: () => void
}) {
  return (
    <View style={styles.row}>
      <View style={styles.titles}>
        {eyebrow ? (
          <Text variant="eyebrow" tone="muted">
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="title">{title}</Text>
      </View>
      {actionTitle && onAction ? (
        <Pressable accessibilityRole="link" onPress={onAction} hitSlop={8}>
          <Text variant="small" style={styles.action}>
            {actionTitle}
          </Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  titles: { flex: 1, gap: spacing.xs },
  action: { textDecorationLine: "underline", fontWeight: "600" },
})
