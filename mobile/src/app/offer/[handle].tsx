import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
import Animated, { runOnUI, scrollTo, useAnimatedRef } from "react-native-reanimated"

import { Accordion } from "@/components/accordion"
import { Box, confirmHaptic, Digits, Face, InkStripes, InkText, Plate, Tag, Window, type Ink } from "@/components/box"
import { Button } from "@/components/button"
import { Screen } from "@/components/screen"
import { SegmentedControl } from "@/components/segmented-control"
import { ErrorState, LoadingState } from "@/components/state-views"
import { StockLine } from "@/components/stock-line"
import { Text } from "@/components/text"
import { VALUE_TILES } from "@/components/value-tile"
import { colors, CORE_COLOURWAYS } from "@/constants/theme"
import { useCatalog, useProduct } from "@/hooks/use-products"
import { useQuickAdd } from "@/hooks/use-quick-add"
import { trackTap, useTrackOnce } from "@/lib/analytics"
import { useVariant } from "@/lib/experiments"
import { formatMoney } from "@/lib/format"
import { openWeb } from "@/lib/links"
import { POLICY } from "@/lib/policy"
import {
  capsIn,
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
} from "@/lib/product"

/**
 * The offer screen (APP_SPEC v7 §5.5): one box whose first faces are the
 * sleeves, The Pair in pine with two windows and two pickers, The Foursome in
 * navy with four; then what's included, why two and the questions.
 * /offer/the-foursome opens the same box turned to the Foursome sleeve.
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

function OfferContent({
  pair,
  four,
  single,
  openFour,
}: {
  pair: Product | null
  four: Product | null
  single: Product | null
  openFour: boolean
}) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const [fourY, setFourY] = useState(0)
  const scrolled = useRef(false)

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

  return (
    <Screen back scrollRef={scrollRef}>
      <View style={styles.wrap}>
        <Box>
          {pair ? <PairFace pair={pair} single={single} /> : null}
          {four ? (
            <View onLayout={(e) => setFourY(e.nativeEvent.layout.y + 12)}>
              <FoursomeFace four={four} single={single} />
            </View>
          ) : null}
          <Face>
            <InkText variant="panelTitle" accessibilityRole="header">
              What&apos;s included
            </InkText>
            <Plate columns={1}>
              {[
                ["Two caps", "Pick any two core colors, or the same color twice."],
                ["One size each", `The strap ${POLICY.oneSize}. The crown sits mid.`],
                [VALUE_TILES[2].eyebrow, VALUE_TILES[2].body],
              ].map(([k, v]) => (
                <View key={k} style={styles.unit}>
                  <InkText variant="label">{k}</InkText>
                  <InkText variant="body">{v}</InkText>
                </View>
              ))}
            </Plate>
          </Face>
          <Face>
            <InkText variant="panelTitle" accessibilityRole="header">
              Why two
            </InkText>
            {["A light one and a dark one.", "One for the bag, one for the car.", "You already know the fit."].map((t) => (
              <InkText key={t} variant="body">
                {t}
              </InkText>
            ))}
          </Face>
          <Face>
            <InkText variant="panelTitle" accessibilityRole="header">
              Questions
            </InkText>
            <View>
              <Accordion title="Will it fit?">
                <Text variant="bodyLong" tone="charcoal">
                  One size. The strap {POLICY.oneSize}, and the crown sits mid, about 11–11.5 cm.
                </Text>
              </Accordion>
              <Accordion title="Can I pick the same color twice?">
                <Text variant="bodyLong" tone="charcoal">
                  Yes. Pick the same color in both pickers.
                </Text>
              </Accordion>
              <Accordion title="Returns">
                <Text variant="bodyLong" tone="charcoal">
                  {POLICY.returns} on the pair.
                </Text>
              </Accordion>
              <Accordion title="Shipping">
                <Text variant="bodyLong" tone="charcoal">
                  {POLICY.shipping}. {POLICY.dispatch}.
                </Text>
              </Accordion>
              <Accordion title="Is this a sale?">
                <Text variant="bodyLong" tone="charcoal">
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
            </View>
            <Button
              title="See the Crown Test"
              variant="link"
              onPress={() => {
                trackTap("offer_story")
                openWeb("/stories/crown-test")
              }}
            />
          </Face>
        </Box>
      </View>
    </Screen>
  )
}

function useOptionIds(product: Product) {
  const opts = productOptions(product).filter((o) => !o.isSize)
  const first = opts.find((o) => /first/i.test(o.title)) ?? opts[0]
  const second = opts.find((o) => /second/i.test(o.title)) ?? opts[1]
  return { first, second, opts }
}

const PAIR_INK: Ink = { panel: colors.pine, ink: colors.pineInk, edge: colors.ink }
const FOUR_INK: Ink = { panel: colors.ink, ink: colors.paper, edge: colors.ink }

/** The Pair as an inked sleeve: two die-cut windows in a row, two pickers, the price and Add at its foot. */
function PairFace({ pair, single }: { pair: Product; single: Product | null }) {
  const quick = useQuickAdd()
  const { first, second } = useOptionIds(pair)
  const [a, setA] = useState<string>(first?.values[0] ?? CORE_COLOURWAYS[0])
  const [b, setB] = useState<string>(second?.values[1] ?? second?.values[0] ?? CORE_COLOURWAYS[2])
  const headline = useVariant("offer-headline")
  useTrackOnce("product_viewed", pair.id, () => ({ product_id: pair.id, handle: pair.handle }))
  const variant = useMemo(
    () =>
      (pair.variants ?? []).find((v) => {
        const m = variantOptionMap(v)
        return (!first || m[first.id] === a) && (!second || m[second.id] === b)
      }),
    [a, b, first, pair.variants, second]
  )
  const stock = variant ? variantStock(variant) : null
  const saving = offerSaving(pair, single)
  const price = saving?.price ?? pair.variants?.[0]?.calculated_price?.calculated_amount ?? null
  const title =
    headline === "saving" && saving
      ? `Save ${formatMoney(saving.saving)} on two rope caps.`
      : `Two rope caps. ${price != null ? formatMoney(price) : ""}`
  const lead = (c: string) => (single ? imagesFor(single, c)[0] : null) ?? null

  return (
    <Face ink={PAIR_INK}>
      <View style={styles.windows}>
        <Window source={lead(a)} alt={`The Rope Cap in ${a}`} aspectRatio={1} style={styles.flex} />
        <Window source={lead(b)} alt={`The Rope Cap in ${b}`} aspectRatio={1} style={styles.flex} />
      </View>
      <View style={styles.gap6}>
        <InkText variant="panelTitle" accessibilityRole="header">
          {title}
        </InkText>
        <InkText variant="specLine">
          The Pair · Core colors
          {saving ? ` · ${formatMoney(saving.perCap)} a cap` : ""}
        </InkText>
      </View>
      <Picker label="First cap" value={a} onChange={setA} values={first?.values ?? [...CORE_COLOURWAYS]} single={single} />
      <Picker label="Second cap" value={b} onChange={setB} values={second?.values ?? [...CORE_COLOURWAYS]} single={single} />
      <SleeveFoot price={price} saving={saving} />
      <Button
        title="Add the pair"
        variant="ink"
        size="atc"
        disabled={!variant || stock?.state === "sold_out"}
        loading={quick.pending !== null}
        onPress={() => {
          if (!variant) return
          trackTap("offer_add")
          confirmHaptic()
          void quick.addVariant(pair, variant, "app_offer", { detail: `${shortColour(a)} + ${shortColour(b)}`, image: lead(a) })
        }}
      />
      {stock ? <StockLine state={stock.state} quantity={stock.quantity} /> : null}
      <InkText variant="meta">
        {price != null && price >= POLICY.freeShippingThreshold ? `${formatMoney(price)} qualifies for free shipping` : POLICY.shipping} ·{" "}
        {POLICY.returns}
      </InkText>
    </Face>
  )
}

