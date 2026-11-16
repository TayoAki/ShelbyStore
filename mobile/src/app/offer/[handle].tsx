import { Image } from "expo-image"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
import Animated, { runOnUI, scrollTo, useAnimatedRef } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg"

import { Accordion } from "@/components/accordion"
import { Button } from "@/components/button"
import { Screen } from "@/components/screen"
import { SegmentedControl } from "@/components/segmented-control"
import { ErrorState, LoadingState } from "@/components/state-views"
import { StockLine } from "@/components/stock-line"
import { Swatch } from "@/components/swatch"
import { Text } from "@/components/text"
import { Tile } from "@/components/tile"
import { VALUE_TILES } from "@/components/value-tile"
import { colors, CORE_COLOURWAYS, colourwaySlug, fonts, layout } from "@/constants/theme"
import { useCatalog, useProduct } from "@/hooks/use-products"
import { useQuickAdd } from "@/hooks/use-quick-add"
import { trackTap, useTrackOnce } from "@/lib/analytics"
import { useVariant } from "@/lib/experiments"
import { formatMoney } from "@/lib/format"
import { confirmHaptic } from "@/lib/haptics"
import { openWeb } from "@/lib/links"
import { useStickyBar } from "@/lib/motion"
import { POLICY } from "@/lib/policy"
import {
  capsIn,
  hatImage,
  imagesFor,
  offerSaving,
  offersFor,
  productOptions,
  productPrice,
  ropeNameFor,
  shortColour,
  variantOptionMap,
  variantStock,
  type Product,
  type Variant,
} from "@/lib/product"

/**
 * The offer screen (APP_SPEC v8 V8.5 §4, web E.6.10): the picked colours as
 * 5:6 #F6F6F6 tiles, the buy block (the offer-headline experiment, the price
 * and per-cap price, "Cap 1" / "Cap 2" pickers, Add), the Foursome on a
 * #F6F6F6 band, the questions, the story link and a close splash. A sticky
 * bar repeats the Pair's Add once it has scrolled away.
 * /offer/the-foursome scrolls to the Foursome band.
 */
export default function OfferScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>()
  const catalog = useCatalog()
  const requested = useProduct(handle)
  const all = catalog.data ?? []
  const single = all.find((p) => p.handle === "rope-cap") ?? null
  const offers = offersFor(all, "rope-cap")
  const pair = offers.find((o) => capsIn(o) === 2) ?? (requested.data && capsIn(requested.data) === 2 ? requested.data : null)
  const four = offers.find((o) => capsIn(o) === 4) ?? (requested.data && capsIn(requested.data) === 4 ? requested.data : null)
  if (catalog.isLoading || requested.isLoading) {
    return (
      <Screen back>
        <LoadingState />
      </Screen>
    )
  }
  if (!pair && !four) {
    return (
      <Screen back>
        <ErrorState
          error={requested.error ?? catalog.error ?? new Error("This bundle isn't available right now.")}
          onRetry={() => catalog.refetch()}
        />
      </Screen>
    )
  }

  return <OfferContent pair={pair} four={four} single={single} openFour={!!handle && handle === four?.handle} />
}

function useOptionIds(product: Product) {
  const opts = productOptions(product).filter((o) => !o.isSize)
  const first = opts.find((o) => /first/i.test(o.title)) ?? opts[0]
  const second = opts.find((o) => /second/i.test(o.title)) ?? opts[1]
  return { first, second, opts }
}

