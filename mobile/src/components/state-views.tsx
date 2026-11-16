import Ionicons from "@expo/vector-icons/Ionicons"
import { useEffect } from "react"
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated"

import { colors, ease, motion } from "@/constants/theme"
import { errorMessage } from "@/lib/medusa"

import { Button } from "./button"
import { Text } from "./text"

/** M30: the 2s skeleton pulse. */
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const o = useSharedValue(1)
  useEffect(() => {
    o.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1000, easing: ease.tailwind, reduceMotion: motion.reduceMotion }),
        withTiming(1, { duration: 1000, easing: ease.tailwind, reduceMotion: motion.reduceMotion })
      ),
      -1
    )
  }, [o])
  const s = useAnimatedStyle(() => ({ opacity: o.value }))
  return <Animated.View style={[styles.skeleton, style, s]} />
}

export function LoadingState() {
  return (
    <View style={styles.loading} accessibilityLabel="Loading">
      <Skeleton style={{ height: 240, borderRadius: 28 }} />
      <Skeleton style={{ height: 20, width: "60%" }} />
      <Skeleton style={{ height: 16, width: "40%" }} />
    </View>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text variant="panelTitle" accessibilityRole="header" style={styles.text}>
        We couldn&apos;t load this.
      </Text>
      <Text variant="meta" tone="muted" style={styles.text}>
        {errorMessage(error)}
      </Text>
      {onRetry ? <Button title="Try again" variant="outlineBlack" onPress={onRetry} style={styles.action} /> : null}
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
      {icon ? <Ionicons name={icon} size={36} color={colors.ink} /> : null}
      <Text variant="panelTitle" accessibilityRole="header" style={styles.text}>
        {title}
      </Text>
      {body ? (
        <Text variant="body" tone="muted" style={styles.text}>
          {body}
        </Text>
      ) : null}
      {actionTitle && onAction ? <Button title={actionTitle} onPress={onAction} style={styles.action} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: { backgroundColor: colors.wash, height: 16 },
  loading: { padding: 12, gap: 12 },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 40, paddingHorizontal: 24, gap: 16 },
  text: { textAlign: "center" },
  action: { alignSelf: "stretch" },
})
