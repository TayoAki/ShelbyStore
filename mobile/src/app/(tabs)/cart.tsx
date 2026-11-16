import Ionicons from "@expo/vector-icons/Ionicons"
import type { HttpTypes } from "@medusajs/types"
import { Image } from "expo-image"
import { router } from "expo-router"
import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { Box, confirmHaptic, Digits, Face, InkText, Panel, Plate, Window } from "@/components/box"
import { BundleRows } from "@/components/bundle-rows"
import { Button } from "@/components/button"
import { EditionBadge } from "@/components/edition-badge"
import { FreeShippingProgress } from "@/components/free-shipping-progress"
import { QuantityStepper } from "@/components/quantity-stepper"
import { Screen } from "@/components/screen"
import { LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { colors, CORE_COLOURWAYS } from "@/constants/theme"
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
 * Bag (APP_SPEC v7 §5.6, Operate): one box. The heading face with the true
 * free-shipping progress, the ruled line rows, The Pair / The Foursome when a
 * single core cap is in the bag, other core colourways to make it two, and
 * the summary face with Checkout.
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
        <View style={styles.wrap}>
          <Panel>
            <InkText variant="panelTitle" accessibilityRole="header">
              Your bag is empty.
            </InkText>
            <InkText variant="body">One cap, four core colors, and a numbered color each hole of the season.</InkText>
            <Button title="Shop the Rope Cap" size="large" onPress={() => router.push("/products/rope-cap")} />
            <Button title="See The Card" variant="outlineBlack" size="large" onPress={() => router.navigate("/card")} />
          </Panel>
        </View>
      </Screen>
    )
  }

  const product = (line: Line) => catalog.data?.find((p) => p.id === line.product_id)
  const hasSingleCore = items.some((i) => i.product_id === core?.id)
  const inBag = new Set(items.filter((i) => i.product_id === core?.id).map((i) => (i.variant_title ?? "").split(" / ")[0]))
  const suggestions = core
    ? CORE_COLOURWAYS.filter((c) => !inBag.has(c) && colorCounts(core).find((x) => x.color === c)?.state !== "sold_out").slice(0, 2)
    : []

  return (
    <Screen onRefresh={() => refresh()} refreshing={false}>
      <View style={styles.wrap}>
        <Box>
          <Face>
            <View style={styles.headerRow}>
              <InkText variant="panelTitle" accessibilityRole="header">
                Your bag
              </InkText>
              <Digits value={`${count}`} variant="digitsSm" label={`${count} items`} />
            </View>
            <InkText variant="meta">{POLICY.announcement}</InkText>
            <FreeShippingProgress subtotal={subtotal} />
          </Face>
          <Face padded={false}>
            <View style={styles.lines}>
              {items.map((line, i) => (
                <LineRow
                  key={line.id}
                  line={line}
                  product={product(line)}
                  last={i === items.length - 1}
                  currency={currency}
                  onChange={change}
                />
              ))}
            </View>
            {error ? (
              <Text variant="meta" tone="error" style={styles.pad}>
                {error}
              </Text>
            ) : null}
          </Face>
          {hasSingleCore ? (
            <Face>
              <BundleRows source="cart" />
            </Face>
          ) : null}
          {core && suggestions.length ? <CompleteTheLook core={core} colours={suggestions} /> : null}
          <Face>
            <View style={styles.row}>
              <InkText variant="label">Subtotal</InkText>
              <Digits value={formatMoney(subtotal, currency)} variant="digitsSm" />
            </View>
            <InkText variant="meta">
              Shipping is chosen at checkout: {subtotal >= POLICY.freeShippingThreshold ? "standard ships free" : "standard $6"} · express
              $15. {POLICY.returns}.
            </InkText>
            <Button
              title="Checkout"
              size="atc"
              onPress={() => {
                trackTap("cart_checkout")
                track("checkout_started", { cart_id: cart?.id, value: cart?.total, currency: currency.toUpperCase() })
                router.push("/checkout")
              }}
            />
            <InkText variant="meta" style={styles.center}>
              Guest checkout. No account needed.
            </InkText>
          </Face>
        </Box>
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
        accessibilityLabel={line.product_title ?? line.title ?? "Item"}
        onPress={() =>
          product?.handle && router.push(isOffer(product) ? (`/offer/${product.handle}` as never) : `/products/${product.handle}`)
        }
        style={styles.lineWindow}>
        {image ? <Image source={image} style={styles.lineImage} contentFit="contain" /> : null}
      </Pressable>
      <View style={styles.lineText}>
        <Text variant="cardTitle" numberOfLines={2}>
          {line.product_title ?? line.title}
        </Text>
        <Text variant="meta" tone="muted">
          {lineMeta(product, line)}
        </Text>
        {edition && edition.hole >= 2 ? <EditionBadge hole={edition.hole} size={edition.size} /> : null}
        <View style={styles.lineActions}>
          <QuantityStepper value={line.quantity} min={0} onChange={(n) => onChange(line.id, n)} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${line.product_title ?? ""}`}
            onPress={() => onChange(line.id, 0)}
            style={styles.remove}>
            <Ionicons name="close" size={20} color={colors.ink} />
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
    <Face>
      <InkText variant="panelTitle" accessibilityRole="header">
        Make it two
      </InkText>
      <Plate columns={2}>
        {colours.map((c) => (
          <View key={c} style={styles.look}>
            <Window source={imagesFor(core, c)[0] ?? null} alt={`The Rope Cap in ${c}`} aspectRatio={1} />
            <InkText variant="cardTitle" numberOfLines={1}>
              {c}
            </InkText>
            <Button
              title={`Add · ${price ? formatMoney(price.amount, price.currency) : ""}`}
              size="small"
              loading={quick.pending !== null}
              onPress={() => {
                trackTap("cart_complete_look", { color: c })
                confirmHaptic()
                void quick.addColour(core, c, "app_bag")
              }}
            />
          </View>
        ))}
      </Plate>
    </Face>
  )
}

const styles = StyleSheet.create({
  center: { textAlign: "center" },
  pad: { paddingHorizontal: 20, paddingBottom: 12 },
  wrap: { marginHorizontal: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 8 },
  lines: { paddingHorizontal: 20 },
  line: { flexDirection: "row", gap: 12, paddingVertical: 16, alignItems: "flex-start" },
  lineBorder: { borderBottomWidth: 1.5, borderBottomColor: colors.ink },
  lineWindow: {
    width: 76,
    height: 76,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.paper,
    overflow: "hidden",
  },
  lineImage: { position: "absolute", top: "8%", left: "8%", right: "8%", bottom: "8%" },
  lineText: { flex: 1, gap: 6 },
  lineActions: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  remove: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  look: { padding: 12, gap: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
})