function SleeveFoot({ price, saving }: { price: number | null; saving: ReturnType<typeof offerSaving> }) {
  return (
    <View style={styles.priceRow}>
      {price != null ? <Digits value={formatMoney(price)} /> : null}
      {saving ? (
        <>
          <InkText variant="priceSm" style={styles.struck} accessibilityLabel={`Was ${formatMoney(saving.anchor)} as singles`}>
            {formatMoney(saving.anchor)}
          </InkText>
          <Tag label={`Save ${formatMoney(saving.saving)}`} />
        </>
      ) : null}
    </View>
  )
}

function Picker({
  label,
  value,
  values,
  onChange,
  single,
}: {
  label: string
  value: string
  values: string[]
  onChange: (v: string) => void
  single: Product | null
}) {
  const rope = ropeNameFor(single, value)
  return (
    <View style={styles.picker}>
      <InkText variant="meta">
        <InkText variant="label">{label} </InkText>
        {value}
        {rope ? `, ${rope.toLowerCase()} rope` : ""}
      </InkText>
      <InkStripes colourways={values} selected={value} onSelect={onChange} />
    </View>
  )
}

/** The Foursome as a navy sleeve: four windows in a row, four of one color or one of each, the price and Add at its foot. */
function FoursomeFace({ four, single }: { four: Product; single: Product | null }) {
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
    <Face ink={FOUR_INK}>
      <View style={styles.windows}>
        {shown.map((c, i) => (
          <Window key={`${c}-${i}`} source={lead(c)} alt={`The Rope Cap in ${c}`} aspectRatio={1} style={styles.flex} />
        ))}
      </View>
      <View style={styles.gap6}>
        <InkText variant="panelTitle" accessibilityRole="header">
          Four caps, {saving ? formatMoney(saving.perCap) : "$38"} each.
        </InkText>
        <InkText variant="specLine">The Foursome · Group trip, outing, Father&apos;s Day</InkText>
      </View>
      <SegmentedControl
        options={[
          { value: "one", label: "Four of one color" },
          { value: "each", label: "One of each" },
        ]}
        value={mode}
        onChange={(m: "one" | "each") => setMode(m)}
      />
      {mode === "one" ? <Picker label="Color" value={colour} onChange={setColour} values={[...CORE_COLOURWAYS]} single={single} /> : null}
      <SleeveFoot price={price} saving={saving} />
      <Button
        title="Add the Foursome"
        variant="ink"
        size="atc"
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
      <Button title="Back to the Rope Cap" variant="link" onPress={() => router.push("/products/rope-cap")} />
    </Face>
  )
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 12 },
  flex: { flex: 1 },
  gap6: { gap: 6 },
  windows: { flexDirection: "row", gap: 8 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" },
  struck: { textDecorationLine: "line-through", opacity: 0.8 },
  picker: { gap: 10 },
  unit: { paddingHorizontal: 14, paddingVertical: 12, gap: 2 },
})
