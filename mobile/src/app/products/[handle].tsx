import { Redirect, router, useLocalSearchParams } from "expo-router"
import { useEffect, useMemo, useRef, useState } from "react"
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native"
import Animated, { runOnUI, scrollTo, useAnimatedRef, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Box, confirmHaptic, Face, InkText, inkFor } from "@/components/box"
import { crownRange, SideFace } from "@/components/box-faces"
import { BundleRows } from "@/components/bundle-rows"
import { Button } from "@/components/button"
import { FrontFace } from "@/components/front-panel"
import { TeeSheet } from "@/components/notify-me"
import { ColourwayCard, EditionCard } from "@/components/product-card"
import { Screen } from "@/components/screen"
import { ErrorState, LoadingState } from "@/components/state-views"
import { Swatch } from "@/components/swatch"
import { Text } from "@/components/text"
import { BEAT, colors, colourwayOf, CORE_COLOURWAYS, ease, motion } from "@/constants/theme"
import { holeDate, holeDay, unitsLeft, useHoles } from "@/hooks/use-holes"
import { useProduct } from "@/hooks/use-products"
import { useQuickAdd } from "@/hooks/use-quick-add"
import { useRecentlyViewed } from "@/hooks/use-recently-viewed"
import { trackTap, useTrackOnce } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { holeByProduct } from "@/lib/holes"
import { openWeb } from "@/lib/links"
import { TurnFace } from "@/lib/motion"
import { POLICY } from "@/lib/policy"
import {
  colorCounts,
  colorOptionOf,
  defaultSelection,
  detailsOf,
  editionOf,
  findVariant,
  imagesFor,
  isOffer,
  productMeta,
  productPrice,
  variantPrice,
  variantStock,
  type Product,
} from "@/lib/product"

/**
 * The Rope Cap PDP and each edition's PDP (APP_SPEC v7 §5.1): the box's front
 * face (window, model, meta line, ink stripes, price and Add to bag), its side
 * face (the crown on the ruler, the spec) and a details face, joined by one rope line.
 */
export default function ProductScreen() {
  const { handle, color, section } = useLocalSearchParams<{ handle: string; color?: string; section?: string }>()
  const { data: product, isLoading, error, refetch } = useProduct(handle)
  const viewed = useRecentlyViewed()
  const { record } = viewed

  useEffect(() => {
    if (product?.handle && !isOffer(product)) void record(product.handle)
  }, [product?.handle, product, record])

  if (isLoading) {
    return (
      <Screen back>
        <LoadingState />
      </Screen>
    )
  }
  if (product && isOffer(product)) return <Redirect href={{ pathname: "/offer/[handle]", params: { handle: product.handle! } }} />
  if (!product) {
    // Editions are drafts until their hole goes live: send the shopper to the hole.
    const hole = handle ? holeByProduct(handle) : null
    if (hole?.releaseHandle && !error) return <Redirect href={{ pathname: "/card/[handle]", params: { handle: hole.releaseHandle } }} />
    if (
      handle &&
      /^(everyday-cap|trucker|ribbed-beanie|performance-cap|corduroy-cap|bucket-hat|waxed-field-cap|everyday-two-pack)$/.test(handle)
    ) {
      return <Redirect href="/products/rope-cap" />
    }
    return (
      <Screen back>
        <ErrorState error={error ?? new Error("We couldn't find that cap.")} onRetry={() => refetch()} />
      </Screen>
    )
  }
  return <ProductView product={product} initialColor={color ?? null} openScorecard={section === "scorecard"} />
}

