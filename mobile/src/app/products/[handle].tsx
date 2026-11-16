import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { Redirect, router, useLocalSearchParams } from "expo-router"
import { useEffect, useMemo, useRef, useState } from "react"
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from "react-native"
import Animated, { runOnUI, scrollTo, useAnimatedRef, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Accordion } from "@/components/accordion"
import { BundleRows } from "@/components/bundle-rows"
import { Button } from "@/components/button"
import { CrownCompare } from "@/components/crown-compare"
import { TeeSheet } from "@/components/notify-me"
import { ColourwayCard, EditionCard, MiniCard } from "@/components/product-card"
import { Screen } from "@/components/screen"
import { ErrorState, LoadingState } from "@/components/state-views"
import { StockLine } from "@/components/stock-line"
import { Swatch } from "@/components/swatch"
import { Text } from "@/components/text"
import { Tile } from "@/components/tile"
import { colors, colourwayOf, CORE_COLOURWAYS, dur, ease, fonts, layout, MAX_CONTENT_WIDTH, motion } from "@/constants/theme"
import { holeDate, holeDay, unitsLeft, useHoles } from "@/hooks/use-holes"
import { useCatalog, useContentSeries, useProduct } from "@/hooks/use-products"
import { useQuickAdd } from "@/hooks/use-quick-add"
import { useRecentlyViewed } from "@/hooks/use-recently-viewed"
import { trackTap, useTrackOnce } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { confirmHaptic } from "@/lib/haptics"
import { holeByProduct } from "@/lib/holes"
import { openWeb } from "@/lib/links"
import { useStickyBar } from "@/lib/motion"
import { POLICY } from "@/lib/policy"
import {
  cardImages,
  colorCounts,
  colorOptionOf,
  crownRange,
  defaultSelection,
  detailsOf,
  editionOf,
  findVariant,
  hatImage,
  imagesFor,
  isOffer,
  productMeta,
  productPrice,
  variantPrice,
  variantStock,
  type Product,
} from "@/lib/product"

const SPEC_ORDER = ["Crown", "Panels", "Rope", "Brim", "Closure", "Fabric", "Sweatband", "Care"]
const CARD = 164

