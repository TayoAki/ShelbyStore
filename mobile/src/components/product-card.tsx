import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { router } from "expo-router"
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated"

import { colors, CORE_COLOURWAYS, colourwaySlug, ease, motion, radius } from "@/constants/theme"
import { holeDay, type Hole } from "@/hooks/use-holes"
import { useQuickAdd } from "@/hooks/use-quick-add"
import { trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { colorCounts, hatImage, imagesFor, productPrice, ropeNameFor, type Product } from "@/lib/product"

import { Badge } from "./badge"
import { EditionBadge } from "./edition-badge"
import { Swatch } from "./swatch"
import { Text } from "./text"

function usePressScale() {
  const reduce = useReducedMotion()
  const scale = useSharedValue(1)
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const press = (to: number) => {
    if (reduce) return
    scale.set(withTiming(to, { duration: 150, easing: ease.tailwind, reduceMotion: motion.reduceMotion }))
  }
  return { style, press }
}

/**
 * A colourway card of The Rope Cap (APP_SPEC G.5 Shop): the colour is fixed,
 * the swatch row shows the four core colours with this one selected, and
 * ADD adds the one-size cap directly.
 */
export function ColourwayCard({
  product,
  colourway,
  style,
  source = "app_quick_add",
}: {
  product: Product
  colourway: string
  style?: StyleProp<ViewStyle>
  source?: string
}) {
  const { style: scaleStyle, press } = usePressScale()
  const quick = useQuickAdd()
  const image = imagesFor(product, colourway)[0] ?? hatImage(`rope-cap-${colourwaySlug(colourway)}-1.jpg`)
  const price = productPrice(product)
  const count = colorCounts(product).find((c) => c.color === colourway)
  const soldOut = count?.state === "sold_out"
  const rope = ropeNameFor(product, colourway)
  const go = () => {
    trackTap("core_product", { color: colourway })
    router.push({ pathname: "/products/[handle]", params: { handle: product.handle!, color: colourway } })
  }

  return (
    <Animated.View style={[styles.card, scaleStyle, style]}>
      <Pressable accessibilityRole="link" accessibilityLabel={`The Rope Cap in ${colourway}`} onPressIn={() => press(0.98)} onPressOut={() => press(1)} onPress={go}>
        <View>
          <Image source={image} style={styles.image} contentFit="contain" />
          <Badge label={soldOut ? "Sold out" : "Core"} style={styles.badge} />
        </View>
        <View style={styles.info}>
          <Text variant="cardTitle" numberOfLines={1}>
            {product.title}
          </Text>
          <Text variant="cardMeta" tone="muted" numberOfLines={1}>
            {colourway}
            {rope ? ` · ${rope} rope` : ""}
          </Text>
          {price ? <Text variant="priceSm">{formatMoney(price.amount, price.currency)}</Text> : null}
          <View style={styles.swatches}>
            {CORE_COLOURWAYS.map((c) => (
              <Swatch key={c} name={c} size={20} selected={c === colourway} />
            ))}
          </View>
        </View>
      </Pressable>
      <View style={styles.addRow}>
        <Text variant="meta" tone="muted">
          One size
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add ${colourway} to bag`}
          disabled={soldOut || quick.pending !== null}
          hitSlop={8}
          onPress={() => {
            trackTap("quick_add", { color: colourway })
            void quick.addColour(product, colourway, source)
          }}
          style={({ pressed }) => [styles.add, (soldOut || pressed) && { opacity: 0.5 }]}>
          <Ionicons name="bag-handle-outline" size={16} color={colors.black} />
          <Text variant="cardTitle">{soldOut ? "Sold out" : "Add"}</Text>
        </Pressable>
      </View>
    </Animated.View>
  )
}

/** A numbered edition card (Shop's LIMITED group): live editions add; upcoming ones open the tee sheet. */
export function EditionCard({ hole, style }: { hole: Hole; style?: StyleProp<ViewStyle> }) {
  const { style: scaleStyle, press } = usePressScale()
  const quick = useQuickAdd()
  const product = hole.product
  const colour = hole.colourway
  const go = () => {
    trackTap("pdp_edition_link", { hole: hole.number })
    if (hole.status === "live" && product?.handle) router.push(`/products/${product.handle}`)
    else if (hole.handle) router.push(`/card/${hole.handle}`)
  }
  return (
    <Animated.View style={[styles.card, scaleStyle, style]}>
      <Pressable accessibilityRole="link" accessibilityLabel={`Hole ${hole.number}, ${hole.name}`} onPressIn={() => press(0.98)} onPressOut={() => press(1)} onPress={go}>
        <View>
          {hole.image ? <Image source={hole.image} style={styles.image} contentFit="contain" /> : <View style={styles.image} />}
          <Badge label={hole.status === "sold_out" ? "Sold out" : `Hole ${hole.number}`} style={styles.badge} />
        </View>
        <View style={styles.info}>
          <Text variant="cardTitle" numberOfLines={1}>
            The Rope Cap, {hole.name}
          </Text>
          <Text variant="cardMeta" tone="muted" numberOfLines={1}>
            {colour ? `${colour} · ${ropeNameFor(product, colour) ?? ""} rope` : hole.promise}
          </Text>
          {hole.price != null ? <Text variant="priceSm">{formatMoney(hole.price)}</Text> : null}
          <EditionBadge size={hole.editionSize} left={hole.status === "live" ? hole.left : null} />
          {hole.status === "upcoming" ? (
            <Text variant="badge" tone="muted">
              Releases {holeDay(hole.releaseAt ?? hole.dateIso)}
            </Text>
          ) : null}
        </View>
      </Pressable>
      <View style={styles.addRow}>
        {hole.status === "live" && product && colour ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add ${hole.name} to bag`}
            disabled={quick.pending !== null}
            onPress={() => void quick.addColour(product, colour, "app_quick_add")}
            style={({ pressed }) => [styles.add, pressed && { opacity: 0.5 }]}>
            <Ionicons name="bag-handle-outline" size={16} color={colors.black} />
            <Text variant="cardTitle">Add</Text>
          </Pressable>
        ) : hole.status === "upcoming" ? (
          <Pressable accessibilityRole="link" onPress={go} style={styles.add}>
            <Text variant="cardTitle">Join the tee sheet</Text>
          </Pressable>
        ) : (
          <Text variant="meta" tone="muted">
            {hole.status === "sold_out" ? "Sold out" : hole.status === "ended" ? "Played" : "Announced"}
          </Text>
        )}
      </View>
    </Animated.View>
  )
}

/** Live counts for "In stock today" etc. */
export function coreCounts(product: Product | undefined) {
  if (!product) return []
  return colorCounts(product).filter((c) => (CORE_COLOURWAYS as readonly string[]).includes(c.color))
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.xxl, overflow: "hidden" },
  image: { width: "100%", aspectRatio: 1, backgroundColor: colors.white },
  badge: { position: "absolute", top: 10, left: 10 },
  info: { padding: 16, paddingBottom: 8, gap: 4 },
  swatches: { flexDirection: "row", gap: 2, marginTop: 4 },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  add: { flexDirection: "row", alignItems: "center", gap: 4 },
})
