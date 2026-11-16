import { router } from "expo-router"
import { Pressable, StyleSheet, View } from "react-native"

import { colors } from "@/constants/theme"
import { useTickerItems, type TickerItem } from "@/hooks/use-holes"
import { trackTap } from "@/lib/analytics"

import { Text } from "./text"

/**
 * The announcement line (APP_SPEC v7 §4.1): one static line of at most three
 * real facts (the next hole and its date, live edition stock, the core cap)
 * printed white on navy. Nothing scrolls or loops; the first fact with a
 * destination opens it.
 */
export function Announcement() {
  const items = useTickerItems().slice(0, 3)
  if (!items.length) return null
  const lead = items.find((i) => i.href) ?? null
  const text = items.map((i) => i.text).join("  ·  ")
  return (
    <Pressable
      accessibilityRole={lead ? "link" : "text"}
      accessibilityLabel={text}
      disabled={!lead}
      onPress={() => lead && open(lead)}
      style={styles.bar}>
      <View style={styles.row}>
        <Text variant="announcement" tone="inverse" numberOfLines={1} style={styles.text}>
          {items[0].text}
        </Text>
      </View>
    </Pressable>
  )
}

/** v6 name kept for imports. */
export const Ticker = Announcement

function open(item: TickerItem) {
  trackTap("ticker_item", { item: item.key })
  if (item.href) router.push(item.href as never)
}

const styles = StyleSheet.create({
  bar: { minHeight: 44, backgroundColor: colors.ink, justifyContent: "center", paddingHorizontal: 12 },
  row: { flexDirection: "row", justifyContent: "center" },
  text: { textAlign: "center" },
})
