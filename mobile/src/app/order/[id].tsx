import Ionicons from "@expo/vector-icons/Ionicons"
import { useQuery } from "@tanstack/react-query"
import { Image } from "expo-image"
import { router, useLocalSearchParams } from "expo-router"
import { StyleSheet, View } from "react-native"

import { Button } from "@/components/button"
import { Screen } from "@/components/screen"
import { ErrorState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { colors, fonts, radius } from "@/constants/theme"
import { useCatalog } from "@/hooks/use-products"
import { formatMoney } from "@/lib/format"
import { sdk } from "@/lib/medusa"
import { lineImage } from "@/lib/product"

/** Order confirmation (APP_SPEC §5.7). */
export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => (await sdk.store.order.retrieve(id!)).order,
    enabled: !!id,
  })

  const catalog = useCatalog()
  const done = <Button title="Keep shopping" variant="light" onPress={() => router.replace("/")} />

  if (isLoading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    )
  }
  if (error || !order) {
    return (
      <Screen>
        <View style={styles.body}>
          <Text style={styles.thanks}>Thank You</Text>
          <Text variant="bodySm" tone="muted">
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
  return (
    <Screen edges={["bottom"]}>
      <View style={styles.body}>
        <View style={styles.hero}>
          <Ionicons name="checkmark-circle" size={48} color={colors.inStock} />
          <Text style={styles.thanks}>Thank You</Text>
          <Text variant="eyebrow" tone="muted">
            Order #{order.display_id}
          </Text>
          <Text variant="bodySm" style={styles.center}>
            We&apos;ve sent a confirmation to {order.email}. We&apos;ll email again when it ships.
          </Text>
        </View>

        <View style={styles.block}>
          {(order.items ?? []).map((item) => {
            const image = lineImage(catalog.data, item)
            return (
              <View key={item.id} style={styles.line}>
                {image ? <Image source={image} style={styles.thumb} contentFit="contain" /> : <View style={styles.thumb} />}
                <View style={styles.flex}>
                  <Text style={styles.lineTitle} numberOfLines={2}>
                    {item.product_title ?? item.title}
                  </Text>
                  <Text variant="micro" tone="muted">
                    {[item.variant_title, `Qty ${item.quantity}`].filter(Boolean).join(" · ")}
                  </Text>
                </View>
                <Text variant="bodySm">{formatMoney(item.total, currency)}</Text>
              </View>
            )
          })}
          <View style={styles.divider} />
          <Row label="Subtotal" value={formatMoney(order.item_subtotal, currency)} />
          <Row label="Shipping" value={formatMoney(order.shipping_total, currency)} />
          <Row label="Tax" value={formatMoney(order.tax_total, currency)} />
          <Row label="Total" value={formatMoney(order.total, currency)} strong />
        </View>

        {a ? (
          <View style={styles.block}>
            <Text style={styles.label}>Shipping To</Text>
            <Text variant="bodySm">
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
      <Text style={strong ? styles.total : undefined} variant="bodySm" tone={strong ? "default" : "muted"}>
        {label}
      </Text>
      <Text style={strong ? styles.total : undefined} variant="bodySm" tone={strong ? "default" : "muted"}>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 24 },
  hero: { alignItems: "center", gap: 8, paddingTop: 16 },
  center: { textAlign: "center" },
  thanks: { fontFamily: fonts.heading, fontSize: 26, lineHeight: 39, textTransform: "uppercase", color: colors.text },
  block: { padding: 16, gap: 12, backgroundColor: colors.tile },
  line: { flexDirection: "row", gap: 12, alignItems: "center" },
  thumb: { width: 64, height: 64, borderRadius: radius.addon, backgroundColor: colors.secondary },
  lineTitle: { fontFamily: fonts.subheading, fontSize: 14.08, lineHeight: 21, color: colors.text },
  flex: { flex: 1, gap: 2 },
  divider: { height: 1, backgroundColor: colors.line },
  row: { flexDirection: "row", justifyContent: "space-between" },
  total: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 23.4 },
  label: { fontFamily: fonts.heading, fontSize: 12, lineHeight: 18, letterSpacing: 1.3, textTransform: "uppercase", color: colors.text },
})
