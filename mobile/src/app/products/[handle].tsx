import { Image } from "expo-image"
import { Redirect, router, useLocalSearchParams } from "expo-router"
import { useEffect, useMemo, useRef, useState } from "react"
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native"
import Animated, { runOnUI, scrollTo, useAnimatedRef, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useHeaderInset } from "@/components/app-header"
import { BundleRows } from "@/components/bundle-rows"
import { Button } from "@/components/button"
import { EditionBadge } from "@/components/edition-badge"
import { FitScale } from "@/components/fit-scale"
import { Gallery } from "@/components/gallery"
import { Badge } from "@/components/badge"
import { TeeSheet } from "@/components/notify-me"
import { ColourwayCard, EditionCard } from "@/components/product-card"
import { MaterialRing } from "@/components/ring"
import { RopeRule } from "@/components/rope-rule"
import { productScoreRows, Scorecard } from "@/components/scorecard"
import { Screen } from "@/components/screen"
import { SegmentedControl } from "@/components/segmented-control"
import { ErrorState, LoadingState } from "@/components/state-views"
import { StockLine } from "@/components/stock-line"
import { Swatch } from "@/components/swatch"
import { Text } from "@/components/text"
import { colors, CORE_COLOURWAYS, ease, golf, motion, radius, shadow } from "@/constants/theme"
import { holeDate, holeDay, unitsLeft, useHoles } from "@/hooks/use-holes"
import { useProduct } from "@/hooks/use-products"
import { useQuickAdd } from "@/hooks/use-quick-add"
import { useRecentlyViewed } from "@/hooks/use-recently-viewed"
import { trackTap, useTrackOnce } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { holeByProduct } from "@/lib/holes"
import { openWeb } from "@/lib/links"
import { Reveal } from "@/lib/motion"
import { POLICY } from "@/lib/policy"
import {
  colorCounts,
  colorOptionOf,
  crownCmOf,
  defaultSelection,
  detailsOf,
  editionOf,
  findVariant,
  fitProfileOf,
  hatImage,
  imagesFor,
  isOffer,
  productMeta,
  productPrice,
  ropeNameFor,
  variantPrice,
  variantStock,
  type Product,
} from "@/lib/product"

type Group = "all" | "core" | "limited"

