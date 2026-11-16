import { router } from "expo-router"
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"

import { colors, CORE_COLOURWAYS, colourwaySlug } from "@/constants/theme"
import { holeDay, type Hole } from "@/hooks/use-holes"
import { useQuickAdd } from "@/hooks/use-quick-add"
import { trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { confirmHaptic } from "@/lib/haptics"
import { capsIn, colorCounts, hatImage, imagesFor, productPrice, type Product } from "@/lib/product"

import { EditionBadge } from "./edition-badge"
import { Swatch } from "./swatch"
import { Text } from "./text"
import { Tile } from "./tile"

/**
 * Eastside's product card (APP_SPEC v8 V8.3), no hover states: a 5:6 #F6F6F6
 * tile, then the title in Roboto 12.6 black ("Pine Rope Cap", colour first),
 * the #646464 price 5pt under it and 20pt colour dots, and a static 44pt
 * "+ Quick add" row with a 1pt #F0F0F0 rule. Pressing the card turns the title
 * colour (M10).
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
  /** v7 option kept for call sites. */
  flat?: boolean
}) {
  const quick = useQuickAdd()
  const image = imagesFor(product, colourway)[0] ?? hatImage(`rope-cap-${colourwaySlug(colourway)}-1.jpg`)
  const price = productPrice(product)
  const count = colorCounts(product).find((c) => c.color === colourway)
  const soldOut = count?.state === "sold_out"
  const go = () => {
    trackTap("core_product", { color: colourway })
    router.push({ pathname: "/products/[handle]", params: { handle: product.handle!, color: colourway } })
  }
  return (
    <View style={style}>
      <Pressable accessibilityRole="link" accessibilityLabel={`${colourway} Rope Cap`} onPress={go}>
        {({ pressed }) => (
          <>
            <Tile source={image} alt={`The Rope Cap in ${colourway}`} badge={soldOut ? "Sold out" : null} badgeDark />
            <View style={styles.info}>
              <Text variant="cardTitleEastside" numberOfLines={2} style={[styles.twoLines, pressed && { color: colors.linkPressed }]}>
                {colourway} Rope Cap
              </Text>
              {price ? <Text variant="priceCard">{formatMoney(price.amount, price.currency)}</Text> : null}
              <View style={styles.dots}>
                {CORE_COLOURWAYS.map((c) => (
                  <Swatch key={c} name={c} size={20} />
                ))}
              </View>
            </View>
          </>
        )}
      </Pressable>
      <QuickAdd
        label={soldOut ? "Sold out" : "+ Quick add"}
        disabled={soldOut}
        busy={quick.pending !== null}
        accessibilityLabel={`Quick add ${colourway} to bag`}
        onPress={() => {
          trackTap("quick_add", { color: colourway })
          confirmHaptic()
          void quick.addColour(product, colourway, source)
        }}
      />
    </View>
  )
}

/** The static quick-add row under a card's tile. */
function QuickAdd({
  label,
  onPress,
  disabled = false,
  busy = false,
  accessibilityLabel,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  busy?: boolean
  accessibilityLabel?: string
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [styles.quick, pressed && { backgroundColor: colors.bgBrighter }]}>
      <Text variant="micro" style={[disabled && { color: colors.textLight }]}>
        {busy ? "Adding…" : label}
      </Text>
    </Pressable>
  )
}

/**
 * A numbered edition card: live editions quick-add; upcoming ones open the tee
 * sheet on their Card page. `trackAs` names the tap: `pdp_edition_link` on the
 * product page, `card_hole` on Home and The Card (a live hole there also
 * records `hero_shop_drop`, as the web's drop button does).
 */
