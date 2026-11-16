import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { router } from "expo-router"
import { Pressable, StyleSheet, View } from "react-native"

import { colors, fonts, radius } from "@/constants/theme"
import { formatMoney } from "@/lib/format"
import { cardImages, offerSaving, productPrice, type Product } from "@/lib/product"

import { Text } from "./text"

/**
 * "Make It Two" (APP_SPEC §5.4 item 7, §5.5): the two-pack card, with its live
 * price and a saving computed from the single's live price.
 */
export function OfferCard({ offer, single, heading = true }: { offer: Product; single: Product | null; heading?: boolean }) {
  const price = productPrice(offer)
  const saving = offerSaving(offer, single)
  const image = cardImages(offer)[0] ?? null
  return (
    <View>
      {heading ? <Text style={styles.heading}>Make It Two</Text> : null}
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`The Two-Pack, ${price ? formatMoney(price.amount, price.currency) : ""}`}
        onPress={() => router.push(`/products/${offer.handle}` as never)}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
        {image ? <Image source={image} style={styles.image} contentFit="contain" /> : null}
        <View style={styles.text}>
          <Text style={styles.title}>The Two-Pack</Text>
          <Text style={styles.sub}>Any two colors</Text>
        </View>
        <View style={styles.priceCol}>
          {price ? <Text style={styles.price}>{formatMoney(price.amount, price.currency)}</Text> : null}
          {saving ? <Text style={styles.save}>Save {formatMoney(saving.saving, price?.currency)}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.text} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: fonts.heading,
    fontSize: 18,
    lineHeight: 23.4,
    textTransform: "uppercase",
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.addon,
    borderWidth: 1,
    borderColor: colors.lineAddon,
    borderRadius: radius.addon,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  image: { width: 72, height: 72, backgroundColor: colors.secondary },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22.5, color: colors.text },
  sub: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19.5, color: colors.textMuted },
  priceCol: { alignItems: "flex-end" },
  price: { fontFamily: fonts.heading, fontSize: 16, lineHeight: 24, color: colors.text },
  save: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.text },
})
