import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { router } from "expo-router"
import { Pressable, StyleSheet, View } from "react-native"

import { colors, CORE_COLOURWAYS, colourwaySlug } from "@/constants/theme"
import { useCatalog } from "@/hooks/use-products"
import { trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { capsIn, hatImage, offersFor, productPrice } from "@/lib/product"

import { InkText, usePanelInk } from "./box"

const lead = (c: string) => hatImage(`rope-cap-${colourwaySlug(c)}-1.jpg`)

/** Two (or four) die-cut windows in a row: the sleeve's face in miniature. */
export function BundleThumb({ caps, size = 56 }: { caps: number; size?: number }) {
  const picks = caps >= 4 ? [...CORE_COLOURWAYS] : ["Clubhouse Navy", "Pine"]
  const cell = Math.round(size / (caps >= 4 ? 2 : 1.4))
  return (
    <View style={styles.thumb}>
      {picks.map((c) => (
        <View key={c} style={[styles.thumbWindow, { width: cell, height: cell }]}>
          <Image source={lead(c)} style={styles.thumbImage} contentFit="contain" />
        </View>
      ))}
    </View>
  )
}

/**
 * The Pair and The Foursome as printed rows on the face they sit on: their
 * windows, the live price and what each cap comes to, ruled between rows.
 * Hidden when a bundle isn't available.
 */
export function BundleRows({ source = "pdp" }: { source?: "pdp" | "cart" }) {
  const catalog = useCatalog()
  const ink = usePanelInk()
  const offers = offersFor(catalog.data ?? [], "rope-cap")
  if (!offers.length) return null
  return (
    <View style={[styles.wrap, { borderColor: ink.ink }]}>
      {offers.map((offer, i) => {
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
            style={({ pressed }) => [styles.row, i > 0 && { borderTopWidth: 1.5, borderTopColor: ink.ink }, pressed && { opacity: 0.8 }]}>
            <BundleThumb caps={caps} size={44} />
            <View style={styles.text}>
              <InkText variant="cardTitle">
                {label} · {formatMoney(price)}
              </InkText>
              <InkText variant="meta" muted>
                {line}
              </InkText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={ink.ink} />
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, paddingHorizontal: 12, paddingVertical: 10 },
  thumb: { flexDirection: "row", flexWrap: "wrap", gap: 3, width: 70 },
  thumbWindow: { borderRadius: 9, borderWidth: 1.5, borderColor: colors.ink, backgroundColor: colors.paper, overflow: "hidden" },
  thumbImage: { position: "absolute", top: "8%", left: "8%", right: "8%", bottom: "8%" },
  text: { flex: 1, gap: 2 },
})
