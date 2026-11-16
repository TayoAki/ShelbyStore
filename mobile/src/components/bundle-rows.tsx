import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { router } from "expo-router"
import { Pressable, StyleSheet, View } from "react-native"

import { colors, CORE_COLOURWAYS, colourwaySlug, radius } from "@/constants/theme"
import { useCatalog } from "@/hooks/use-products"
import { trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { capsIn, hatImage, offersFor, productPrice } from "@/lib/product"

import { Text } from "./text"

const lead = (c: string) => hatImage(`rope-cap-${colourwaySlug(c)}-1.jpg`)

/** A 56pt thumbnail of two (or four) lead photos. */
export function BundleThumb({ caps, size = 56 }: { caps: number; size?: number }) {
  const picks = caps >= 4 ? [...CORE_COLOURWAYS] : ["Clubhouse Navy", "Pine"]
  const cell = caps >= 4 ? size / 2 : size / 2
  return (
    <View style={[styles.thumb, { width: size, height: size }]}>
      {picks.map((c) => (
        <Image key={c} source={lead(c)} style={{ width: cell, height: caps >= 4 ? cell : size }} contentFit="contain" />
      ))}
    </View>
  )
}

/**
 * The Pair and The Foursome (APP_SPEC G.3 BundleRows, web G.5.9): live prices
 * and per-cap prices, hidden when the bundle isn't available.
 */
export function BundleRows({ source = "pdp" }: { source?: "pdp" | "cart" }) {
  const catalog = useCatalog()
  const offers = offersFor(catalog.data ?? [], "rope-cap")
  if (!offers.length) return null
  return (
    <View style={styles.wrap}>
      {offers.map((offer) => {
        const price = productPrice(offer)?.amount
        if (price === undefined) return null
        const caps = capsIn(offer)
        const four = caps >= 4
        const label = four ? "The Foursome" : "The Pair"
        const line = four ? `Four caps, ${formatMoney(price / caps)} each.` : `Any two colors, ${formatMoney(price / caps)} each.`
        return (
          <Pressable
            key={offer.id}
            accessibilityRole="link"
            accessibilityLabel={`${label}, ${formatMoney(price)}. ${line}`}
            onPress={() => {
              trackTap(source === "cart" ? "cart_offer" : four ? "pdp_foursome" : "pdp_offer")
              router.push(`/offer/${offer.handle}` as never)
            }}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
            <BundleThumb caps={caps} />
            <View style={styles.text}>
              <Text variant="cardTitle">
                {label} · {formatMoney(price)}
              </Text>
              <Text variant="meta" tone="muted">
                {line}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.black} />
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.naturalWhite25,
    borderRadius: radius.xxl,
    padding: 12,
  },
  thumb: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  text: { flex: 1, gap: 2 },
})
