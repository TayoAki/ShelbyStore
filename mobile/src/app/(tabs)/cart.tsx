import Ionicons from "@expo/vector-icons/Ionicons"
import type { HttpTypes } from "@medusajs/types"
import { Image } from "expo-image"
import { router } from "expo-router"
import { useState } from "react"
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from "react-native"

import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { OfferCard } from "@/components/offer-card"
import { QuantityStepper } from "@/components/quantity-stepper"
import { Screen } from "@/components/screen"
import { EmptyState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { colors, fonts, MAX_CONTENT_WIDTH, radius } from "@/constants/theme"
import { useCatalog } from "@/hooks/use-products"
import { track } from "@/lib/analytics"
import { listable } from "@/lib/catalog"
import { formatMoney } from "@/lib/format"
import { errorMessage } from "@/lib/medusa"
import { POLICY } from "@/lib/policy"
import {
  cardImages,
  colorOptionOf,
  isOneSize,
  lineImage,
  offerFor,
  productPrice,
  shapeOf,
  variantOptionMap,
  variantPrice,
  variantStock,
  type Product,
} from "@/lib/product"
import { useAddedSheet } from "@/providers/added-sheet-provider"
import { useCart } from "@/providers/cart-provider"

type Line = HttpTypes.StoreCartLineItem

/** Bag (APP_SPEC §5.5): Melin's cart drawer as a full screen on #F5F5F5. */
export default function CartScreen() {
  const { cart, isLoading, isMutating, updateItem, refresh } = useCart()
  const catalog = useCatalog()
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
      <Screen edges={["top"]} background={colors.tile}>
        <LoadingState />
      </Screen>
    )
  }

  const header = (
    <View style={styles.header}>
      <Ionicons name="bag-outline" size={24} color={colors.text} />
      <Text style={styles.headerTitle}>Your Bag</Text>
      <Text variant="micro" style={styles.policy}>
        {POLICY.bagLine}
      </Text>
    </View>
  )

  if (!items.length) {
    return (
      <Screen edges={["top"]} header={header} background={colors.tile} onRefresh={() => refresh()} refreshing={false}>
        <EmptyState
          icon="bag-outline"
          title="Your Bag Is Empty"
          actionTitle="Shop the Everyday Cap"
          onAction={() => router.push("/products/everyday-cap")}
        />
      </Screen>
    )
  }

  const products = catalog.data ?? []
  const inBag = new Set(items.map((i) => i.product_handle).filter(Boolean))
  const twoPack = inBag.has("everyday-cap") ? offerFor(products, "everyday-cap") : null
  const single = products.find((p) => p.handle === "everyday-cap") ?? null
  const bagShapes = new Set(
    items.map((i) => shapeOf(products.find((p) => p.handle === i.product_handle) ?? ({} as Product))?.handle).filter(Boolean)
  )
  const suggestions = listable(products)
    .filter((p) => !inBag.has(p.handle ?? ""))
    .sort((a, b) => Number(bagShapes.has(shapeOf(a)?.handle)) - Number(bagShapes.has(shapeOf(b)?.handle)))
    .slice(0, 3)

  return (
    <Screen
      edges={["top"]}
      header={header}
      background={colors.tile}
      footer={
        <View style={styles.summary}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="checkmark-circle" size={16} color={colors.inStock} />
              <Text variant="bodySm">{POLICY.returnsShort}</Text>
            </View>
            <Text style={styles.included}>Included</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <Text style={styles.summaryTitle}>
              {formatMoney(cart?.item_subtotal ?? cart?.subtotal ?? 0, currency)}
            </Text>
          </View>
          <Button
            title="Checkout"
            size="checkout"
            onPress={() => router.push("/checkout")}
            disabled={isMutating}
          />
          <Text style={styles.trust}>{POLICY.trustLine}</Text>
        </View>
      }>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View>
        {items.map((item) => (
          <CartLine
            key={item.id}
            item={item}
            image={lineImage(catalog.data, item)}
            currency={currency}
            disabled={isMutating}
            onChange={(q) => change(item.id, q)}
          />
        ))}
      </View>
      <View style={styles.look}>
        <Text style={styles.lookTitle}>Complete Your Look</Text>
        {twoPack ? <OfferCard offer={twoPack} single={single} heading={false} /> : null}
        {suggestions.length ? <Suggestions products={suggestions} /> : null}
      </View>
    </Screen>
  )
}

