import type { HttpTypes } from "@medusajs/types"
import { router } from "expo-router"
import { useState } from "react"
import { FlatList, Pressable, StyleSheet, View } from "react-native"

import { BundleRows } from "@/components/bundle-rows"
import { Button } from "@/components/button"
import { EditionBadge } from "@/components/edition-badge"
import { FreeShippingProgress } from "@/components/free-shipping-progress"
import { CompleteTheLook } from "@/components/complete-the-look"
import { ColourwayCard } from "@/components/product-card"
import { QuantityStepper } from "@/components/quantity-stepper"
import { Screen } from "@/components/screen"
import { LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { Tile } from "@/components/tile"
import { colors, CORE_COLOURWAYS, fonts, layout } from "@/constants/theme"
import { useCatalog } from "@/hooks/use-products"
import { track, trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { errorMessage } from "@/lib/medusa"
import { POLICY } from "@/lib/policy"
import { colorCounts, editionOf, isOffer, lineImage, lineMeta, type Product } from "@/lib/product"
import { useCart } from "@/providers/cart-provider"

type Line = HttpTypes.StoreCartLineItem

/**
 * Bag (APP_SPEC v8 V8.5 §6, web E.6.4): the title, the true free-shipping
 * progress, the lines (92×110 tiles, 1pt #F0F0F0 rules), The Pair / The
 * Foursome when a single core cap is in the bag, Complete the look, and the
 * #F6F6F6 summary with Checkout.
 */
export default function CartScreen() {
  const { cart, isLoading, updateItem, refresh } = useCart()
  const catalog = useCatalog()
  const [error, setError] = useState<string | null>(null)
  const items = [...(cart?.items ?? [])].sort((a, b) => String(a.created_at ?? "").localeCompare(String(b.created_at ?? "")))
  const currency = cart?.currency_code ?? "usd"
  const core = catalog.data?.find((p) => p.handle === "rope-cap")
  const subtotal = Number(cart?.item_subtotal ?? cart?.subtotal ?? 0)
  const count = items.reduce((n, i) => n + i.quantity, 0)

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
      <Screen>
        <LoadingState />
      </Screen>
    )
  }

  if (!items.length) {
    return (
      <Screen onRefresh={() => refresh()} refreshing={false}>
        <View style={styles.head}>
          <Text variant="titlePage" accessibilityRole="header" style={styles.center}>
            Your bag
          </Text>
        </View>
        <View style={styles.empty}>
          <Text variant="titleCard" style={styles.center}>
            Your bag is empty.
          </Text>
          <Text variant="bodyPdp" tone="muted" style={styles.center}>
            One cap, four core colors, and a numbered color each hole of the season.
          </Text>
          <Button title="Shop the Rope Cap" variant="secondary" onPress={() => router.push("/products/rope-cap")} />
        </View>
        {core ? (
          <FlatList
            data={[...CORE_COLOURWAYS]}
            horizontal
            keyExtractor={(c) => c}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
            renderItem={({ item }) => <ColourwayCard product={core} colourway={item} style={styles.card} source="app_bag" />}
          />
        ) : null}
        <View style={{ height: 48 }} />
      </Screen>
    )
  }

  const product = (line: Line) => catalog.data?.find((p) => p.id === line.product_id)
  const hasSingleCore = items.some((i) => i.product_id === core?.id)
  const inBag = new Set(items.filter((i) => i.product_id === core?.id).map((i) => (i.variant_title ?? "").split(" / ")[0]))
  const suggestions = core
    ? CORE_COLOURWAYS.filter((c) => !inBag.has(c) && colorCounts(core).find((x) => x.color === c)?.state !== "sold_out")
    : []

  return (
    <Screen onRefresh={() => refresh()} refreshing={false}>
      <View style={styles.head}>
        <Text variant="titlePage" accessibilityRole="header" style={styles.center}>
          Your bag
        </Text>
        <Text variant="meta" tone="muted" style={styles.center}>
          {count} {count === 1 ? "item" : "items"}
        </Text>
        <FreeShippingProgress subtotal={subtotal} />
      </View>

      <View style={styles.lines}>
        {items.map((line) => (
          <LineRow key={line.id} line={line} product={product(line)} currency={currency} onChange={change} />
        ))}
        {error ? (
          <Text variant="meta" tone="error" style={styles.error}>
            {error}
          </Text>
        ) : null}
      </View>

      {hasSingleCore ? (
        <View style={[styles.section, styles.padded]}>
          <Text variant="titleDrawer" accessibilityRole="header">
            Make it two
          </Text>
          <BundleRows source="cart" />
        </View>
      ) : null}

      {core && suggestions.length ? <CompleteTheLook core={core} colours={suggestions} /> : null}

      <View style={styles.summary}>
        <View style={styles.row}>
          <Text variant="labelCaps">Subtotal</Text>
          <Text style={styles.subtotal}>{formatMoney(subtotal, currency)}</Text>
        </View>
        <Text variant="meta" tone="muted">
          Shipping is chosen at checkout: {subtotal >= POLICY.freeShippingThreshold ? "standard ships free" : "standard $6"} · express $15.{" "}
          {POLICY.returns}.
        </Text>
        <Button
          title="Checkout"
          variant="black"
          onPress={() => {
            trackTap("cart_checkout")
            track("checkout_started", { cart_id: cart?.id, value: cart?.total, currency: currency.toUpperCase() })
            router.push("/checkout")
          }}
        />
        <Text variant="note" style={styles.center}>
          Taxes calculated at checkout. Guest checkout, no account needed.
        </Text>
      </View>
    </Screen>
  )
}