function ProductView({ product, initialColor, openScorecard }: { product: Product; initialColor: string | null; openScorecard: boolean }) {
  const insets = useSafeAreaInsets()
  const quick = useQuickAdd()
  const { holes } = useHoles()
  const colorOpt = colorOptionOf(product)
  const edition = editionOf(product)
  const isEditionPdp = !!edition && edition.hole >= 2
  // The core PDP opens on Tour White unless a colour was asked for (?color=).
  const preferred = initialColor ?? CORE_COLOURWAYS.find((c) => colorOpt?.values.includes(c)) ?? null
  const [selection, setSelection] = useState<Record<string, string>>(() => defaultSelection(product, preferred))
  const colour = colorOpt ? (selection[colorOpt.id] ?? null) : null
  const variant = findVariant(product, selection)
  const stock = variant ? variantStock(variant) : null
  const price = (variant && variantPrice(variant)) ?? productPrice(product)
  const meta = productMeta(product)
  const hole = isEditionPdp ? (holes.find((h) => h.number === edition!.hole) ?? null) : null
  const left = isEditionPdp ? unitsLeft(product) : null
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const [scorecardY, setScorecardY] = useState(0)
  const scrolled = useRef(false)
  const [cta, setCta] = useState({ y: 0, h: 0 })
  const [sticky, setSticky] = useState(false)
  const stickyO = useSharedValue(0)
  const stickyStyle = useAnimatedStyle(() => ({ opacity: stickyO.value, transform: [{ translateY: (1 - stickyO.value) * 24 }] }))

  useTrackOnce("product_viewed", product.id, () => ({ product_id: product.id, handle: product.handle, hole: edition?.hole }))

  // A new ?color= (search, tiles, deep links) selects that colour.
  const [seenColor, setSeenColor] = useState(initialColor)
  if (initialColor !== seenColor) {
    setSeenColor(initialColor)
    if (initialColor && colorOpt && colorOpt.values.includes(initialColor)) {
      setSelection((s) => ({ ...s, [colorOpt.id]: initialColor }))
    }
  }

  useEffect(() => {
    if (!openScorecard || !scorecardY || scrolled.current) return
    const y = scorecardY
    const t = setTimeout(() => {
      scrolled.current = true
      runOnUI(() => {
        "worklet"
        scrollTo(scrollRef, 0, y, true)
      })()
    }, 400)
    return () => clearTimeout(t)
  }, [openScorecard, scorecardY, scrollRef])

  useEffect(() => {
    stickyO.set(withTiming(sticky ? 1 : 0, { duration: BEAT, easing: ease.box, reduceMotion: motion.reduceMotion }))
  }, [sticky, stickyO])

  const images = useMemo(() => imagesFor(product, colour), [colour, product])
  const limitedHoles = holes.filter((h) => h.number >= 2 && h.colourway && (h.status === "live" || h.status === "upcoming"))
  const counts = colorCounts(product)

  const selectCore = (c: string) => {
    if (isEditionPdp) {
      router.push({ pathname: "/products/[handle]", params: { handle: "rope-cap", color: c } })
      return
    }
    if (!colorOpt) return
    setSelection((s) => ({ ...s, [colorOpt.id]: c }))
    router.setParams({ color: c })
  }

  const add = () => {
    if (!variant) return
    trackTap("add_to_cart")
    void quick.addVariant(product, variant, "app_pdp", { detail: `${colour ?? ""} / One Size` })
  }

  const upcomingEdition = isEditionPdp && hole?.status === "upcoming"
  const crown = crownRange(product)
  const crownText = crown ? `Mid crown ${crown[0] === crown[1] ? crown[0] : `${crown[0]}\u2060–\u2060${crown[1]}`}\u00A0cm` : "Mid crown"
  const metaLine = isEditionPdp
    ? `No. ${String(edition!.hole).padStart(2, "0")} · Hole ${edition!.hole}${edition!.size ? ` · Edition of ${edition!.size}` : ""} · ${hole?.status === "upcoming" ? "Releases" : "Released"} ${holeDate(hole?.dateIso).split(" · ")[0]}`
    : `No.\u00A001 · Core · ${crownText} · One\u00A0size`
  const details = Object.fromEntries(detailsOf(product))
  const rope = colourwayOf(colour).rope
  // Content starts 12pt under the header; the face's keyline is 2pt and its padding 20pt.
  const ctaBottom = 12 + 2 + 20 + cta.y + cta.h

  return (
    <Screen
      back
      scrollRef={scrollRef}
      onScrollY={(y) => setSticky(cta.h > 0 && y > ctaBottom)}
      overlay={
        upcomingEdition ? null : (
          <Animated.View
            pointerEvents={sticky ? "auto" : "none"}
            style={[styles.sticky, { paddingBottom: 12 + insets.bottom }, stickyStyle]}>
            <View style={styles.stickyRow}>
              <View style={styles.flex}>
                <Text variant="cardTitle" numberOfLines={1}>
                  {product.title}
                  {colour && !isEditionPdp ? `, ${colour}` : ""}
                </Text>
                {price ? <Text variant="priceSm">{formatMoney(price.amount, price.currency)}</Text> : null}
              </View>
              <Button
                title={stock?.state === "sold_out" ? "Sold out" : "Add to bag"}
                variant="secondary"
                disabled={!variant || stock?.state === "sold_out"}
                loading={quick.pending !== null}
                onPress={() => {
                  trackTap("sticky_add_to_cart")
                  confirmHaptic()
                  add()
                }}
              />
            </View>
          </Animated.View>
        )
      }>
      <View style={styles.wrap}>
        <Box rope={rope}>
          <FrontFace
            title={product.title ?? "The Rope Cap"}
            meta={metaLine}
            colourways={isEditionPdp ? [colour ?? hole?.colourway ?? ""].filter(Boolean) : CORE_COLOURWAYS}
            colour={colour}
            onSelect={selectCore}
            images={images}
            ink={inkFor(colour)}
            price={price}
            stock={stock}
            soldOut={isEditionPdp ? [] : counts.filter((c) => c.state === "sold_out").map((c) => c.color)}
            pending={quick.pending !== null}
            onAdd={variant ? add : undefined}
            onCtaLayout={(y, h) => setCta((c) => (c.y === y && c.h === h ? c : { y, h }))}
            action={
              upcomingEdition && hole?.release ? (
                <TeeSheet releaseId={hole.release.id} hole={hole.number} name={hole.name} showEyebrow={false} />
              ) : undefined
            }>
            <InkText variant="meta">
              Any two caps ship free ($85+). {POLICY.returns}.
              {isEditionPdp && edition!.size
                ? ` Edition of ${edition!.size}${left != null ? `, ${left} left` : ""}. ${POLICY.limitedRun}`
                : ""}
            </InkText>
            {limitedHoles.length || isEditionPdp ? (
              <View style={styles.gap8}>
                <InkText variant="label">{isEditionPdp ? "Core colors" : "Numbered editions"}</InkText>
                <View style={styles.chips}>
                  {isEditionPdp
                    ? CORE_COLOURWAYS.map((c) => (
                        <Swatch key={c} name={c} onPress={() => selectCore(c)} accessibilityHint="Opens the core cap in this color" />
                      ))
                    : limitedHoles.map((h) => (
                        <Swatch
                          key={h.number}
                          name={h.colourway!}
                          caption={h.status === "upcoming" ? holeDay(h.releaseAt ?? h.dateIso) : `Hole ${h.number}`}
                          accessibilityHint={h.status === "upcoming" ? "Opens the hole on The Card" : "Opens the edition"}
                          onPress={() => {
                            trackTap("pdp_edition_link", { hole: h.number })
                            if (h.status === "live" && h.product?.handle) router.push(`/products/${h.product.handle}`)
                            else if (h.handle) router.push(`/card/${h.handle}`)
                          }}
                        />
                      ))}
                </View>
              </View>
            ) : null}
            {!isEditionPdp ? <BundleRows /> : null}
            <View style={styles.linkRow}>
              <Button
                title="Fit guide"
                variant="link"
                onPress={() => {
                  trackTap("fit_guide")
                  openWeb("/fit-guide")
                }}
              />
              <Button
                title="Which color? Take the quiz"
                variant="link"
                onPress={() => {
                  trackTap("pdp_quiz")
                  openWeb("/quiz")
                }}
              />
            </View>
          </FrontFace>
          <View onLayout={(e) => setScorecardY(e.nativeEvent.layout.y + 12)}>
            <TurnFace>
              <SideFace product={product} colour={colour} />
            </TurnFace>
          </View>
          <Face>
            <InkText variant="panelTitle" accessibilityRole="header">
              The details
            </InkText>
            {product.description ? <InkText variant="bodyLong">{product.description}</InkText> : null}
            {meta.fitNotes ? <InkText variant="bodyLong">{meta.fitNotes}</InkText> : null}
            <InkText variant="bodyLong">{[details.Care, `${POLICY.returns}.`, POLICY.dispatch + "."].filter(Boolean).join(" ")}</InkText>
          </Face>
        </Box>
        <AlsoLike product={product} colour={colour} />
      </View>
    </Screen>
  )
}