function CartLine({
  item,
  image,
  currency,
  disabled,
  onChange,
}: {
  item: Line
  image: string | null
  currency: string
  disabled: boolean
  onChange: (quantity: number) => void
}) {
  const handle = item.product_handle
  const drop = !!(item.metadata as Record<string, unknown> | null)?.release_id
  return (
    <View style={styles.line}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={item.product_title ?? item.title}
        disabled={!handle}
        onPress={() => handle && router.push(`/products/${handle}` as never)}>
        {image ? <Image source={image} style={styles.thumb} contentFit="contain" /> : <View style={styles.thumb} />}
      </Pressable>
      <View style={styles.lineBody}>
        <Text style={styles.lineTitle} numberOfLines={2}>
          {item.product_title ?? item.title}
        </Text>
        {item.variant_title ? <Text style={styles.lineDetail}>{item.variant_title}</Text> : null}
        {drop ? <Badge label="Limited" small style={styles.lineBadge} /> : null}
        <View style={styles.lineBottom}>
          <QuantityStepper value={item.quantity} onChange={onChange} min={1} max={10} disabled={disabled} />
          <Text style={styles.linePrice}>{formatMoney(item.total ?? item.unit_price * item.quantity, currency)}</Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.product_title ?? item.title}`}
        onPress={() => onChange(0)}
        disabled={disabled}
        hitSlop={12}
        style={styles.remove}>
        <Ionicons name="close" size={16} color={colors.text} />
      </Pressable>
    </View>
  )
}

/** Suggestion cards, one visible at a time (Melin's "Complete Your Kit"). */
function Suggestions({ products }: { products: Product[] }) {
  const { width } = useWindowDimensions()
  const cardWidth = Math.min(width, MAX_CONTENT_WIDTH) - 32
  return (
    <FlatList
      data={products}
      keyExtractor={(p) => p.id}
      horizontal
      pagingEnabled
      snapToInterval={cardWidth + 12}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.suggestRow}
      renderItem={({ item }) => <Suggestion product={item} width={cardWidth} />}
    />
  )
}

function Suggestion({ product, width }: { product: Product; width: number }) {
  const { addItem } = useCart()
  const sheet = useAddedSheet()
  const [busy, setBusy] = useState(false)
  const color = colorOptionOf(product)
  const variant =
    (product.variants ?? []).find((v) => variantStock(v).state !== "sold_out") ?? (product.variants ?? [])[0]
  const colorName = variant && color ? variantOptionMap(variant)[color.id] : null
  const price = productPrice(product)
  const sized = !isOneSize(product)

  const add = async () => {
    if (!variant) return
    setBusy(true)
    try {
      await addItem(variant.id, 1)
      const p = variantPrice(variant)
      track("add_to_cart", {
        product_id: product.id,
        variant_id: variant.id,
        quantity: 1,
        price: p?.amount,
        currency: p?.currency?.toUpperCase(),
        source: "app_bag",
      })
      sheet.show({
        title: product.title,
        detail: [colorName, "One Size"].filter(Boolean).join(" / "),
        price: p ? formatMoney(p.amount, p.currency) : null,
        image: cardImages(product)[0],
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <View style={[styles.suggest, { width }]}>
      <View style={styles.suggestTop}>
        <Image source={cardImages(product)[0]} style={styles.suggestImage} contentFit="contain" />
        <View style={styles.flex}>
          <Text style={styles.suggestTitle}>{product.title}</Text>
          {colorName ? <Text style={styles.suggestMeta}>{colorName}</Text> : null}
          {shapeOf(product) ? <Text style={styles.suggestMeta}>{shapeOf(product)?.name}</Text> : null}
        </View>
        {price ? <Text style={styles.linePrice}>{formatMoney(price.amount, price.currency)}</Text> : null}
      </View>
      <Button
        title={sized ? "Choose size" : "Add"}
        size="small"
        loading={busy}
        onPress={sized ? () => router.push(`/products/${product.handle}` as never) : add}
        style={styles.suggestButton}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    backgroundColor: colors.secondary,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: "center",
    gap: 4,
  },
  headerTitle: { fontFamily: fonts.heading, fontSize: 16, lineHeight: 24, color: colors.text },
  policy: { textTransform: "capitalize", marginTop: 8 },
  error: { fontFamily: fonts.body, fontSize: 12, color: colors.error, padding: 16 },
  line: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: "row",
    gap: 16,
  },
  thumb: { width: 128, height: 128, borderRadius: radius.addon, backgroundColor: colors.secondary },
  lineBody: { flex: 1, paddingRight: 20 },
  lineTitle: { fontFamily: fonts.subheading, fontSize: 14.08, lineHeight: 21, color: colors.text, marginBottom: 3 },
  lineDetail: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19.5, color: colors.textMuted },
  lineBadge: { marginTop: 12 },
  lineBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  linePrice: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.text },
  remove: { position: "absolute", top: 12, right: 16 },
  look: { paddingVertical: 24, paddingHorizontal: 16, gap: 12 },
  lookTitle: { fontFamily: fonts.subheading, fontSize: 16, lineHeight: 24, color: colors.text },
  suggestRow: { gap: 12 },
  suggest: {
    backgroundColor: colors.tile,
    borderWidth: 1,
    borderColor: colors.lineOffer,
    borderRadius: radius.offer,
    padding: 15,
    gap: 12,
  },
  suggestTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  suggestImage: { width: 72, height: 72, backgroundColor: colors.secondary },
  suggestTitle: { fontFamily: fonts.body, fontSize: 14.08, lineHeight: 21, color: colors.text },
  suggestMeta: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  suggestButton: { width: "50%", alignSelf: "flex-end" },
  summary: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: 12,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  included: { fontFamily: fonts.heading, fontSize: 12, lineHeight: 18, color: colors.inStock, textTransform: "uppercase" },
  summaryTitle: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 23.4, color: colors.text },
  trust: {
    fontFamily: fonts.heading,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.text,
    textAlign: "center",
  },
})
