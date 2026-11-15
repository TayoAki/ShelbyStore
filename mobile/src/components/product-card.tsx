import { Image } from "expo-image"
import { router } from "expo-router"
import { Pressable, StyleSheet, View } from "react-native"

import { colors, radius, spacing } from "@/constants/theme"
import { formatMoney } from "@/lib/format"
import { productPrice, sizeAvailability, type Product } from "@/lib/product"

import { Tag } from "./badge"
import { Text } from "./text"

export function productHref(handle: string, releaseId?: string) {
  return releaseId ? `/products/${handle}?release=${releaseId}` : `/products/${handle}`
}

export function ProductCard({ product, releaseId, label }: { product: Product; releaseId?: string; label?: string }) {
  const price = productPrice(product)
  const sizes = sizeAvailability(product)
  const soldOut = sizes.length > 0 && sizes.every((s) => s.state === "sold_out")

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${product.title}${price ? `, ${formatMoney(price.amount, price.currency)}` : ""}`}
      onPress={() => router.push(productHref(product.handle ?? product.id, releaseId))}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.imageWrap}>
        <Image
          source={product.thumbnail ?? product.images?.[0]?.url}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        {label ? (
          <View style={styles.label}>
            <Tag label={label} tone={releaseId ? "accent" : "default"} />
          </View>
        ) : null}
      </View>
      <View style={styles.meta}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {product.title}
        </Text>
        <Text variant="small" tone={soldOut ? "danger" : "muted"}>
          {soldOut
            ? "Sold out"
            : price
              ? `${price.varies ? "From " : ""}${formatMoney(price.amount, price.currency)}`
              : ""}
        </Text>
      </View>
    </Pressable>
  )
}

/** Two-column grid that works on phones and stays tidy on tablets/web. */
export function ProductGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.xl - spacing.sm / 2,
    rowGap: spacing.xl,
  },
  card: { width: "50%", paddingHorizontal: spacing.sm / 2 },
  pressed: { opacity: 0.85 },
  imageWrap: {
    aspectRatio: 3 / 4,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceAlt,
  },
  image: { width: "100%", height: "100%" },
  label: { position: "absolute", top: spacing.sm, left: spacing.sm },
  meta: { paddingTop: spacing.sm, gap: spacing.xxs },
})
