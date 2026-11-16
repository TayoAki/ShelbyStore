import { useQuery } from "@tanstack/react-query"
import { Image } from "expo-image"
import { router, useLocalSearchParams } from "expo-router"
import { StyleSheet, View } from "react-native"

import { Button } from "@/components/button"
import { Screen } from "@/components/screen"
import { ErrorState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { colors, radius } from "@/constants/theme"
import { useCatalog } from "@/hooks/use-products"
import { formatMoney } from "@/lib/format"
import { sdk } from "@/lib/medusa"
import { editionOf, lineImage, lineMeta } from "@/lib/product"

/**
 * Order confirmation (APP_SPEC v5 §5.1, G.5): a white radius-24 card. Edition
 * lines whose product prints numbers inside say so; a specific number is
 * never shown (G.1.5).
 */
export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => (await sdk.store.order.retrieve(id!)).order,
    enabled: !!id,
  })
  const catalog = useCatalog()
  const done = <Button title="Keep shopping" onPress={() => router.replace("/")} />

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
        <View style={styles.card}>
          <Text variant="eyebrow">Order confirmed</Text>
          <Text variant="body" tone="muted">
            Your order is in. We couldn&apos;t load the details just now; you&apos;ll get a confirmation email.
          </Text>
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
      <View style={styles.card}>
        <Text variant="eyebrow">Order confirmed · #{order.display_id}</Text>
        <Text variant="section">Thanks{first ? `, ${first}` : ""}.</Text>
        <Text variant="body" tone="muted">
          We&apos;ve sent a confirmation to {order.email}. We&apos;ll email again when it ships.
        </Text>

        <View style={styles.lines}>
          {(order.items ?? []).map((item) => {
            const image = lineImage(catalog.data, item)
            const product = catalog.data?.find((p) => p.id === item.product_id)
            const edition = editionOf(product)
            return (
              <View key={item.id} style={styles.line}>
                {image ? <Image source={image} style={styles.thumb} contentFit="contain" /> : <View style={styles.thumb} />}
                <View style={styles.flex}>
                  <Text variant="cardTitle" numberOfLines={2}>
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
                <Text variant="priceSm">{formatMoney(item.total, currency)}</Text>
              </View>
            )
          })}
        </View>
        <View style={styles.divider} />
        <Row label="Subtotal" value={formatMoney(order.item_subtotal, currency)} />
        <Row label="Shipping" value={order.shipping_total === 0 ? "Free" : formatMoney(order.shipping_total, currency)} />
        <Row label="Tax" value={formatMoney(order.tax_total, currency)} />
        <Row label="Total" value={formatMoney(order.total, currency)} strong />

        {a ? (
          <View style={styles.address}>
            <Text variant="label">Shipping to</Text>
            <Text variant="body">
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

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text variant={strong ? "cardTitle" : "body"} tone={strong ? "default" : "muted"}>
        {label}
      </Text>
      <Text variant={strong ? "price" : "body"} tone={strong ? "default" : "muted"}>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { margin: 10, backgroundColor: colors.white, borderRadius: radius.xxxl, padding: 24, gap: 14 },
  lines: { gap: 12, marginTop: 8 },
  line: { flexDirection: "row", gap: 12, alignItems: "center" },
  thumb: { width: 64, height: 64, borderRadius: radius.xl, backgroundColor: colors.naturalWhite25 },
  flex: { flex: 1, gap: 2 },
  divider: { height: 1, backgroundColor: colors.page },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  address: { gap: 6, marginTop: 8 },
})
