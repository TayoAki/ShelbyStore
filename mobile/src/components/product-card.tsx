import { router } from "expo-router"
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"

import { CORE_COLOURWAYS, colourwaySlug } from "@/constants/theme"
import { holeDay, type Hole } from "@/hooks/use-holes"
import { useQuickAdd } from "@/hooks/use-quick-add"
import { trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { colorCounts, hatImage, imagesFor, productPrice, ropeNameFor, type Product } from "@/lib/product"

import { confirmHaptic, Digits, Face, InkText, inkFor, Panel, Window, type Ink } from "./box"
import { Button } from "./button"

/**
 * A colourway of The Rope Cap as its own printed face (APP_SPEC v7 §5.4): the
 * face inked in the colourway's ink, a die-cut window onto the cap, the
 * colour as the heading, status in the meta line under it (never on the
 * photo), the price in tight figures and an Add ink block.
 */
export function ColourwayCard({
  product,
  colourway,
  style,
  source = "app_quick_add",
  flat = false,
}: {
  product: Product
  colourway: string
  style?: StyleProp<ViewStyle>
  source?: string
  /** Printed as a cell of a shared sheet (no keyline of its own). */
  flat?: boolean
}) {
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
    <Shell flat={flat} ink={inkFor(colourway)} style={style}>
      <Pressable accessibilityRole="link" accessibilityLabel={`The Rope Cap in ${colourway}`} onPress={go} style={styles.gap}>
        <Window source={image} alt={`The Rope Cap in ${colourway}`} aspectRatio={1} />
        <View style={styles.text}>
          <InkText variant="cardHeading" numberOfLines={2}>
            {colourway}
          </InkText>
          <InkText variant="meta" numberOfLines={2}>
            {[flat ? null : "The Rope Cap", rope ? `${flat ? rope : rope.toLowerCase()} rope` : null, soldOut ? "Sold out" : "Core"]
              .filter(Boolean)
              .join(" · ")}
          </InkText>
        </View>
      </Pressable>
      <View style={styles.foot}>
        {price ? <Digits value={formatMoney(price.amount, price.currency)} variant="price" /> : null}
        <Button
          title={soldOut ? "Sold out" : "Add"}
          variant="ink"
          size="small"
          style={styles.flex}
          disabled={soldOut}
          loading={quick.pending !== null}
          accessibilityLabel={`Add ${colourway} to bag`}
          onPress={() => {
            trackTap("quick_add", { color: colourway })
            confirmHaptic()
            void quick.addColour(product, colourway, source)
          }}
        />
      </View>
    </Shell>
  )
}

function Shell({ flat, ink, style, children }: { flat: boolean; ink: Ink; style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  return flat ? (
    <Face ink={ink} style={[styles.fill, style]} padded={false}>
      <View style={styles.cell}>{children}</View>
    </Face>
  ) : (
    <Panel ink={ink} style={style}>
      {children}
    </Panel>
  )
}

/** A numbered edition as its own face: live editions add; upcoming ones open the tee sheet. */
export function EditionCard({ hole, style, flat = false }: { hole: Hole; style?: StyleProp<ViewStyle>; flat?: boolean }) {
  const quick = useQuickAdd()
  const product = hole.product
  const colour = hole.colourway
  const go = () => {
    trackTap("pdp_edition_link", { hole: hole.number })
    if (hole.status === "live" && product?.handle) router.push(`/products/${product.handle}`)
    else if (hole.handle) router.push(`/card/${hole.handle}`)
  }
  const meta = [
    `Hole ${hole.number}`,
    hole.editionSize
      ? hole.status === "live" && hole.left != null
        ? `${hole.left} of ${hole.editionSize} left`
        : `Edition of ${hole.editionSize}`
      : null,
    hole.status === "upcoming" ? `Releases ${holeDay(hole.releaseAt ?? hole.dateIso)}` : hole.status === "sold_out" ? "Sold out" : null,
  ]
    .filter(Boolean)
    .join(" · ")
  return (
    <Shell flat={flat} ink={inkFor(colour)} style={style}>
      <Pressable accessibilityRole="link" accessibilityLabel={`Hole ${hole.number}, ${hole.name}`} onPress={go} style={styles.gap}>
        <Window source={hole.image} alt={`The Rope Cap, ${hole.name}`} aspectRatio={1} />
        <View style={styles.text}>
          <InkText variant="cardHeading" numberOfLines={1}>
            {String(hole.number).padStart(2, "0")} {hole.name}
          </InkText>
          <InkText variant="meta" numberOfLines={2}>
            {meta}
          </InkText>
        </View>
      </Pressable>
      <View style={styles.foot}>
        {hole.price != null ? <Digits value={formatMoney(hole.price)} variant="price" /> : null}
        {hole.status === "live" && product && colour ? (
          <Button
            title="Add"
            variant="ink"
            size="small"
            style={styles.flex}
            loading={quick.pending !== null}
            accessibilityLabel={`Add ${hole.name} to bag`}
            onPress={() => {
              confirmHaptic()
              void quick.addColour(product, colour, "app_quick_add")
            }}
          />
        ) : hole.status === "upcoming" ? (
          <Button
            title={flat ? "Tee sheet" : "Join the tee sheet"}
            accessibilityLabel={`Join the tee sheet for ${hole.name}`}
            variant="ink"
            size="small"
            style={styles.flex}
            onPress={go}
          />
        ) : (
          <InkText variant="label">{hole.status === "sold_out" ? "Sold out" : hole.status === "ended" ? "Played" : "Announced"}</InkText>
        )}
      </View>
    </Shell>
  )
}

/** Live counts for "In stock today" etc. */
export function coreCounts(product: Product | undefined) {
  if (!product) return []
  return colorCounts(product).filter((c) => (CORE_COLOURWAYS as readonly string[]).includes(c.color))
}

const styles = StyleSheet.create({
  cell: { padding: 14, gap: 14, flex: 1, justifyContent: "space-between" },
  fill: { flex: 1 },
  flex: { flex: 1 },
  gap: { gap: 14 },
  text: { gap: 4 },
  foot: { flexDirection: "row", alignItems: "center", gap: 12 },
})
