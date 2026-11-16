import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { router } from "expo-router"
import { useState } from "react"
import { FlatList, Pressable, StyleSheet, View } from "react-native"

import { colors, fonts } from "@/constants/theme"
import { track } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { errorMessage } from "@/lib/medusa"
import {
  cardImages,
  colorOptionOf,
  findVariant,
  isLowStock,
  isOneSize,
  productPrice,
  productTypeOf,
  sizeOptionOf,
  valueStock,
  variantOptionMap,
  variantPrice,
  variantStock,
  type Product,
} from "@/lib/product"
import { useAddedSheet } from "@/providers/added-sheet-provider"
import { useCart } from "@/providers/cart-provider"

import { ImageBadge } from "./badge"
import { Dashes } from "./dashes"
import { Text } from "./text"

export function productHref(handle: string, opts?: { releaseId?: string; color?: string }) {
  const q = [
    opts?.releaseId ? `release=${encodeURIComponent(opts.releaseId)}` : null,
    opts?.color ? `color=${encodeURIComponent(opts.color)}` : null,
  ].filter(Boolean)
  return `/products/${handle}${q.length ? `?${q.join("&")}` : ""}`
}

export type CardStatus = "live" | "core" | "upcoming" | null

/** One badge, in Melin's priority: Limited · Core · Low Stock · Coming Soon (APP_SPEC §5.3). */
function badgeFor(product: Product, status: CardStatus): string | null {
  if (status === "live") return "Limited"
  if (status === "core" || product.collection?.handle === "core") return "Core"
  if (isLowStock(product)) return "Low Stock"
  if (status === "upcoming") return "Coming Soon"
  return null
}

/**
 * Melin's product card (APP_SPEC §5.3): a white square with the first colour's
 * photos in a paging carousel, a quick-add bag button, then title and price
 * with colour, type and "+N Colors" in warm grey.
 */