/**
 * The Rope Cap PDP and each edition's PDP (APP_SPEC v8 V8.5 §3, web E.6.3):
 * the title block, a 5:6 paging gallery on #F6F6F6, the buy block (edition
 * meta, colour picker, Add To Bag or the tee sheet, the kits, policy lines,
 * description, accordions), then the rails. A sticky bar (M18) takes over once
 * the Add button has scrolled away.
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
  return <ProductView product={product} initialColor={color ?? null} openScorecard={section === "scorecard"} viewedHandles={viewed.handles} />
}

function ProductView({
  product,
  initialColor,
  openScorecard,
  viewedHandles,
}: {
  product: Product
  initialColor: string | null
  openScorecard: boolean
  viewedHandles: string[]
}) {
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
  const [fitY, setFitY] = useState(0)
  const scrolled = useRef(false)
  const [buyY, setBuyY] = useState(0)
  const [cta, setCta] = useState<{ y: number; h: number } | null>(null)
  const sticky = useStickyBar(cta ? buyY + cta.y + cta.h : null)

  useTrackOnce("product_viewed", product.id, () => ({ product_id: product.id, handle: product.handle, hole: edition?.hole }))

  // A new ?color= (search, tiles, deep links) selects that colour.
  const [seenColor, setSeenColor] = useState(initialColor)
  if (initialColor !== seenColor) {
    setSeenColor(initialColor)
    if (initialColor && colorOpt && colorOpt.values.includes(initialColor)) {
      setSelection((s) => ({ ...s, [colorOpt.id]: initialColor }))
    }
  }

  // ?section=scorecard (the old fit "scorecard" deep link) lands on the Fit accordion, open.
  useEffect(() => {
    if (!openScorecard || !fitY || scrolled.current) return
    const y = fitY
    const t = setTimeout(() => {
      scrolled.current = true
      runOnUI(() => {
        "worklet"
        scrollTo(scrollRef, 0, y, true)
      })()
    }, 400)
    return () => clearTimeout(t)
  }, [openScorecard, fitY, scrollRef])

  const images = useMemo(() => imagesFor(product, colour), [colour, product])
  const limitedHoles = holes.filter((h) => h.number >= 2 && h.colourway && (h.status === "live" || h.status === "upcoming"))
  const counts = colorCounts(product)
  const soldOutColours = counts.filter((c) => c.state === "sold_out").map((c) => c.color)

  const selectCore = (c: string) => {
    if (isEditionPdp) {
      router.push({ pathname: "/products/[handle]", params: { handle: "rope-cap", color: c } })
      return
    }
    if (!colorOpt) return
    trackTap("color_pill", { color: c })
    setSelection((s) => ({ ...s, [colorOpt.id]: c }))
    router.setParams({ color: c })
  }

  const add = () => {
    if (!variant) return
    trackTap("add_to_cart")
    void quick.addVariant(product, variant, "app_pdp", { detail: `${colour ?? ""} / One Size` })
  }

  const upcomingEdition = isEditionPdp && hole?.status === "upcoming"
  const out = stock?.state === "sold_out"
  const crown = crownRange(product)
  const crownText = crown ? `Mid crown ${crown[0] === crown[1] ? crown[0] : `${crown[0]}⁠–⁠${crown[1]}`} cm` : "Mid crown"
  const metaLine = isEditionPdp
    ? `No. ${String(edition!.hole).padStart(2, "0")} · Hole ${edition!.hole}${edition!.size ? ` · Edition of ${edition!.size}` : ""} · ${hole?.status === "upcoming" ? "Releases" : "Released"} ${holeDate(hole?.dateIso).split(" · ")[0]}`
    : `No. 01 · Core · ${crownText} · One size`
  const details = Object.fromEntries(detailsOf(product))
  const specRows = [...SPEC_ORDER.filter((k) => details[k]).map((k) => [k, details[k]] as const), ["Fit", `One size, ${POLICY.oneSize}`] as const]
  const bullets = ["Crown", "Rope", "Closure"].filter((k) => details[k]).map((k) => [k, details[k]] as const)
  const rope = colourwayOf(colour)
  const badge = isEditionPdp ? `No. ${String(edition!.hole).padStart(2, "0")}` : out ? "Sold out" : null

  return (
    <Screen
      back
      scrollRef={scrollRef}
      onScrollY={sticky.onScrollY}
      overlay={
        upcomingEdition ? null : (
          <StickyBar
            visible={sticky.visible}
            style={sticky.style}
            bottomInset={insets.bottom}
            colours={isEditionPdp ? [] : CORE_COLOURWAYS}
            colour={colour}
            soldOut={soldOutColours}
            onSelect={selectCore}
            disabled={!variant || out}
            label={out ? "Sold out" : "Add To Bag"}
            loading={quick.pending !== null}
            onAdd={() => {
              trackTap("sticky_add_to_cart")
              confirmHaptic()
              add()
            }}
          />
        )
      }>
      <View style={styles.titleBlock}>
        <Text variant="breadcrumb">{isEditionPdp ? "Home / The Card" : "Home / Shop"}</Text>
        <Text variant="titleProduct" accessibilityRole="header">
          {product.title}
        </Text>
        <Text variant="meta">Free shipping on ${POLICY.freeShippingThreshold}+</Text>
        {price ? <Text variant="priceProduct">{formatMoney(price.amount, price.currency)}</Text> : null}
      </View>

      <Gallery images={images} colour={colour} title={product.title ?? "The Rope Cap"} badge={badge} badgeDark={!isEditionPdp} />

      <View style={styles.buy} onLayout={(e) => setBuyY(e.nativeEvent.layout.y)}>
        <View style={styles.gap4}>
          <Text variant="eyebrowSm">{metaLine}</Text>
          {stock && !upcomingEdition ? <StockLine state={stock.state} quantity={stock.quantity} /> : null}
          {isEditionPdp && edition!.size ? (
            <Text variant="meta" tone="muted">
              Edition of {edition!.size}
              {left != null ? `, ${left} left` : ""}. {POLICY.limitedRun}
            </Text>
          ) : null}
        </View>

        {!isEditionPdp && colorOpt && colorOpt.values.length > 1 ? (
          <View style={styles.gap8}>
            <Text variant="bodyPdp">
              <Text variant="bodyPdp" style={styles.bold}>
                Color:{" "}
              </Text>
              {colour}
              {rope.ropeName ? `, ${rope.ropeName.toLowerCase()} rope` : ""}
            </Text>
            <View style={styles.swatches}>
              {CORE_COLOURWAYS.filter((c) => colorOpt.values.includes(c)).map((c) => (
                <Swatch key={c} name={c} selected={c === colour} soldOut={soldOutColours.includes(c)} onPress={() => selectCore(c)} />
              ))}
            </View>
          </View>
        ) : null}

        {limitedHoles.length || isEditionPdp ? (
          <View style={styles.gap8}>
            <Text variant="labelCaps">{isEditionPdp ? "Core colors" : "Numbered editions"}</Text>
            <View style={styles.swatches}>
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

        <View onLayout={(e) => setCta({ y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height })} style={styles.gap8}>
          {upcomingEdition && hole?.release ? (
            <TeeSheet releaseId={hole.release.id} hole={hole.number} name={hole.name} />
          ) : (
            <Button
              title={out ? "Sold out" : "Add To Bag"}
              variant="primary"
              disabled={!variant || out}
              loading={quick.pending !== null}
              onPress={() => {
                confirmHaptic()
                add()
              }}
            />
          )}
          {out && isEditionPdp && hole?.release ? <TeeSheet releaseId={hole.release.id} hole={hole.number} name={hole.name} /> : null}
        </View>

        {!isEditionPdp ? <BundleRows /> : null}

        <Text variant="meta" tone="muted">
          Any two caps ship free (${POLICY.freeShippingThreshold}+) · {POLICY.returns} · {POLICY.dispatch}
        </Text>

        <View style={styles.gap8}>
          {product.description ? <Text variant="bodyPdp">{product.description}</Text> : null}
          {bullets.map(([k, v]) => (
            <Text key={k} variant="bodyPdp">
              {"•  "}
              <Text variant="bodyPdp" style={styles.bold}>
                {k}:
              </Text>{" "}
              {v}
            </Text>
          ))}
        </View>

        <View onLayout={(e) => setFitY(buyY + e.nativeEvent.layout.y)}>
          <Accordion title="Fit" initiallyOpen={openScorecard}>
            <View style={styles.gap12}>
              {crown ? <CrownCompare colour={colour} cm={crown} /> : null}
              <Text variant="bodyPdp">One size, {POLICY.oneSize}.</Text>
              {meta.fitNotes ? <Text variant="bodyPdp">{meta.fitNotes}</Text> : null}
              <Button
                title="Fit guide"
                variant="link"
                onPress={() => {
                  trackTap("fit_guide")
                  openWeb("/fit-guide")
                }}
              />
            </View>
          </Accordion>
          <Accordion title="Details">
            <View>
              {specRows.map(([k, v]) => (
                <View key={k} style={styles.specRow}>
                  <Text variant="meta" tone="muted" style={styles.specKey}>
                    {k}
                  </Text>
                  <Text variant="meta" style={styles.flex}>
                    {v}
                  </Text>
                </View>
              ))}
            </View>
          </Accordion>
          <Accordion title="Shipping">
            <Text variant="bodyPdp">
              {POLICY.shipping}. {POLICY.dispatch}.
            </Text>
          </Accordion>
          <Accordion title="Returns">
            <Text variant="bodyPdp">{POLICY.returns} on unworn caps with the tags on, numbered holes included. Start a return from your order email.</Text>
          </Accordion>
        </View>

        <Button
          title="Which color? Take the quiz"
          variant="link"
          onPress={() => {
            trackTap("pdp_quiz")
            openWeb("/quiz")
          }}
        />
      </View>

      <AlsoLike product={product} colour={colour} />
      <StoryTeaser />
      <RecentlyViewed handles={viewedHandles} current={product.handle ?? ""} />
      <View style={{ height: layout.stickyBar + insets.bottom }} />
    </Screen>
  )
}

/** 5:6 paging gallery on #F6F6F6 with 6pt dots under it; a new colour starts at photo one. */
function Gallery({ images, colour, title, badge, badgeDark }: { images: string[]; colour: string | null; title: string; badge: string | null; badgeDark: boolean }) {
  const { width } = useWindowDimensions()
  const w = Math.min(width, MAX_CONTENT_WIDTH)
  const [index, setIndex] = useState(0)
  const [seen, setSeen] = useState(colour)
  const list = useRef<FlatList<string>>(null)
  if (seen !== colour) {
    setSeen(colour)
    setIndex(0)
  }
  useEffect(() => {
    list.current?.scrollToOffset({ offset: 0, animated: false })
  }, [colour])
  return (
    <View>
      <FlatList
        ref={list}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(src, i) => `${src}-${i}`}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / Math.max(1, w)))}
        getItemLayout={(_, i) => ({ length: w, offset: w * i, index: i })}
        renderItem={({ item, index: i }) => (
          <View style={{ width: w }}>
            <Tile
              source={item}
              alt={`${title}${colour ? ` in ${colour}` : ""}, photo ${i + 1} of ${images.length}`}
              aspectRatio={5 / 6}
              badge={i === 0 ? badge : null}
              badgeDark={badgeDark}
            />
          </View>
        )}
      />
      {images.length > 1 ? (
        <View style={styles.dots} accessibilityLabel={`Photo ${index + 1} of ${images.length}`}>
          {images.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === index ? colors.text : "#BDBDBD" }]} />
          ))}
        </View>
      ) : null}
    </View>
  )
}

