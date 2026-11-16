import { StyleSheet, View } from "react-native"

import type { StockState } from "@/lib/product"
import { POLICY } from "@/lib/policy"

import { EditionBadge } from "./edition-badge"
import { Text } from "./text"

/**
 * Live stock (APP_SPEC v8 V8.3): a #646464 meta line from live stock only
 * ("In stock · ships in 1–2 business days", "Only 3 left"); sold out shows the
 * dark badge.
 */
export function StockLine({ state, quantity, inverse = false }: { state: StockState; quantity: number | null; inverse?: boolean }) {
  if (state === "sold_out") return <EditionBadge size={null} label="Sold out" dark />
  const label = state === "in_stock" ? `In stock · ${POLICY.dispatch.toLowerCase()}` : `Only ${quantity} left`
  return (
    <View style={styles.row} accessibilityLiveRegion="polite">
      <Text variant="meta" tone={inverse ? "onInk" : "muted"}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center" } })