export function ProductCard({
  product,
  width,
  status = null,
  releaseId,
  carousel = true,
  onOpen,
}: {
  product: Product
  width: number
  status?: CardStatus
  releaseId?: string
  carousel?: boolean
  /** Called before navigating (e.g. to close a modal). */
  onOpen?: () => void
}) {
  const images = cardImages(product)
  const [index, setIndex] = useState(0)
  const price = productPrice(product)
  const colors_ = colorOptionOf(product)?.values ?? []
  const badge = badgeFor(product, status)
  const href = productHref(product.handle ?? product.id, { releaseId })
  const open = () => {
    onOpen?.()
    router.push(href as never)
  }

  return (
    <View style={{ width }}>
      <View style={styles.imageArea}>
        {carousel && images.length > 1 ? (
          <FlatList
            data={images}
            keyExtractor={(u, i) => `${u}-${i}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item, index: i }) => (
              <Pressable accessibilityRole="link" accessibilityLabel={`${product.title}, image ${i + 1}`} onPress={open}>
                <Image source={item} style={{ width, height: width }} contentFit="contain" transition={150} />
              </Pressable>
            )}
          />
        ) : (
          <Pressable accessibilityRole="link" accessibilityLabel={product.title} onPress={open}>
            <Image source={images[0]} style={{ width, height: width }} contentFit="contain" transition={150} />
          </Pressable>
        )}
        {carousel ? <Dashes count={images.length} index={index} style={styles.dashes} /> : null}
        {badge ? <ImageBadge label={badge} /> : null}
        <QuickAdd product={product} releaseId={releaseId} />
      </View>
      <Pressable accessibilityRole="link" onPress={open} style={styles.text}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>
          {price ? (
            <Text style={styles.price}>
              {price.varies ? "From " : ""}
              {formatMoney(price.amount, price.currency)}
            </Text>
          ) : null}
        </View>
        {colors_[0] ? <Text style={styles.meta}>{colors_[0]}</Text> : null}
        <Text style={styles.meta}>{productTypeOf(product)}</Text>
        {colors_.length > 1 ? <Text style={styles.meta}>+{colors_.length - 1} Colors</Text> : null}
      </Pressable>
    </View>
  )
}

/**
 * Quick add (APP_SPEC §5.3): one-size hats add the first in-stock colour;
 * sized hats open a two-button size popover under the icon.
 */
function QuickAdd({ product, releaseId }: { product: Product; releaseId?: string }) {
  const { addItem } = useCart()
  const sheet = useAddedSheet()
  const [sizes, setSizes] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const color = colorOptionOf(product)
  const size = sizeOptionOf(product)
  const firstColor = (color?.values ?? []).find((c) =>
    (product.variants ?? []).some((v) => variantOptionMap(v)[color!.id] === c && variantStock(v).state !== "sold_out")
  )

  const add = async (sizeValue?: string) => {
    const selection: Record<string, string> = {}
    if (color && firstColor) selection[color.id] = firstColor
    if (size) selection[size.id] = sizeValue ?? size.values[0]
    const variant = findVariant(product, selection)
    if (!variant || variantStock(variant).state === "sold_out") return
    setBusy(true)
    setError(null)
    try {
      await addItem(variant.id, 1, { releaseId })
      const price = variantPrice(variant)
      track("add_to_cart", {
        product_id: product.id,
        variant_id: variant.id,
        quantity: 1,
        price: price?.amount,
        currency: price?.currency?.toUpperCase(),
        release_id: releaseId,
        source: "app_quick_add",
      })
      setSizes(false)
      sheet.show({
        title: product.title,
        detail: [firstColor, sizeValue ?? (isOneSize(product) ? "One Size" : null)].filter(Boolean).join(" / "),
        price: price ? formatMoney(price.amount, price.currency) : null,
        image: cardImages(product)[0],
      })
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  if (!firstColor) return null
  const sized = !isOneSize(product)

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Quick add ${product.title}`}
        onPress={() => (sized ? setSizes((s) => !s) : add())}
        disabled={busy}
        style={styles.quick}>
        <View style={[styles.quickCircle, busy && { opacity: 0.4 }]}>
          <Ionicons name="bag-outline" size={16} color={colors.text} />
          <View style={styles.plus}>
            <Text style={styles.plusText}>+</Text>
          </View>
        </View>
      </Pressable>
      {sized && sizes && size ? (
        <View style={styles.popover}>
          {size.values.map((v) => {
            const out = valueStock(product, size.id, v, color ? { [color.id]: firstColor } : {}).state === "sold_out"
            return (
              <Pressable
                key={v}
                accessibilityRole="button"
                accessibilityLabel={`Add size ${v}`}
                disabled={out || busy}
                onPress={() => add(v)}
                style={[styles.popButton, out && styles.popOut]}>
                <Text style={[styles.popLabel, out && styles.popLabelOut]}>{v}</Text>
              </Pressable>
            )
          })}
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </>
  )
}

/** Two-column grid, 16pt gap and 16pt side padding (APP_SPEC §5.2). */
export function ProductGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>
}

const styles = StyleSheet.create({
  imageArea: {
    backgroundColor: colors.secondary,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineHeader,
  },
  dashes: { position: "absolute", bottom: 4, left: 0, right: 0 },
  text: { marginTop: 7 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  title: { flex: 1, fontFamily: fonts.heading, fontSize: 16, lineHeight: 24, color: colors.text },
  price: { fontFamily: fonts.body, fontSize: 14, lineHeight: 24, letterSpacing: 0.4, color: colors.text },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.4,
    color: colors.textMutedCard,
    textTransform: "capitalize",
  },
  quick: { position: "absolute", top: 0, right: 0, width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  quickCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: { fontFamily: fonts.heading, fontSize: 10, lineHeight: 12, color: colors.textInverse },
  popover: {
    position: "absolute",
    top: 46,
    right: 8,
    flexDirection: "row",
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.line,
  },
  popButton: { height: 39, minWidth: 56, paddingHorizontal: 10, alignItems: "center", justifyContent: "center" },
  popOut: { backgroundColor: colors.fillDisabled },
  popLabel: { fontFamily: fonts.heading, fontSize: 11, lineHeight: 16.5, letterSpacing: 1.3, color: colors.text },
  popLabelOut: { color: colors.textDisabled, textDecorationLine: "line-through" },
  error: { fontFamily: fonts.body, fontSize: 11, color: colors.error, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16, paddingHorizontal: 16 },
})