/** M18/M19: "Change Color ˄" (the chevron turns, the swatch row opens inline), then the sticky Add To Bag. */
function StickyBar({
  visible,
  style,
  bottomInset,
  colours,
  colour,
  soldOut,
  onSelect,
  disabled,
  label,
  loading,
  onAdd,
}: {
  visible: boolean
  style: object
  bottomInset: number
  colours: readonly string[]
  colour: string | null
  soldOut: string[]
  onSelect: (c: string) => void
  disabled: boolean
  label: string
  loading: boolean
  onAdd: () => void
}) {
  const [open, setOpen] = useState(false)
  const turn = useSharedValue(0)
  const chevron = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 180}deg` }] }))
  const toggle = () => {
    const next = !open
    setOpen(next)
    turn.set(withTiming(next ? 1 : 0, { duration: dur.rotate, easing: ease.out, reduceMotion: motion.reduceMotion }))
  }
  return (
    <Animated.View pointerEvents={visible ? "auto" : "none"} style={[styles.sticky, { paddingBottom: 8 + bottomInset }, style]}>
      {colours.length > 1 ? (
        <>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={toggle} hitSlop={{ top: 2, bottom: 2 }} style={styles.changeRow}>
            <Text variant="navLabel">Change Color</Text>
            <Text variant="meta" tone="muted" style={styles.flex} numberOfLines={1}>
              {colour}
            </Text>
            <Animated.View style={chevron}>
              <Ionicons name="chevron-up" size={16} color={colors.text} />
            </Animated.View>
          </Pressable>
          {open ? (
            <View style={styles.stickySwatches}>
              {colours.map((c) => (
                <Swatch key={c} name={c} selected={c === colour} soldOut={soldOut.includes(c)} onPress={() => onSelect(c)} />
              ))}
            </View>
          ) : null}
        </>
      ) : null}
      <Button title={label} variant="sticky" disabled={disabled} loading={loading} onPress={onAdd} />
    </Animated.View>
  )
}

function AlsoLike({ product, colour }: { product: Product; colour: string | null }) {
  const { holes } = useHoles()
  const core = product.handle === "rope-cap" ? product : null
  const catalog = useCatalog()
  const coreProduct = core ?? catalog.data?.find((p) => p.handle === "rope-cap") ?? null
  const items: { key: string; node: React.ReactNode }[] = []
  if (coreProduct) {
    for (const c of CORE_COLOURWAYS) {
      if (core && c === colour) continue
      items.push({ key: c, node: <ColourwayCard product={coreProduct} colourway={c} /> })
    }
  }
  for (const h of holes) {
    if (h.number < 2 || h.status !== "live" || h.product?.id === product.id) continue
    items.push({ key: `h${h.number}`, node: <EditionCard hole={h} /> })
  }
  if (!items.length) return null
  return (
    <View style={styles.rail}>
      <Text variant="headingRecs" accessibilityRole="header" style={styles.railTitle}>
        You may also like
      </Text>
      <FlatList
        data={items}
        horizontal
        keyExtractor={(i) => i.key}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD + layout.gap}
        decelerationRate="fast"
        contentContainerStyle={styles.railList}
        renderItem={({ item }) => (
          <View style={{ width: CARD }} onTouchStart={() => trackTap("pdp_also_like")}>
            {item.node}
          </View>
        )}
      />
    </View>
  )
}

/** The crown test as a teaser band (`series_story`). */
function StoryTeaser() {
  const series = useContentSeries()
  const story = series.data?.find((x) => x.handle === "crown-test") ?? series.data?.[0] ?? null
  if (!story) return null
  const open = () => {
    trackTap("series_story")
    openWeb(`/stories/${story.handle}`)
  }
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={story.title} onPress={open} style={styles.story}>
      {({ pressed }) => (
        <>
          <Image source={hatImage("story-crush.jpg")} style={styles.storyImage} contentFit="cover" accessibilityLabel="A cap folded into a back pocket" accessible />
          <View style={styles.storyText}>
            <Text variant="eyebrowSm">The story</Text>
            <Text variant="titleCard" numberOfLines={3} style={pressed && { color: colors.linkPressed }}>
              {story.title}
            </Text>
            <Text variant="meta" style={styles.underline}>
              Read the test
            </Text>
          </View>
        </>
      )}
    </Pressable>
  )
}

function RecentlyViewed({ handles, current }: { handles: string[]; current: string }) {
  const catalog = useCatalog()
  const products = handles
    .filter((h) => h !== current)
    .map((h) => catalog.data?.find((p) => p.handle === h))
    .filter((p): p is Product => !!p)
    .slice(0, 8)
  if (!products.length) return null
  return (
    <View style={styles.rail}>
      <Text variant="headingRecs" accessibilityRole="header" style={styles.railTitle}>
        Recently viewed
      </Text>
      <FlatList
        data={products}
        horizontal
        keyExtractor={(p) => p.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railList}
        ItemSeparatorComponent={() => <View style={{ width: layout.gap }} />}
        renderItem={({ item: p }) => {
          const price = productPrice(p)
          return (
            <MiniCard
              style={{ width: 120 }}
              image={cardImages(p)[0] ?? null}
              title={p.title ?? ""}
              price={price ? formatMoney(price.amount, price.currency) : null}
              onPress={() => router.push(`/products/${p.handle}`)}
            />
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bold: { fontFamily: fonts.bodyBold },
  underline: { textDecorationLine: "underline" },
  gap4: { gap: 4 },
  gap8: { gap: 8 },
  gap12: { gap: 12 },
  titleBlock: { paddingHorizontal: layout.edge, paddingTop: 12, paddingBottom: 16, gap: 6 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, paddingVertical: 12 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  buy: { paddingHorizontal: layout.edge, paddingTop: 8, gap: 20 },
  swatches: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  specRow: { flexDirection: "row", gap: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  specKey: { width: 92 },
  rail: { paddingTop: 40 },
  railTitle: { paddingHorizontal: layout.railEdge, marginBottom: 16 },
  railList: { paddingHorizontal: layout.railEdge, gap: layout.gap },
  story: { marginTop: 40, marginHorizontal: layout.railEdge, flexDirection: "row", backgroundColor: colors.tile },
  storyImage: { width: 120, height: 120 },
  storyText: { flex: 1, padding: 14, gap: 4, justifyContent: "center" },
  sticky: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surfaceSticky,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 14,
    paddingTop: 8,
    gap: 4,
  },
  changeRow: { height: 40, flexDirection: "row", alignItems: "center", gap: 10 },
  stickySwatches: { flexDirection: "row", gap: 4, paddingBottom: 6 },
})
