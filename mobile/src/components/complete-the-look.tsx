import { FlatList, StyleSheet, View } from "react-native"

import { layout } from "@/constants/theme"
import { useQuickAdd } from "@/hooks/use-quick-add"
import { trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { confirmHaptic } from "@/lib/haptics"
import { imagesFor, productPrice, type Product } from "@/lib/product"

import { Button } from "./button"
import { MiniCard } from "./product-card"
import { Text } from "./text"

/**
 * Complete the look (APP_SPEC v8 V8.5 §6–7): other core colours as 140pt mini
 * cards with a kit "Add" button (`cart_complete_look`); `compact` lays two
 * side by side for the Added sheet.
 */
export function CompleteTheLook({ core, colours, compact = false }: { core: Product; colours: string[]; compact?: boolean }) {
  const quick = useQuickAdd()
  const price = productPrice(core)
  const cards = colours.map((c) => (
    <MiniCard
      key={c}
      style={compact ? styles.flex : styles.mini}
      image={imagesFor(core, c)[0] ?? null}
      title={`${c} Rope Cap`}
      price={price ? formatMoney(price.amount, price.currency) : null}
      action={
        <Button
          title="Add"
          variant="kit"
          loading={quick.pending !== null}
          accessibilityLabel={`Add ${c} to bag`}
          onPress={() => {
            trackTap("cart_complete_look", { color: c })
            confirmHaptic()
            void quick.addColour(core, c, "app_bag")
          }}
        />
      }
    />
  ))
  return (
    <View style={compact ? undefined : styles.section}>
      <Text variant="titleDrawer" accessibilityRole="header" style={compact ? styles.compactTitle : styles.lookTitle}>
        Complete the look
      </Text>
      {compact ? (
        <View style={styles.compactRow}>{cards}</View>
      ) : (
        <FlatList
          data={cards}
          horizontal
          keyExtractor={(_, i) => String(i)}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => item}
          contentContainerStyle={styles.lookRail}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: { paddingTop: 32, gap: 12 },
  lookTitle: { paddingHorizontal: layout.edge },
  lookRail: { paddingHorizontal: layout.railEdge, gap: 10 },
  mini: { width: 140 },
  compactTitle: { marginBottom: 10 },
  compactRow: { flexDirection: "row", gap: 10 },
})