function LineRow({
  line,
  product,
  currency,
  onChange,
}: {
  line: Line
  product: Product | undefined
  currency: string
  onChange: (id: string, qty: number) => void
}) {
  const catalog = useCatalog()
  const image = lineImage(catalog.data, line)
  const edition = editionOf(product)
  const open = () => product?.handle && router.push(isOffer(product) ? (`/offer/${product.handle}` as never) : `/products/${product.handle}`)
  return (
    <View style={styles.line}>
      <Pressable accessibilityRole="link" accessibilityLabel={line.product_title ?? line.title ?? "Item"} onPress={open} style={styles.lineTile}>
        <Tile source={image} aspectRatio={92 / 110} inset={0.06} />
      </Pressable>
      <View style={styles.lineText}>
        <View style={styles.lineTop}>
          <Text style={styles.lineTitle} numberOfLines={2}>
            {line.product_title ?? line.title}
          </Text>
          <Text style={styles.linePrice}>{formatMoney(line.total ?? line.subtotal, currency)}</Text>
        </View>
        <Text variant="meta" tone="muted">
          {lineMeta(product, line)}
        </Text>
        {edition && edition.hole >= 2 ? <EditionBadge hole={edition.hole} size={edition.size} /> : null}
        <View style={styles.lineActions}>
          <QuantityStepper value={line.quantity} min={0} onChange={(n) => onChange(line.id, n)} />
          <Button title="Remove" variant="link" accessibilityLabel={`Remove ${line.product_title ?? ""}`} onPress={() => onChange(line.id, 0)} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { textAlign: "center" },
  head: { paddingHorizontal: layout.edge, paddingTop: 16, paddingBottom: 8, gap: 10 },
  empty: { paddingHorizontal: layout.edge, paddingVertical: 32, gap: 14, alignItems: "stretch" },
  rail: { paddingHorizontal: layout.railEdge, gap: layout.gap },
  card: { width: 164 },
  lines: { paddingHorizontal: layout.edge, marginTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  line: { flexDirection: "row", gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  lineTile: { width: 92 },
  lineText: { flex: 1, gap: 4 },
  lineTop: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  lineTitle: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14.4, lineHeight: 18, color: colors.text },
  linePrice: { fontFamily: fonts.body, fontSize: 14.4, lineHeight: 18, color: colors.text, fontVariant: ["tabular-nums"] },
  lineActions: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 6 },
  error: { paddingVertical: 12 },
  section: { paddingTop: 32, gap: 12 },
  padded: { paddingHorizontal: layout.edge },
  summary: { backgroundColor: colors.tile, padding: 24, gap: 14, marginTop: 40 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  subtotal: { fontFamily: fonts.bodyMedium, fontSize: 21.6, lineHeight: 26, color: colors.text, fontVariant: ["tabular-nums"] },
})