/**
 * The Rope Cap PDP and each edition's PDP (APP_SPEC G.5 Product): web G.6.3
 * in v5's native buy card, with the scorecard band as this screen's golf band.
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
    if (handle && /^(everyday-cap|trucker|ribbed-beanie|performance-cap|corduroy-cap|bucket-hat|waxed-field-cap|everyday-two-pack)$/.test(handle)) {
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
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const pillInset = useHeaderInset()
  const quick = useQuickAdd()
  const { holes } = useHoles()
  const colorOpt = colorOptionOf(product)
  const edition = editionOf(product)
  const isEditionPdp = !!edition && edition.hole >= 2
  // The core PDP opens on Tour White unless a colour was asked for (?color=).
  const preferred = initialColor ?? CORE_COLOURWAYS.find((c) => colorOpt?.values.includes(c)) ?? null
  const [selection, setSelection] = useState<Record<string, string>>(() => defaultSelection(product, preferred))
  const [group, setGroup] = useState<Group>(isEditionPdp ? "limited" : "all")
  const colour = colorOpt ? selection[colorOpt.id] ?? null : null
  const variant = findVariant(product, selection)
  const stock = variant ? variantStock(variant) : null
  const price = (variant && variantPrice(variant)) ?? productPrice(product)
  const meta = productMeta(product)
  const fit = fitProfileOf(product)
  const crownCm = crownCmOf(product)
  const rope = ropeNameFor(product, colour)
  const hole = isEditionPdp ? holes.find((h) => h.number === edition!.hole) ?? null : null
  const left = isEditionPdp ? unitsLeft(product) : null
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const [scorecardY, setScorecardY] = useState(0)
  const scrolled = useRef(false)
  const [cta, setCta] = useState({ buyY: 0, y: 0, h: 0 })
  const [sticky, setSticky] = useState(false)
  const stickyO = useSharedValue(0)
  const stickyStyle = useAnimatedStyle(() => ({ opacity: stickyO.value }))

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
    const y = scorecardY - 80
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
    stickyO.set(withTiming(sticky ? 1 : 0, { duration: 150, easing: ease.tailwind, reduceMotion: motion.reduceMotion }))
  }, [sticky, stickyO])

  const images = useMemo(() => imagesFor(product, colour), [colour, product])
  const coreColours = [...CORE_COLOURWAYS]
  const limitedHoles = holes.filter((h) => h.number >= 2 && h.colourway && (h.status === "live" || h.status === "upcoming"))

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
  const ctaLabel = stock?.state === "sold_out" ? "Sold out" : `Add to bag – ${price ? formatMoney(price.amount, price.currency) : ""}`
  const subline = isEditionPdp
    ? `Hole ${edition!.hole} · Limited edition · ${hole?.status === "upcoming" ? "Releases" : "Released"} ${holeDate(hole?.dateIso).split(" · ")[0]}`
    : "One size · Core color"
  const details = Object.fromEntries(detailsOf(product))
  const slide = Math.min(width, 720) - 20

  return (
    <Screen
      back
      scrollRef={scrollRef}
      onScrollY={(y) => {
        const bottom = cta.buyY + cta.y + cta.h
        setSticky(bottom > 0 && y + pillInset > bottom)
      }}
      overlay={
        <Animated.View
          pointerEvents={sticky ? "auto" : "none"}
          style={[styles.sticky, shadow.xl, { paddingBottom: 20 + insets.bottom }, stickyStyle]}>
          <Text variant="body" style={styles.centerText} numberOfLines={1}>
            {product.title}
            {colour && !isEditionPdp ? `, ${colour}` : ""} · {price ? formatMoney(price.amount, price.currency) : ""}
          </Text>
          {upcomingEdition ? null : (
            <Button
              title={ctaLabel}
              size="atc"
              disabled={!variant || stock?.state === "sold_out"}
              loading={quick.pending !== null}
              onPress={() => {
                trackTap("sticky_add_to_cart")
                add()
              }}
            />
          )}
        </Animated.View>
      }>
      <Text variant="meta" tone="muted" style={styles.crumb}>
        Home / The Rope Cap{isEditionPdp ? ` / ${hole?.name ?? product.title}` : ""}
      </Text>
      <View style={styles.galleryWrap}>
        <Gallery images={images} title={`${product.title}${colour ? `, ${colour}` : ""}`} colourKey={colour} />
        <View style={styles.galleryBadge} pointerEvents="none">
          {isEditionPdp ? <EditionBadge hole={edition!.hole} size={edition!.size} /> : <Badge label="Core" white />}
        </View>
      </View>

      <View
        style={styles.buyCard}
        onLayout={(e) => {
          const y = e.nativeEvent.layout.y
          setCta((c) => (c.buyY === y ? c : { ...c, buyY: y }))
        }}>
        <Text variant="pdpTitle" accessibilityRole="header">
          {product.title}
        </Text>
        <Text variant="subline" tone="muted">
          {subline}
        </Text>
        <View style={styles.priceRow}>
          {price ? <Text variant="price">{formatMoney(price.amount, price.currency)}</Text> : null}
          <View style={styles.pricePill}>
            <Text variant="pricePill">+ Any two ship free</Text>
          </View>
        </View>
        <RopeRule colourway={colour} />

        <View style={styles.block}>
          <View style={styles.colorLabel}>
            <Text variant="label">Color:</Text>
            <Text variant="meta">{colour}</Text>
            <Text variant="meta" tone="muted">
              {isEditionPdp ? `(Hole ${edition!.hole}${edition!.size ? `, edition of ${edition!.size}` : ""})` : "(Core)"}
            </Text>
          </View>
          {rope ? (
            <Text variant="meta" tone="muted">
              {rope} rope
            </Text>
          ) : null}
          {limitedHoles.length ? (
            <SegmentedControl
              options={[
                { value: "all", label: "All" },
                { value: "core", label: "Core" },
                { value: "limited", label: "Limited" },
              ]}
              value={group}
              onChange={(g: Group) => {
                trackTap("color_pill", { group: g })
                setGroup(g)
              }}
            />
          ) : null}
          <View style={styles.swatches}>
            {group !== "limited"
              ? coreColours.map((c) => (
                  <Swatch
                    key={c}
                    name={c}
                    selected={!isEditionPdp && c === colour}
                    soldOut={!isEditionPdp && colorCounts(product).find((x) => x.color === c)?.state === "sold_out"}
                    onPress={() => selectCore(c)}
                  />
                ))
              : null}
            {group !== "core"
              ? limitedHoles.map((h) => (
                  <Swatch
                    key={h.number}
                    name={h.colourway!}
                    selected={isEditionPdp && h.number === edition!.hole}
                    caption={h.status === "upcoming" ? holeDay(h.releaseAt ?? h.dateIso) : null}
                    accessibilityHint={h.status === "upcoming" ? "Opens the hole on The Card" : "Opens the edition"}
                    onPress={() => {
                      trackTap("pdp_edition_link", { hole: h.number })
                      if (h.status === "live" && h.product?.handle) router.push(`/products/${h.product.handle}`)
                      else if (h.handle) router.push(`/card/${h.handle}`)
                    }}
                  />
                ))
              : null}
          </View>
        </View>

        <View style={styles.oneSize}>
          <Text variant="body">
            <Text variant="body" style={{ fontFamily: "Inter_500Medium" }}>
              One size
            </Text>{" "}
            · {POLICY.oneSize}
          </Text>
          <Button
            title="Fit guide"
            variant="link"
            onPress={() => {
              trackTap("fit_guide")
              openWeb("/fit-guide")
            }}
          />
        </View>

        {fit ? (
          <View style={styles.block}>
            <FitScale
              label="Crown height"
              value={`${fit.crown}${crownCm ? ` · about ${crownCm} cm` : ""}`}
              steps={["Low", "Mid", "Tall"]}
              active={["Low", "Mid", "Tall"].indexOf(fit.crown)}
            />
            <FitScale
              label="Structure"
              value={fit.structure}
              steps={["Unstructured", "Semi", "Structured"]}
              active={["Unstructured", "Semi-structured", "Structured"].indexOf(fit.structure)}
            />
          </View>
        ) : null}

        <View
          onLayout={(e) => {
            const { y, height } = e.nativeEvent.layout
            setCta((c) => (c.y === y && c.h === height ? c : { ...c, y, h: height }))
          }}
          style={styles.block}>
          {upcomingEdition && hole?.release ? (
            <TeeSheet releaseId={hole.release.id} hole={hole.number} name={hole.name} />
          ) : (
            <Button
              title={ctaLabel}
              size="atc"
              disabled={!variant || stock?.state === "sold_out"}
              loading={quick.pending !== null}
              onPress={add}
            />
          )}
          <Text variant="meta" tone="muted" style={styles.centerText}>
            {POLICY.shipping}
          </Text>
          {stock ? <StockLine state={stock.state} quantity={stock.quantity} /> : null}
          {isEditionPdp ? (
            <>
              {edition!.size ? (
                <Text variant="edition" tone="midnight">
                  Edition of {edition!.size}
                  {left != null ? ` · ${left} left` : ""}
                </Text>
              ) : null}
              <Text variant="meta" tone="muted">
                {POLICY.limitedRun}
              </Text>
            </>
          ) : null}
        </View>

        {!isEditionPdp ? <BundleRows /> : null}

        <Button
          title="Not sure which color? Take the 30-second quiz"
          variant="link"
          onPress={() => {
            trackTap("pdp_quiz")
            openWeb("/quiz")
          }}
        />
      </View>

      <View style={styles.scoreBand} onLayout={(e) => setScorecardY(e.nativeEvent.layout.y)}>
        <Reveal threshold={openScorecard ? 50 : 0.85}>
          <ScorecardBand product={product} colour={colour} edition={isEditionPdp ? { size: edition!.size, left } : null} slide={slide} />
        </Reveal>
      </View>

      <Reveal style={styles.details}>
        <Text variant="label">The details</Text>
        {product.description ? (
          <Text variant="bodyLong" tone="charcoal">
            {product.description}
          </Text>
        ) : null}
        {meta.fitNotes ? (
          <Text variant="bodyLong" tone="charcoal">
            {meta.fitNotes}
          </Text>
        ) : null}
        <Text variant="label" style={{ marginTop: 12 }}>
          Care & returns
        </Text>
        <Text variant="bodyLong" tone="charcoal">
          {[details.Care, `${POLICY.returns}.`, POLICY.dispatch + "."].filter(Boolean).join(" ")}
        </Text>
      </Reveal>

      {Object.keys(details).length >= 4 ? (
        <MaterialRing
          background={hatImage("rope-clubhouse.jpg")}
          centre={images[0] ?? null}
          callouts={[
            { title: "Crown", body: details.Crown ?? "" },
            { title: "Rope", body: details.Rope ?? "" },
            { title: "Brim", body: details.Brim ?? "" },
            { title: "Closure", body: details.Closure ?? "" },
          ].filter((c) => !!c.body)}
        />
      ) : null}

      <AlsoLike product={product} colour={colour} />
    </Screen>
  )
}

function ScorecardBand({
  product,
  colour,
  edition,
  slide,
}: {
  product: Product
  colour: string | null
  edition: { size: number | null; left: number | null } | null
  slide: number
}) {
  const side = imagesFor(product, colour)[2] ?? imagesFor(product, colour)[0]
  return (
    <View style={styles.band}>
      <Text variant="eyebrow" tone="tint">
        The scorecard
      </Text>
      <Text variant="section" tone="inverse">
        Every spec, on one card.
      </Text>
      <Text variant="kicker" tone="tint">
        Ruled like the card in your back pocket.
      </Text>
      {side ? (
        <View style={[styles.sidePhoto, { height: (slide - 40) * 0.7 }]}>
          <Image source={side} style={styles.fill} contentFit="contain" />
        </View>
      ) : null}
      <Scorecard title={product.title ?? "The Rope Cap"} rows={productScoreRows(product, colour, edition)} />
    </View>
  )
}

function AlsoLike({ product, colour }: { product: Product; colour: string | null }) {
  const { width } = useWindowDimensions()
  const { holes } = useHoles()
  const core = product.handle === "rope-cap" ? product : null
  const cardW = Math.round(Math.min(width, 720) / 1.3)
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
    <Reveal style={styles.also}>
      <Text variant="tab" style={styles.alsoTitle}>
        You may also like
      </Text>
      <FlatList
        data={items}
        horizontal
        keyExtractor={(i) => i.key}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardW + 10}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 10, gap: 10 }}
        renderItem={({ item }) => <View onTouchStart={() => trackTap("pdp_also_like")}>{item.node}</View>}
      />
    </Reveal>
  )
}

const styles = StyleSheet.create({
  fill: { width: "100%", height: "100%" },
  crumb: { marginHorizontal: 20, marginBottom: 12 },
  galleryWrap: { position: "relative" },
  galleryBadge: { position: "absolute", top: 10, left: 20 },
  buyCard: { margin: 10, backgroundColor: colors.white, borderRadius: radius.xl, padding: 20, gap: 24 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  pricePill: { backgroundColor: colors.naturalWhite, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  block: { gap: 12 },
  colorLabel: { flexDirection: "row", gap: 6, alignItems: "baseline", flexWrap: "wrap" },
  swatches: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  oneSize: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  centerText: { textAlign: "center" },
  scoreBand: { marginTop: 30 },
  band: { backgroundColor: golf.green, marginHorizontal: 10, borderRadius: radius.xl, padding: 20, gap: 14 },
  sidePhoto: { backgroundColor: colors.white, borderRadius: radius.xxl, overflow: "hidden" },
  details: { margin: 10, marginTop: 20, backgroundColor: colors.white, borderRadius: radius.xl, padding: 20, gap: 8 },
  also: { marginTop: 30, gap: 12 },
  alsoTitle: { paddingHorizontal: 20 },
  sticky: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    paddingHorizontal: 28,
    paddingTop: 20,
    gap: 12,
  },
})