function OfferContent({ pair, four, single, openFour }: { pair: Product | null; four: Product | null; single: Product | null; openFour: boolean }) {
  const insets = useSafeAreaInsets()
  const quick = useQuickAdd()
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const [fourY, setFourY] = useState(0)
  const scrolled = useRef(false)
  const [buyY, setBuyY] = useState(0)
  const [cta, setCta] = useState<{ y: number; h: number } | null>(null)
  const sticky = useStickyBar(cta ? buyY + cta.y + cta.h : null)

  // The Pair's state lives here so the sticky bar adds the same two caps.
  const opts = useOptionIds(pair ?? ({} as Product))
  const [a, setA] = useState<string>(opts.first?.values[0] ?? CORE_COLOURWAYS[0])
  const [b, setB] = useState<string>(opts.second?.values[1] ?? opts.second?.values[0] ?? CORE_COLOURWAYS[2])
  const variant = useMemo(
    () =>
      (pair?.variants ?? []).find((v) => {
        const m = variantOptionMap(v)
        return (!opts.first || m[opts.first.id] === a) && (!opts.second || m[opts.second.id] === b)
      }),
    [a, b, opts.first, opts.second, pair?.variants]
  )
  const lead = (c: string) => (single ? imagesFor(single, c)[0] : null) ?? hatImage(`rope-cap-${colourwaySlug(c)}-1.jpg`)
  const addPair = (v: Variant | undefined) => {
    if (!pair || !v) return
    trackTap("offer_add")
    confirmHaptic()
    void quick.addVariant(pair, v, "app_offer", { detail: `${shortColour(a)} + ${shortColour(b)}`, image: lead(a) })
  }
  const stock = variant ? variantStock(variant) : null

  useEffect(() => {
    if (!openFour || !fourY || scrolled.current) return
    const y = fourY
    const t = setTimeout(() => {
      scrolled.current = true
      runOnUI(() => {
        "worklet"
        scrollTo(scrollRef, 0, y, true)
      })()
    }, 400)
    return () => clearTimeout(t)
  }, [fourY, openFour, scrollRef])

  const toTop = () =>
    runOnUI(() => {
      "worklet"
      scrollTo(scrollRef, 0, 0, true)
    })()

  return (
    <Screen
      back
      scrollRef={scrollRef}
      onScrollY={sticky.onScrollY}
      overlay={
        pair ? (
          <Animated.View pointerEvents={sticky.visible ? "auto" : "none"} style={[styles.sticky, { paddingBottom: 8 + insets.bottom }, sticky.style]}>
            <Text variant="meta" numberOfLines={1}>
              The Pair · {a} + {b}
            </Text>
            <Button
              title={stock?.state === "sold_out" ? "Sold out" : "Add The Pair"}
              variant="sticky"
              disabled={!variant || stock?.state === "sold_out"}
              loading={quick.pending !== null}
              onPress={() => addPair(variant)}
            />
          </Animated.View>
        ) : null
      }>
      {pair ? (
        <>
          <View style={styles.tiles}>
            {[a, b].map((c, i) => (
              <View key={`${c}-${i}`} style={styles.half}>
                <Tile source={lead(c)} alt={`The Rope Cap in ${c}`} badge={`Cap ${i + 1}`} />
              </View>
            ))}
          </View>
          <View onLayout={(e) => setBuyY(e.nativeEvent.layout.y)} style={styles.buy}>
            <PairBuy
              pair={pair}
              single={single}
              a={a}
              b={b}
              setA={setA}
              setB={setB}
              firstValues={opts.first?.values ?? [...CORE_COLOURWAYS]}
              secondValues={opts.second?.values ?? [...CORE_COLOURWAYS]}
              variant={variant}
              onAdd={() => addPair(variant)}
              pending={quick.pending !== null}
              onCtaLayout={(y, h) => setCta((c) => (c && c.y === y && c.h === h ? c : { y, h }))}
            />
          </View>
        </>
      ) : null}

      {four ? (
        <View onLayout={(e) => setFourY(e.nativeEvent.layout.y)}>
          <FoursomeBand four={four} single={single} />
        </View>
      ) : null}

      <View style={styles.section}>
        <Text variant="headingRecs" accessibilityRole="header" style={styles.heading}>
          What&apos;s included
        </Text>
        {[
          ["Two caps", "Pick any two core colors, or the same color twice."],
          ["One size each", `The strap ${POLICY.oneSize}. The crown sits mid.`],
          [VALUE_TILES[2].eyebrow, VALUE_TILES[2].body],
          ["Why two", "A light one and a dark one. One for the bag, one for the car. You already know the fit."],
        ].map(([k, v]) => (
          <View key={k} style={styles.fact}>
            <Text variant="eyebrowSm">{k}</Text>
            <Text variant="bodyPdp">{v}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text variant="headingRecs" accessibilityRole="header" style={styles.heading}>
          Questions
        </Text>
        <Accordion title="Will it fit?">
          <Text variant="bodyPdp">One size. The strap {POLICY.oneSize}, and the crown sits mid, about 11–11.5 cm.</Text>
        </Accordion>
        <Accordion title="Can I pick the same color twice?">
          <Text variant="bodyPdp">Yes. Pick the same color in both pickers.</Text>
        </Accordion>
        <Accordion title="Returns">
          <Text variant="bodyPdp">{POLICY.returns} on the pair.</Text>
        </Accordion>
        <Accordion title="Shipping">
          <Text variant="bodyPdp">
            {POLICY.shipping}. {POLICY.dispatch}.
          </Text>
        </Accordion>
        <Accordion title="Is this a sale?">
          <Text variant="bodyPdp">
            No.{" "}
            {[
              single && productPrice(single) ? `Singles stay ${formatMoney(productPrice(single)!.amount)}` : null,
              pair && productPrice(pair) ? `two are ${formatMoney(productPrice(pair)!.amount)}` : null,
              four && productPrice(four) ? `four are ${formatMoney(productPrice(four)!.amount)}` : null,
            ]
              .filter(Boolean)
              .join("; ")}
            , every day.
          </Text>
        </Accordion>
        <Button
          title="See the Crown Test"
          variant="link"
          style={styles.storyLink}
          onPress={() => {
            trackTap("offer_story")
            openWeb("/stories/crown-test")
          }}
        />
      </View>

      <View style={styles.splash}>
        <Image source={hatImage("rope-brim.jpg")} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="The rope on the brim, close up" accessible />
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <LinearGradient id="offerShade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000" stopOpacity={0.05} />
              <Stop offset="0.45" stopColor="#000" stopOpacity={0.15} />
              <Stop offset="1" stopColor="#000" stopOpacity={0.65} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#offerShade)" />
        </Svg>
        <View style={styles.splashCopy}>
          <Text variant="displaySplash" tone="inverse" style={styles.centre} accessibilityRole="header">
            Two is the number
          </Text>
          <Text variant="bodySplash" tone="inverse" style={styles.centre}>
            Any two colors, shipped free.
          </Text>
          {pair ? <Button title="Pick Your Two" variant="white" size="small" onPress={toTop} /> : null}
        </View>
      </View>
      <Button title="Back to the Rope Cap" variant="link" style={styles.back} onPress={() => router.push("/products/rope-cap")} />
      <View style={{ height: layout.stickyBar + insets.bottom }} />
    </Screen>
  )
}

/** The Pair's buy block: the headline experiment, price, "Cap 1" / "Cap 2" pickers and Add. */
function PairBuy({
  pair,
  single,
  a,
  b,
  setA,
  setB,
  firstValues,
  secondValues,
  variant,
  onAdd,
  pending,
  onCtaLayout,
}: {
  pair: Product
  single: Product | null
  a: string
  b: string
  setA: (c: string) => void
  setB: (c: string) => void
  firstValues: string[]
  secondValues: string[]
  variant: Variant | undefined
  onAdd: () => void
  pending: boolean
  onCtaLayout: (y: number, h: number) => void
}) {
  const headline = useVariant("offer-headline")
  useTrackOnce("product_viewed", pair.id, () => ({ product_id: pair.id, handle: pair.handle }))
  const stock = variant ? variantStock(variant) : null
  const saving = offerSaving(pair, single)
  const price = saving?.price ?? pair.variants?.[0]?.calculated_price?.calculated_amount ?? null
  const title =
    headline === "saving" && saving
      ? `Save ${formatMoney(saving.saving)} on two rope caps.`
      : `Two rope caps. ${price != null ? formatMoney(price) : ""}`
  return (
    <>
      <View style={styles.titleBlock}>
        <Text variant="breadcrumb">Home / Kits</Text>
        <Text variant="titleProduct" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="meta">
          {price != null && price >= POLICY.freeShippingThreshold ? "Ships free" : `Free shipping on $${POLICY.freeShippingThreshold}+`} ·{" "}
          {POLICY.returns}
        </Text>
        <View style={styles.priceRow}>
          {price != null ? <Text variant="priceProduct">{formatMoney(price)}</Text> : null}
          {saving ? (
            <Text variant="meta" tone="muted">
              {formatMoney(saving.perCap)} a cap ·{" "}
              <Text variant="meta" tone="muted" style={styles.struck} accessibilityLabel={`Was ${formatMoney(saving.anchor)} as singles`}>
                {formatMoney(saving.anchor)}
              </Text>
            </Text>
          ) : null}
        </View>
      </View>
      <Picker label="Cap 1" value={a} onChange={setA} values={firstValues} single={single} />
      <Picker label="Cap 2" value={b} onChange={setB} values={secondValues} single={single} />
      <View onLayout={(e) => onCtaLayout(e.nativeEvent.layout.y, e.nativeEvent.layout.height)} style={styles.gap8}>
        <Button
          title={stock?.state === "sold_out" ? "Sold out" : "Add The Pair"}
          variant="primary"
          disabled={!variant || stock?.state === "sold_out"}
          loading={pending}
          onPress={onAdd}
        />
        {stock ? <StockLine state={stock.state} quantity={stock.quantity} /> : null}
      </View>
    </>
  )
}

function Picker({ label, value, values, onChange, single }: { label: string; value: string; values: string[]; onChange: (v: string) => void; single: Product | null }) {
  const rope = ropeNameFor(single, value)
  return (
    <View style={styles.picker}>
      <Text variant="bodyPdp">
        <Text variant="bodyPdp" style={styles.bold}>
          {label}:{" "}
        </Text>
        {value}
        {rope ? `, ${rope.toLowerCase()} rope` : ""}
      </Text>
      <View style={styles.swatches}>
        {values.map((c) => (
          <Swatch key={c} name={c} selected={c === value} onPress={() => onChange(c)} />
        ))}
      </View>
    </View>
  )
}

/** The Foursome on a #F6F6F6 band: four tiles, four of one colour or one of each, the price and Add. */
function FoursomeBand({ four, single }: { four: Product; single: Product | null }) {
  const quick = useQuickAdd()
  const { opts } = useOptionIds(four)
  const opt = opts[0]
  const [mode, setMode] = useState<"one" | "each">("one")
  const [colour, setColour] = useState<string>(CORE_COLOURWAYS[2])
  const saving = offerSaving(four, single)
  const price = saving?.price ?? four.variants?.[0]?.calculated_price?.calculated_amount ?? null
  const variant = (four.variants ?? []).find((v) => {
    const val = opt ? (variantOptionMap(v)[opt.id] ?? v.title ?? "") : (v.title ?? "")
    return mode === "each" ? /each/i.test(val) : val.includes(colour) && !/each/i.test(val)
  })
  const stock = variant ? variantStock(variant) : null
  const shown = mode === "each" ? [...CORE_COLOURWAYS] : [colour, colour, colour, colour]
  const lead = (c: string) => (single ? imagesFor(single, c)[0] : null) ?? null
  return (
    <View style={styles.band}>
      <View style={styles.grid4}>
        {shown.map((c, i) => (
          <View key={`${c}-${i}`} style={styles.half}>
            <Tile source={lead(c)} alt={`The Rope Cap in ${c}`} aspectRatio={1} style={styles.white} />
          </View>
        ))}
      </View>
      <View style={styles.bandText}>
        <Text variant="eyebrowSm">The Foursome</Text>
        <Text variant="titleProduct" accessibilityRole="header">
          Four caps, {saving ? formatMoney(saving.perCap) : "$38"} each.
        </Text>
        <Text variant="meta" tone="muted">
          Group trip, outing, Father&apos;s Day
        </Text>
        {price != null ? <Text variant="priceProduct">{formatMoney(price)}</Text> : null}
      </View>
      <SegmentedControl
        options={[
          { value: "one", label: "Four of one color" },
          { value: "each", label: "One of each" },
        ]}
        value={mode}
        onChange={(m: "one" | "each") => setMode(m)}
      />
      <View style={styles.bandText}>
        {mode === "one" ? <Picker label="Color" value={colour} onChange={setColour} values={[...CORE_COLOURWAYS]} single={single} /> : null}
        <Button
          title={stock?.state === "sold_out" ? "Sold out" : "Add The Foursome"}
          variant="secondary"
          disabled={!variant || stock?.state === "sold_out"}
          loading={quick.pending !== null}
          onPress={() => {
            if (!variant) return
            trackTap("offer_foursome_add")
            confirmHaptic()
            void quick.addVariant(four, variant, "app_offer", {
              detail: mode === "each" ? "One of each" : `4 × ${shortColour(colour)}`,
              image: single ? imagesFor(single, mode === "each" ? CORE_COLOURWAYS[0] : colour)[0] : null,
            })
          }}
        />
        {stock ? <StockLine state={stock.state} quantity={stock.quantity} /> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bold: { fontFamily: fonts.bodyBold },
  gap8: { gap: 8 },
  tiles: { flexDirection: "row", gap: layout.gap },
  half: { flex: 1, minWidth: "45%" },
  buy: { paddingHorizontal: layout.edge, paddingTop: 16, paddingBottom: 32, gap: 20 },
  titleBlock: { gap: 6 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 10, flexWrap: "wrap" },
  struck: { textDecorationLine: "line-through" },
  picker: { gap: 8 },
  swatches: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  band: { backgroundColor: colors.tile, paddingVertical: 32, gap: 20 },
  grid4: { flexDirection: "row", flexWrap: "wrap", gap: layout.gap, paddingHorizontal: layout.railEdge },
  white: { backgroundColor: colors.white },
  bandText: { paddingHorizontal: layout.edge, gap: 10 },
  section: { paddingHorizontal: layout.edge, paddingTop: 40 },
  heading: { marginBottom: 12 },
  fact: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 2 },
  storyLink: { marginTop: 8 },
  splash: { height: 403, marginTop: 48, justifyContent: "flex-end", overflow: "hidden" },
  splashCopy: { alignItems: "center", paddingHorizontal: 32, paddingBottom: 36, gap: 12 },
  centre: { textAlign: "center" },
  back: { marginHorizontal: layout.edge, marginTop: 16 },
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
    gap: 6,
  },
})
