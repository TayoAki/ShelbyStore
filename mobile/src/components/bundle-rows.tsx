import Ionicons from "@expo/vector-icons/Ionicons"
import { router } from "expo-router"
import { Pressable, StyleSheet, View } from "react-native"

import { colors, CORE_COLOURWAYS, colourwaySlug } from "@/constants/theme"
import { useCatalog } from "@/hooks/use-products"
import { trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { capsIn, hatImage, offersFor, productPrice } from "@/lib/product"

import { Text } from "./text"
import { Tile } from "./tile"

const lead = (c: string) => hatImage(`rope-cap-${colourwaySlug(c)}-1.jpg`)

/** Two (or four) caps on #F6F6F6 tiles: the kit in miniature. */
export function BundleThumb({ caps, size = 72 }: { caps: number; size?: number }) {
  const picks = caps >= 4 ? [...CORE_COLOURWAYS] : ["Clubhouse Navy", "Pine"]
  const cell = caps >= 4 ? (size - 2) / 2 : (size - 2) / 2
  return (
    <View style={[styles.thumb, { width: size }]}>
      {picks.map((c) => (
        <View key={c} style={{ width: cell }}>
          <Tile source={lead(c)} aspectRatio={1} inset={0.04} />
        </View>
      ))}
    </View>
  )
}

/**
 * The Pair and The Foursome as Eastside kit cards (APP_SPEC v8 V8.3, web
 * E.5.2): the caps on grey tiles, the title, the live price and what each cap
 * comes to ("$88.00 · $44 a cap"), ruled 1pt #F0F0F0 between cards. Hidden
 * when a bundle isn't available.
 */
export function BundleRows({ source = "pdp" }: { source?: "pdp" | "cart" }) {
  const catalog = useCatalog()
  const offers = offersFor(catalog.data ?? [], "rope-cap")
  if (!offers.length) return null
  return (
    <View style={styles.wrap}>
      {offers.map((offer, i) => {
        const price = productPrice(offer)?.amount
        if (price === undefined) return null
        const caps = capsIn(offer)
        const four = caps >= 4
        const label = four ? "The Foursome" : "The Pair"
        const per = `${formatMoney(price)} · ${formatMoney(price / caps).replace(/\.00$/, "")} a cap`
        return (
          <Pressable
            key={offer.id}
            accessibilityRole="link"
            accessibilityLabel={`${label}, ${per}`}
            onPress={() => {
              trackTap(source === "cart" ? "cart_offer" : four ? "pdp_foursome" : "pdp_offer")
              router.push(`/offer/${offer.handle}` as never)
            }}
            style={({ pressed }) => [styles.row, i > 0 && styles.rule, pressed && { backgroundColor: colors.bgBrighter }]}>
            {({ pressed }) => (
              <>
                <BundleThumb caps={caps} size={72} />
                <View style={styles.text}>
                  <Text variant="titleCard" style={pressed && { color: colors.linkPressed }}>
                    {label}
                  </Text>
                  <Text variant="priceCard">{per}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.text} />
              </>
            )}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  row: { flexDirection: "row", alignItems: "center", gap: 14, minHeight: 88, paddingVertical: 12 },
  rule: { borderTopWidth: 1, borderTopColor: colors.border },
  thumb: { flexDirection: "row", flexWrap: "wrap", gap: 2 },
  text: { flex: 1, gap: 4 },
})
