import type { HttpTypes } from "@medusajs/types"
import { Image } from "expo-image"
import { router } from "expo-router"
import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { Button } from "@/components/button"
import { QuantityStepper } from "@/components/quantity-stepper"
import { Screen } from "@/components/screen"
import { EmptyState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { colors, radius, spacing } from "@/constants/theme"
import { formatMoney } from "@/lib/format"
import { errorMessage } from "@/lib/medusa"
import { useCart } from "@/providers/cart-provider"

export default function CartScreen() {
  const { cart, isLoading, isMutating, updateItem, refresh } = useCart()
  const [error, setError] = useState<string | null>(null)
  const items = [...(cart?.items ?? [])].sort((a, b) =>
    String(a.created_at ?? "").localeCompare(String(b.created_at ?? ""))
  )
  const currency = cart?.currency_code ?? "usd"

  const change = async (lineId: string, quantity: number) => {
    setError(null)
    try {
      await updateItem(lineId, quantity)
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  if (isLoading) {
    return (
      <Screen edges={["top"]}>
        <LoadingState />
      </Screen>
    )
  }

  if (!items.length) {
    return (
      <Screen edges={["top"]} onRefresh={() => refresh()} refreshing={false}>
        <View style={styles.header}>
          <Text variant="display">Bag</Text>
        </View>
        <EmptyState
          title="Your bag is empty"
          body="Start with the core. It's always in stock."
          actionTitle="Shop the core"
          onAction={() => router.push("/shop")}
        />
      </Screen>
    )
  }

  return (
    <Screen
      edges={["top"]}
      footer={
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text variant="bodyStrong">Subtotal</Text>
            <Text variant="bodyStrong">{formatMoney(cart?.item_subtotal ?? cart?.subtotal ?? 0, currency)}</Text>
          </View>
          <Text variant="small" tone="muted">
            Shipping and taxes are calculated at checkout.
          </Text>
          <Button title="Checkout" onPress={() => router.push("/checkout")} disabled={isMutating} />
        </View>
      }>
      <View style={styles.header}>
        <Text variant="display">Bag</Text>
        <Text tone="muted">{itemLabel(items.reduce((n, i) => n + i.quantity, 0))}</Text>
      </View>
      {error ? (
        <Text tone="danger" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <View style={styles.lines}>
        {items.map((item) => (
          <CartLine
            key={item.id}
            item={item}
            currency={currency}
            disabled={isMutating}
            onChange={(q) => change(item.id, q)}
          />
        ))}
      </View>
    </Screen>
  )
}

const itemLabel = (n: number) => `${n} item${n === 1 ? "" : "s"}`

function CartLine({
  item,
  currency,
  disabled,
  onChange,
}: {
  item: HttpTypes.StoreCartLineItem
  currency: string
  disabled: boolean
  onChange: (quantity: number) => void
}) {
  const handle = item.product_handle
  return (
    <View style={styles.line}>
      <Pressable
        accessibilityRole="link"
        disabled={!handle}
        onPress={() => handle && router.push(`/products/${handle}`)}>
        <Image source={item.thumbnail} style={styles.thumb} contentFit="cover" />
      </Pressable>
      <View style={styles.lineBody}>
        <View style={styles.lineTop}>
          <View style={styles.flex}>
            <Text variant="bodyStrong" numberOfLines={2}>
              {item.product_title ?? item.title}
            </Text>
            {item.variant_title ? (
              <Text variant="small" tone="muted">
                {item.variant_title}
              </Text>
            ) : null}
          </View>
          <Text variant="bodyStrong">{formatMoney(item.total ?? item.unit_price * item.quantity, currency)}</Text>
        </View>
        <View style={styles.lineBottom}>
          <QuantityStepper value={item.quantity} onChange={onChange} min={1} max={10} disabled={disabled} />
          <Pressable accessibilityRole="button" onPress={() => onChange(0)} disabled={disabled} hitSlop={8}>
            <Text variant="small" tone="muted" style={styles.remove}>
              Remove
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.xs },
  error: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  lines: { paddingHorizontal: spacing.xl, gap: spacing.xl },
  line: { flexDirection: "row", gap: spacing.lg },
  thumb: { width: 88, height: 110, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  lineBody: { flex: 1, justifyContent: "space-between", gap: spacing.md },
  lineTop: { flexDirection: "row", gap: spacing.md },
  lineBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  flex: { flex: 1, gap: spacing.xxs },
  remove: { textDecorationLine: "underline" },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
})