function AlsoLike({ product, colour }: { product: Product; colour: string | null }) {
  const { width } = useWindowDimensions()
  const { holes } = useHoles()
  const core = product.handle === "rope-cap" ? product : null
  const cardW = Math.round(Math.min(width, 720) * 0.72)
  const items: { key: string; node: React.ReactNode }[] = []
  if (core) {
    for (const c of CORE_COLOURWAYS) {
      if (c === colour) continue
      items.push({ key: c, node: <ColourwayCard product={core} colourway={c} style={{ width: cardW }} /> })
    }
  }
  for (const h of holes) {
    if (h.number < 2 || h.status !== "live" || h.product?.id === product.id) continue
    items.push({ key: `h${h.number}`, node: <EditionCard hole={h} style={{ width: cardW }} /> })
  }
  if (!items.length) return null
  return (
    <View style={styles.also}>
      <Text variant="section" accessibilityRole="header">
        The other colors
      </Text>
      <FlatList
        data={items}
        horizontal
        keyExtractor={(i) => i.key}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardW + 10}
        decelerationRate="fast"
        contentContainerStyle={styles.alsoList}
        renderItem={({ item }) => <View onTouchStart={() => trackTap("pdp_also_like")}>{item.node}</View>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { marginHorizontal: 12 },
  gap8: { gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  linkRow: { flexDirection: "row", flexWrap: "wrap", columnGap: 18 },
  also: { marginTop: 28, gap: 12 },
  alsoList: { gap: 10 },
  sticky: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.paper,
    borderTopWidth: 2,
    borderTopColor: colors.ink,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  stickyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
})
