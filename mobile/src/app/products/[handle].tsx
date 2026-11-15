import { useQueryClient } from "@tanstack/react-query"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { Tag } from "@/components/badge"
import { Button } from "@/components/button"
import { ImageCarousel } from "@/components/image-carousel"
import { OptionPicker } from "@/components/option-picker"
import { QuantityStepper } from "@/components/quantity-stepper"
import { Screen } from "@/components/screen"
import { EmptyState, ErrorState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { colors, spacing } from "@/constants/theme"
import { useProduct } from "@/hooks/use-products"
import { useLiveReleaseIndex, useReleases } from "@/hooks/use-releases"
import { track, useTrackOnce } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { errorMessage } from "@/lib/medusa"
import {
  defaultSelection,
  findVariant,
  productImages,
  productMeta,
  productOptions,
  productPrice,
  valueStock,
  variantPrice,
  variantStock,
} from "@/lib/product"
import { useCart } from "@/providers/cart-provider"

export default function ProductScreen() {
  const params = useLocalSearchParams<{ handle: string; release?: string }>()
  const { data: product, isLoading, error, refetch, isRefetching } = useProduct(params.handle)
  const liveIndex = useLiveReleaseIndex()
  const { data: releases } = useReleases()
  const { addItem } = useCart()
  useTrackOnce("product_viewed", product?.id, () => ({
    product_id: product?.id,
    handle: product?.handle,
    release_id: product ? liveIndex.get(product.id) : undefined,
  }))
  const queryClient = useQueryClient()

  const [picked, setPicked] = useState<Record<string, string> | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    )
  }
  if (error) {
    return (
      <Screen>
        <ErrorState error={error} onRetry={() => refetch()} />
      </Screen>
    )
  }
  if (!product) {
    return (
      <Screen>
        <EmptyState
          title="Not available right now"
          body="This piece may be part of a drop that hasn't gone live yet, or it has sold through."
          actionTitle="See drops"
          onAction={() => router.replace("/drops")}
        />
      </Screen>
    )
  }

  // A drop product attributes the cart to its live release; core products don't.
  const releaseId = liveIndex.get(product.id) ?? (typeof params.release === "string" ? params.release : undefined)
  const release = releases?.all.find((r) => r.id === releaseId)
  const selected = picked ?? defaultSelection(product)
  const options = productOptions(product)
  const variant = findVariant(product, selected)
  const stock = variant ? variantStock(variant) : null
  const price = variant ? variantPrice(variant) : null
  const fallbackPrice = productPrice(product)
  const { promise, fitNotes } = productMeta(product)
  const missing = options.filter((o) => !selected[o.id]).map((o) => o.title.toLowerCase())
  const maxQty = Math.max(1, Math.min(10, stock?.quantity ?? 10))

  const add = async () => {
    if (!variant) return
    setAdding(true)
    setAddError(null)
    try {
      await addItem(variant.id, quantity, { releaseId })
      track("add_to_cart", {
        product_id: product.id,
        variant_id: variant.id,
        quantity,
        price: price?.amount,
        currency: price?.currency?.toUpperCase(),
        release_id: releaseId,
      })
      setAdded(true)
      queryClient.invalidateQueries({ queryKey: ["product", params.handle] })
    } catch (e) {
      setAddError(errorMessage(e))
    } finally {
      setAdding(false)
    }
  }

  const ctaTitle = !variant
    ? missing.length
      ? `Select ${missing.join(" and ")}`
      : "Unavailable"
    : stock?.state === "sold_out"
      ? "Sold out"
      : "Add to bag"

  return (
    <Screen
      edges={["bottom"]}
      refreshing={isRefetching}
      onRefresh={() => refetch()}
      footer={
        <View style={styles.footer}>
          {added ? (
            <View style={styles.addedRow}>
              <Text variant="small" tone="success" style={styles.bold}>
                ✓ Added to your bag
              </Text>
              <Pressable accessibilityRole="link" onPress={() => router.push("/cart")} hitSlop={8}>
                <Text variant="small" style={styles.link}>
                  View bag
                </Text>
              </Pressable>
            </View>
          ) : null}
          {addError ? (
            <Text variant="small" tone="danger">
              {addError}
            </Text>
          ) : null}
          <Button
            title={ctaTitle}
            onPress={add}
            loading={adding}
            disabled={!variant || stock?.state === "sold_out"}
            variant={releaseId ? "accent" : "primary"}
          />
        </View>
      }>
      <Stack.Screen options={{ title: product.title }} />
      <ImageCarousel images={productImages(product)} alt={product.title} />

      <View style={styles.body}>
        {release ? (
          <Pressable accessibilityRole="link" onPress={() => router.push(`/drops/${release.handle}`)}>
            <Tag label={`From the drop: ${release.title}`} tone="accent" />
          </Pressable>
        ) : null}

        <View style={styles.titleBlock}>
          <Text variant="title">{product.title}</Text>
          <Text variant="heading">
            {price
              ? formatMoney(price.amount, price.currency)
              : fallbackPrice
                ? `${fallbackPrice.varies ? "From " : ""}${formatMoney(fallbackPrice.amount, fallbackPrice.currency)}`
                : ""}
          </Text>
        </View>

        {promise ? (
          <Text variant="quote" style={styles.promise}>
            “{promise}”
          </Text>
        ) : null}

        {options.map((option) => (
          <OptionPicker
            key={option.id}
            title={option.title}
            values={option.values}
            selected={selected[option.id]}
            stockFor={(value) => valueStock(product, option.id, value, selected)}
            showStockHint={option.isSize}
            onSelect={(value) => {
              setAdded(false)
              setQuantity(1)
              setPicked({ ...selected, [option.id]: value })
            }}
          />
        ))}

        {variant && stock ? (
          <Text variant="small" tone={stock.state === "sold_out" ? "danger" : stock.state === "low" ? "accent" : "success"}>
            {stock.state === "sold_out"
              ? "Sold out in this size"
              : stock.state === "low"
                ? `Only ${stock.quantity} left in this size`
                : "In stock · ships in 1–2 business days"}
          </Text>
        ) : null}

        <View style={styles.qtyRow}>
          <Text variant="eyebrow">Quantity</Text>
          <QuantityStepper value={quantity} onChange={setQuantity} max={maxQty} disabled={!variant} />
        </View>

        {product.description ? (
          <View style={styles.block}>
            <Text variant="eyebrow" tone="muted">
              Details
            </Text>
            <Text>{product.description}</Text>
          </View>
        ) : null}

        {fitNotes ? (
          <View style={styles.block}>
            <Text variant="eyebrow" tone="muted">
              Fit notes
            </Text>
            <Text>{fitNotes}</Text>
          </View>
        ) : null}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.xl },
  titleBlock: { gap: spacing.xs },
  promise: { color: colors.text },
  qtyRow: { gap: spacing.md },
  block: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  addedRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bold: { fontWeight: "700" },
  link: { textDecorationLine: "underline", fontWeight: "600" },
})
