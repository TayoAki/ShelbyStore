import Ionicons from "@expo/vector-icons/Ionicons"
import { useQuery } from "@tanstack/react-query"
import { router, useLocalSearchParams } from "expo-router"
import { StyleSheet, View } from "react-native"

import { Button } from "@/components/button"
import { Screen } from "@/components/screen"
import { ErrorState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { Tile } from "@/components/tile"
import { colors, fonts, layout } from "@/constants/theme"
import { useCatalog } from "@/hooks/use-products"
import { formatMoney } from "@/lib/format"
import { sdk } from "@/lib/medusa"
import { editionOf, lineImage, lineMeta } from "@/lib/product"

/**
 * Order confirmation (APP_SPEC v8 V8.5 §8): a black band with the check, "Thank
 * you" and the order line, then the lines and totals on white. Edition lines
 * whose product prints numbers inside say so; a specific number is never shown.
 */
export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({ queryKey: ["order", id], queryFn: async () => (await sdk.store.order.retrieve(id!)).order, enabled: !!id })
  const catalog = useCatalog()
  const done = <Button title="Keep Shopping" variant="outline" onPress={() => router.replace("/")} />

  if (isLoading) {
    return (
      <Screen header={false} under="safe">
        <LoadingState />
      </Screen>
    )
  }
  if (error || !order) {
    return (
      <Screen header={false} under="safe">
        <Band title="Thank you" line="Your order is in. We couldn't load the details just now; you'll get a confirmation email." />
        <View style={styles.body}>
          <ErrorState error={error} onRetry={() => refetch()} />
          {done}
        </View>
      </Screen>
    )
  }

  const currency = order.currency_code
  const a = order.shipping_address
  const first = a?.first_name ?? ""
  return (
    <Screen header={false} under="safe">
      <Band
        title={`Thank you${first ? `, ${first}` : ""}`}
        line={`Order No. ${order.display_id} is confirmed. We've sent a confirmation to ${order.email} and will email again when it ships.`}
      />
      <View style={styles.body}>
        <View>
          {(order.items ?? []).map((item) => {
            const image = lineImage(catalog.data, item)
            const product = catalog.data?.find((p) => p.id === item.product_id)
            const edition = editionOf(product)
            return (
              <View key={item.id} style={styles.line}>
                <View style={styles.tile}>
                  <Tile source={image} aspectRatio={92 / 110} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.title} numberOfLines={2}>
                    {item.product_title ?? item.title}
                  </Text>
                  <Text variant="meta" tone="muted">
                    {[lineMeta(product, item), `Qty ${item.quantity}`].filter(Boolean).join(" · ")}
                  </Text>
                  {edition && edition.hole >= 2 && edition.numberedInside ? (
                    <Text variant="meta" tone="muted">
                      Your edition number is printed inside the cap.
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.amount}>{formatMoney(item.total, currency)}</Text>
              </View>
            )
          })}
        </View>
        <View style={styles.totals}>
          <Row label="Subtotal" value={formatMoney(order.item_subtotal, currency)} />
          <Row label="Shipping" value={order.shipping_total === 0 ? "Free" : formatMoney(order.shipping_total, currency)} />
          <Row label="Tax" value={formatMoney(order.tax_total, currency)} />
          <View style={[styles.row, styles.totalRow]}>
            <Text variant="labelCaps">Total</Text>
            <Text style={styles.total}>{formatMoney(order.total, currency)}</Text>
          </View>
        </View>

        {a ? (
          <View style={styles.address}>
            <Text variant="labelCaps">Shipping to</Text>
            <Text variant="bodyPdp">
              {[a.first_name, a.last_name].filter(Boolean).join(" ")}
              {"\n"}
              {[a.address_1, a.address_2].filter(Boolean).join(", ")}
              {"\n"}
              {[a.city, a.province, a.postal_code].filter(Boolean).join(" ")}
            </Text>
          </View>
        ) : null}
        {done}
      </View>
    </Screen>
  )
}

function Band({ title, line }: { title: string; line: string }) {
  return (
    <View style={styles.band}>
      <Ionicons name="checkmark-circle" size={40} color={colors.onInk} />
      <Text variant="titlePage" tone="inverse" accessibilityRole="header" style={styles.center}>
        {title}
      </Text>
      <Text style={styles.bandLine}>{line}</Text>
    </View>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="meta" tone="muted">
        {label}
      </Text>
      <Text variant="meta">{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { textAlign: "center" },
  band: { backgroundColor: colors.ink, paddingVertical: 32, paddingHorizontal: 16, alignItems: "center", gap: 12 },
  bandLine: { fontFamily: fonts.body, fontSize: 14.4, lineHeight: 20, color: colors.onInk, textAlign: "center" },
  body: { paddingHorizontal: layout.edge, paddingTop: 8, paddingBottom: 48, gap: 24 },
  line: { flexDirection: "row", gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: "flex-start" },
  tile: { width: 72 },
  flex: { flex: 1, gap: 4 },
  title: { fontFamily: fonts.bodyMedium, fontSize: 14.4, lineHeight: 18, color: colors.text },
  amount: { fontFamily: fonts.body, fontSize: 14.4, lineHeight: 18, color: colors.text, fontVariant: ["tabular-nums"] },
  totals: { gap: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 4 },
  total: { fontFamily: fonts.bodyMedium, fontSize: 21.6, lineHeight: 26, color: colors.text, fontVariant: ["tabular-nums"] },
  address: { gap: 6 },
})
