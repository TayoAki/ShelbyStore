import { useQuery } from "@tanstack/react-query"
import { Image } from "expo-image"
import { router, useLocalSearchParams } from "expo-router"
import { StyleSheet, View } from "react-native"

import { Button } from "@/components/button"
import { Screen } from "@/components/screen"
import { ErrorState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { colors, radius, spacing } from "@/constants/theme"
import { formatMoney } from "@/lib/format"
import { sdk } from "@/lib/medusa"

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => (await sdk.store.order.retrieve(id!)).order,
    enabled: !!id,
  })

  const done = (
    <Button title="Keep shopping" variant="secondary" onPress={() => router.replace("/")} />
  )

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
          <Text variant="title">Thanks, your order is in</Text>
          <Text tone="muted">We couldn't load the details just now. You'll get a confirmation email.</Text>
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
          <Text variant="eyebrow" tone="accent">
            Order #{order.display_id}
          </Text>
          <Text variant="display">Thank you.</Text>
          <Text tone="muted">
            We've sent a confirmation to {order.email}. We'll email again when it ships.
          </Text>
        </View>

        <View style={styles.card}>
          {(order.items ?? []).map((item) => (
            <View key={item.id} style={styles.line}>
              <Image source={item.thumbnail ?? undefined} style={styles.thumb} contentFit="cover" />
              <View style={styles.flex}>
                <Text variant="bodyStrong" numberOfLines={2}>
                  {item.product_title ?? item.title}
                </Text>
                <Text variant="small" tone="muted">
                  {[item.variant_title, `Qty ${item.quantity}`].filter(Boolean).join(" · ")}
                </Text>
              </View>
              <Text variant="bodyStrong">{formatMoney(item.total, currency)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <Row label="Subtotal" value={formatMoney(order.item_subtotal, currency)} />
          <Row label="Shipping" value={formatMoney(order.shipping_total, currency)} />
          <Row label="Tax" value={formatMoney(order.tax_total, currency)} />
          <Row label="Total" value={formatMoney(order.total, currency)} strong />
        </View>

        {a ? (
          <View style={styles.card}>
            <Text variant="eyebrow" tone="muted">
              Shipping to
            </Text>
            <Text>
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
      <Text variant={strong ? "bodyStrong" : "small"} tone={strong ? "default" : "muted"}>
        {label}
      </Text>
      <Text variant={strong ? "bodyStrong" : "small"} tone={strong ? "default" : "muted"}>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  body: { padding: spacing.xl, gap: spacing.xl },
  hero: { gap: spacing.sm },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  line: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  thumb: { width: 56, height: 70, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  flex: { flex: 1, gap: spacing.xxs },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  row: { flexDirection: "row", justifyContent: "space-between" },
})