export function EditionCard({
  hole,
  style,
  trackAs = "pdp_edition_link",
}: {
  hole: Hole
  style?: StyleProp<ViewStyle>
  flat?: boolean
  trackAs?: "pdp_edition_link" | "card_hole"
}) {
  const quick = useQuickAdd()
  const product = hole.product
  const colour = hole.colourway
  const go = () => {
    trackTap(trackAs, { hole: hole.number })
    if (trackAs === "card_hole" && hole.status === "live" && hole.number > 1) trackTap("hero_shop_drop", { hole: hole.number })
    if (hole.number === 1 && trackAs === "card_hole") router.push("/products/rope-cap")
    else if (hole.status === "live" && product?.handle) router.push(`/products/${product.handle}`)
    else if (hole.handle) router.push(`/card/${hole.handle}`)
  }
  const meta =
    hole.status === "upcoming"
      ? `Releases ${holeDay(hole.releaseAt ?? hole.dateIso)}`
      : hole.status === "live" && hole.editionSize && hole.left != null
        ? `${hole.left} of ${hole.editionSize} left`
        : hole.editionSize
          ? `Edition of ${hole.editionSize}`
          : null
  const badge = hole.status === "sold_out" ? "Sold out" : `No. ${String(hole.number).padStart(2, "0")}`
  return (
    <View style={style}>
      <Pressable accessibilityRole="link" accessibilityLabel={`Hole ${hole.number}, ${hole.name}`} onPress={go}>
        {({ pressed }) => (
          <>
            <View>
              <Tile source={hole.image} alt={`The Rope Cap, ${hole.name}`} badge={badge} badgeDark={hole.status === "sold_out"} />
              {!hole.image ? (
                <View style={[StyleSheet.absoluteFill, styles.numeral]} pointerEvents="none">
                  <Text variant="holeNumeral" tone="muted">
                    {String(hole.number).padStart(2, "0")}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={styles.info}>
              <Text variant="cardTitleEastside" numberOfLines={2} style={[styles.twoLines, pressed && { color: colors.linkPressed }]}>
                {/rope cap$/i.test(hole.name) ? hole.name : `${hole.name} Rope Cap`}
              </Text>
              {hole.price != null ? <Text variant="priceCard">{formatMoney(hole.price)}</Text> : null}
              {meta ? (
                <Text variant="meta" tone="muted" numberOfLines={1}>
                  {meta}
                </Text>
              ) : null}
            </View>
          </>
        )}
      </Pressable>
      {hole.number === 1 ? (
        <QuickAdd label="Shop the Rope Cap" onPress={go} />
      ) : hole.status === "live" && product && colour ? (
        <QuickAdd
          label="+ Quick add"
          busy={quick.pending !== null}
          accessibilityLabel={`Quick add ${hole.name} to bag`}
          onPress={() => {
            trackTap("quick_add", { color: colour })
            confirmHaptic()
            void quick.addColour(product, colour, "app_quick_add")
          }}
        />
      ) : hole.status === "upcoming" ? (
        <QuickAdd label="Join the tee sheet" accessibilityLabel={`Join the tee sheet for ${hole.name}`} onPress={go} />
      ) : (
        <View style={styles.quick}>
          <Text variant="micro" tone="muted">
            {hole.status === "sold_out" ? "Sold out" : hole.status === "ended" ? "Played" : "Announced"}
          </Text>
        </View>
      )}
    </View>
  )
}

const KIT_COLOURS = { 2: ["Clubhouse Navy", "Pine"], 4: ["Tour White", "Clubhouse Navy", "Pine", "Fescue"] } as const

/**
 * The Pair or the Foursome as a card (APP_SPEC v8 V8.5): the caps two across
 * or two by two on one #F6F6F6 tile, the kit name, the price and the per-cap
 * price. Taps record `home_pair` / `home_foursome` (plus `track`, e.g.
 * `page_type: collection` on Shop) and open the offer page.
 */
export function KitCard({ offer, style, track = {} }: { offer: Product; style?: StyleProp<ViewStyle>; track?: Record<string, string> }) {
  const caps = capsIn(offer)
  const four = caps >= 4
  const price = productPrice(offer)
  const name = four ? "The Foursome" : "The Pair"
  const go = () => {
    trackTap(four ? "home_foursome" : "home_pair", track)
    router.push(`/offer/${offer.handle}` as never)
  }
  return (
    <View style={style}>
      <Pressable accessibilityRole="link" accessibilityLabel={name} onPress={go}>
        {({ pressed }) => (
          <>
            <View style={[styles.kitTile, four && styles.kitFour]}>
              {KIT_COLOURS[four ? 4 : 2].map((c) => (
                <View key={c} style={four ? styles.kitQuarter : styles.kitHalf}>
                  <Tile source={hatImage(`rope-cap-${colourwaySlug(c)}-1.jpg`)} alt={`The Rope Cap in ${c}`} aspectRatio={1} inset={0.02} />
                </View>
              ))}
              <EditionBadge size={null} label={four ? "4 caps" : "2 caps"} style={styles.kitBadge} />
            </View>
            <View style={styles.info}>
              <Text variant="cardTitleEastside" numberOfLines={1} style={pressed && { color: colors.linkPressed }}>
                {name}
              </Text>
              {price ? <Text variant="priceCard">{formatMoney(price.amount, price.currency)}</Text> : null}
              <Text variant="meta" tone="muted" numberOfLines={1}>
                {price ? `${formatMoney(price.amount / caps, price.currency)} a cap · ships free` : "Ships free"}
              </Text>
            </View>
          </>
        )}
      </Pressable>
      <QuickAdd label="Choose colors" accessibilityLabel={`Choose colors for ${name}`} onPress={go} />
    </View>
  )
}

/**
 * A small product card for rails (recently viewed, complete the look, the
 * Added sheet): the tile, the title, the price and an optional action under it.
 */
export function MiniCard({
  image,
  title,
  price,
  onPress,
  action,
  style,
  alt,
}: {
  image: string | null
  title: string
  price?: string | null
  onPress?: () => void
  action?: React.ReactNode
  style?: StyleProp<ViewStyle>
  alt?: string
}) {
  return (
    <View style={style}>
      <Pressable accessibilityRole={onPress ? "link" : undefined} accessibilityLabel={title} disabled={!onPress} onPress={onPress}>
        {({ pressed }) => (
          <>
            <Tile source={image} alt={alt ?? title} />
            <View style={styles.info}>
              <Text variant="cardTitleEastside" numberOfLines={2} style={[styles.twoLines, pressed && { color: colors.linkPressed }]}>
                {title}
              </Text>
              {price ? <Text variant="priceCard">{price}</Text> : null}
            </View>
          </>
        )}
      </Pressable>
      {action ? <View style={styles.miniAction}>{action}</View> : null}
    </View>
  )
}

/** Live counts for "In stock today" etc. */
export function coreCounts(product: Product | undefined) {
  if (!product) return []
  return colorCounts(product).filter((c) => (CORE_COLOURWAYS as readonly string[]).includes(c.color))
}

const styles = StyleSheet.create({
  info: { paddingTop: 8, paddingHorizontal: 8, paddingBottom: 2, gap: 5 },
  twoLines: { minHeight: 30 },
  numeral: { alignItems: "center", justifyContent: "center" },
  dots: { flexDirection: "row", gap: 10, paddingTop: 3 },
  miniAction: { paddingTop: 8, paddingHorizontal: 8 },
  kitTile: { aspectRatio: 5 / 6, backgroundColor: colors.tile, flexDirection: "row", alignItems: "center", flexWrap: "wrap", alignContent: "center" },
  kitFour: { paddingHorizontal: "4%" },
  kitHalf: { width: "50%" },
  kitQuarter: { width: "50%" },
  kitBadge: { position: "absolute", top: 5, left: 5 },
  quick: { minHeight: 44, alignItems: "center", justifyContent: "center", borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white, marginTop: 6 },
})
