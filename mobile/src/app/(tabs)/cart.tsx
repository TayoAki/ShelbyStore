import Ionicons from "@expo/vector-icons/Ionicons"
import type { HttpTypes } from "@medusajs/types"
import { Image } from "expo-image"
import { router } from "expo-router"
import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { Badge } from "@/components/badge"
import { BundleRows } from "@/components/bundle-rows"
import { Button } from "@/components/button"
import { FreeShippingProgress } from "@/components/free-shipping-progress"
import { QuantityStepper } from "@/components/quantity-stepper"
import { Screen } from "@/components/screen"
import { LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { colors, CORE_COLOURWAYS, radius } from "@/constants/theme"
import { useCatalog } from "@/hooks/use-products"
import { useQuickAdd } from "@/hooks/use-quick-add"
import { track, trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { errorMessage } from "@/lib/medusa"
import { POLICY } from "@/lib/policy"
import { colorCounts, editionOf, imagesFor, isOffer, lineImage, lineMeta, productPrice, type Product } from "@/lib/product"
import { useCart } from "@/providers/cart-provider"

type Line = HttpTypes.StoreCartLineItem

/**
 * Bag (APP_SPEC G.5 Bag): the true free-shipping progress, lines in a white
 * card, The Pair / The Foursome when a single core cap is in the bag, other
 * core colourways as "complete the look", and the summary.
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
        <View style={styles.empty}>
          <Text variant="empty" style={styles.center}>
            Your bag is empty.
          </Text>
          <Button title="Shop the Rope Cap" onPress={() => router.push("/products/rope-cap")} style={styles.emptyBtn} />
          <Button title="See The Card" variant="outlineBlack" onPress={() => router.navigate("/card")} style={styles.emptyBtn} />
        </View>
      </Screen>
    )
  }

  const product = (line: Line) => catalog.data?.find((p) => p.id === line.product_id)
  const hasSingleCore = items.some((i) => i.product_id === core?.id)
  const inBag = new Set(
    items.filter((i) => i.product_id === core?.id).map((i) => (i.variant_title ?? "").split(" / ")[0])
  )
  const suggestions = core
    ? CORE_COLOURWAYS.filter((c) => !inBag.has(c) && colorCounts(core).find((x) => x.color === c)?.state !== "sold_out").slice(0, 2)
    : []

  return (
    <Screen onRefresh={() => refresh()} refreshing={false}>
      <View style={styles.headerRow}>
        <Text variant="cardTitle">Bag ({count})</Text>
        <Text variant="meta" tone="muted">
          {POLICY.announcement}
        </Text>
      </View>
      <View style={styles.progress}>
        <FreeShippingProgress subtotal={subtotal} />
      </View>

      <View style={styles.card}>
        {items.map((line, i) => (
          <LineRow key={line.id} line={line} product={product(line)} last={i === items.length - 1} currency={currency} onChange={change} />
        ))}
      </View>
      {error ? (
        <Text variant="meta" tone="error" style={styles.pad}>
          {error}
        </Text>
      ) : null}

      {hasSingleCore ? (
        <View style={styles.section}>
          <BundleRows source="cart" />
        </View>
      ) : null}

      {core && suggestions.length ? <CompleteTheLook core={core} colours={suggestions} /> : null}

      <View style={styles.summary}>
        <View style={styles.row}>
          <Text variant="cardTitle">Subtotal</Text>
          <Text variant="priceSm">{formatMoney(subtotal, currency)}</Text>
        </View>
        <Text variant="meta" tone="muted">
          Shipping is chosen at checkout: {subtotal >= POLICY.freeShippingThreshold ? "standard ships free" : "standard $6"} ·
          express $15. {POLICY.returns}.
        </Text>
        <Button
          title="Checkout"
          size="atc"
          onPress={() => {
            trackTap("cart_checkout")
            track("checkout_started", { cart_id: cart?.id, value: cart?.total, currency: currency.toUpperCase() })
            router.push("/checkout")
          }}
        />
        <Text variant="meta" tone="muted" style={styles.center}>
          Guest checkout. No account needed.
        </Text>
      </View>
    </Screen>
  )
}

function LineRow({
  line,
  product,
  last,
  currency,
  onChange,
}: {
  line: Line
  product: Product | undefined
  last: boolean
  currency: string
  onChange: (id: string, qty: number) => void
}) {
  const catalog = useCatalog()
  const image = lineImage(catalog.data, line)
  const edition = editionOf(product)
  return (
    <View style={[styles.line, !last && styles.lineBorder]}>
      <Pressable
        accessibilityRole="link"
        onPress={() => product?.handle && router.push(isOffer(product) ? (`/offer/${product.handle}` as never) : `/products/${product.handle}`)}>
        {image ? <Image source={image} style={styles.lineImage} contentFit="contain" /> : <View style={styles.lineImage} />}
      </Pressable>
      <View style={styles.lineText}>
        <Text variant="cardTitle" numberOfLines={2}>
          {line.product_title ?? line.title}
        </Text>
        <Text variant="meta" tone="muted">
          {lineMeta(product, line)}
        </Text>
        {edition && edition.hole >= 2 ? <Badge label={`Hole ${edition.hole}`} /> : null}
        <View style={styles.lineActions}>
          <QuantityStepper value={line.quantity} min={0} onChange={(n) => onChange(line.id, n)} />
          <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${line.product_title ?? ""}`} hitSlop={10} onPress={() => onChange(line.id, 0)}>
            <Ionicons name="close" size={16} color={colors.black} />
          </Pressable>
        </View>
      </View>
      <Text variant="priceSm">{formatMoney(line.total ?? line.subtotal, currency)}</Text>
    </View>
  )
}

function CompleteTheLook({ core, colours }: { core: Product; colours: string[] }) {
  const quick = useQuickAdd()
  const price = productPrice(core)
  return (
    <View style={styles.section}>
      <Text variant="eyebrow" style={styles.pad}>
        Complete the look
      </Text>
      <View style={styles.looks}>
        {colours.map((c) => (
          <View key={c} style={styles.look}>
            <Image source={imagesFor(core, c)[0] ?? null} style={styles.lookImage} contentFit="contain" />
            <Text variant="cardTitle" numberOfLines={1}>
              {c}
            </Text>
            <Button
              title={`Add · ${price ? formatMoney(price.amount, price.currency) : ""}`}
              size="small"
              loading={quick.pending !== null}
              onPress={() => {
                trackTap("cart_complete_look", { color: c })
                void quick.addColour(core, c, "app_bag")
              }}
            />
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { textAlign: "center" },
  pad: { paddingHorizontal: 20 },
  empty: { alignItems: "center", paddingVertical: 80, gap: 20 },
  emptyBtn: { width: 310 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingHorizontal: 20, gap: 8, flexWrap: "wrap" },
  progress: { marginHorizontal: 10, marginTop: 12, backgroundColor: colors.white, borderRadius: radius.xxl, padding: 16 },
  card: { margin: 10, backgroundColor: colors.white, borderRadius: radius.xxl, paddingHorizontal: 16 },
  line: { flexDirection: "row", gap: 12, paddingVertical: 16, alignItems: "flex-start" },
  lineBorder: { borderBottomWidth: 1, borderBottomColor: colors.page },
  lineImage: { width: 85, height: 85, borderRadius: radius.tile, backgroundColor: colors.naturalWhite25 },
  lineText: { flex: 1, gap: 6 },
  lineActions: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 4 },
  section: { marginTop: 20, gap: 10, paddingHorizontal: 10 },
  looks: { flexDirection: "row", gap: 10 },
  look: { flex: 1, backgroundColor: colors.naturalWhite25, borderRadius: radius.xxl, padding: 12, gap: 8 },
  lookImage: { width: "100%", aspectRatio: 1, borderRadius: radius.xl, backgroundColor: colors.white },
  summary: { margin: 10, marginTop: 24, backgroundColor: colors.white, borderRadius: radius.xxl, padding: 20, gap: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
})
