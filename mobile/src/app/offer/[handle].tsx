import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
import Animated, { runOnUI, scrollTo, useAnimatedRef } from "react-native-reanimated"

import { Accordion } from "@/components/accordion"
import { Button } from "@/components/button"
import { PairGallery } from "@/components/gallery"
import { RopeRule } from "@/components/rope-rule"
import { Screen } from "@/components/screen"
import { SegmentedControl } from "@/components/segmented-control"
import { ErrorState, LoadingState } from "@/components/state-views"
import { StockLine } from "@/components/stock-line"
import { Swatch } from "@/components/swatch"
import { Text } from "@/components/text"
import { VALUE_TILES, ValueTile } from "@/components/value-tile"
import { colors, CORE_COLOURWAYS, golf, radius } from "@/constants/theme"
import { useCatalog, useProduct } from "@/hooks/use-products"
import { useQuickAdd } from "@/hooks/use-quick-add"
import { trackTap, useTrackOnce } from "@/lib/analytics"
import { useVariant } from "@/lib/experiments"
import { formatMoney } from "@/lib/format"
import { openWeb } from "@/lib/links"
import { Reveal } from "@/lib/motion"
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
 * The offer screen (APP_SPEC G.5 Offer, web G.6.5): The Pair with two pickers,
 * then The Foursome band (this screen's golf band). /offer/the-foursome opens
 * the same screen scrolled to the band.
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
        <ErrorState error={requested.error ?? catalog.error ?? new Error("This bundle isn't available right now.")} onRetry={() => catalog.refetch()} />
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
    const y = fourY - 80
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
      {pair ? <PairSection pair={pair} single={single} /> : null}
      {four ? (
        <View onLayout={(e) => setFourY(e.nativeEvent.layout.y)}>
          <Reveal threshold={openFour ? 50 : 0.85}>
            <FoursomeBand four={four} single={single} />
          </Reveal>
        </View>
      ) : null}
      <Reveal style={styles.section}>
        <Text variant="tab" style={styles.pad}>
          What&apos;s included
        </Text>
        <View style={styles.tiles}>
          <ValueTile eyebrow="Two caps" body="Pick any two core colors, or the same color twice." />
          <ValueTile eyebrow="One size each" body={`The strap ${POLICY.oneSize}. The crown sits mid.`} />
          <ValueTile eyebrow={VALUE_TILES[2].eyebrow} body={VALUE_TILES[2].body} />
        </View>
      </Reveal>
      <Reveal style={styles.section}>
        <Text variant="tab" style={styles.pad}>
          Why two
        </Text>
        <View style={styles.why}>
          {["A light one and a dark one.", "One for the bag, one for the car.", "You already know the fit."].map((t) => (
            <Text key={t} variant="body">
              — {t}
            </Text>
          ))}
        </View>
      </Reveal>
      <Reveal style={styles.faq}>
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
            No. {[
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
          onPress={() => {
            trackTap("offer_story")
            openWeb("/stories/crown-test")
          }}
        />
      </Reveal>
    </Screen>
  )
}

function useOptionIds(product: Product) {
  const opts = productOptions(product).filter((o) => !o.isSize)
  const first = opts.find((o) => /first/i.test(o.title)) ?? opts[0]
  const second = opts.find((o) => /second/i.test(o.title)) ?? opts[1]
  return { first, second, opts }
}

function PairSection({ pair, single }: { pair: Product; single: Product | null }) {
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
    <View>
      <PairGallery left={lead(a)} right={lead(b)} title={`The Pair: ${a} and ${b}`} />
      <View style={styles.buyCard}>
        <Text variant="pdpTitle" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="subline" tone="muted">
          The Pair · Core colors
        </Text>
        <View style={styles.priceRow}>
          {price != null ? <Text variant="price">{formatMoney(price)}</Text> : null}
          {saving ? (
            <>
              <Text variant="priceSm" style={styles.struck}>
                {formatMoney(saving.anchor)}
              </Text>
              <View style={styles.pill}>
                <Text variant="pricePill">Save {formatMoney(saving.saving)}</Text>
              </View>
            </>
          ) : null}
        </View>
        <Picker label="First cap:" value={a} onChange={setA} values={first?.values ?? [...CORE_COLOURWAYS]} single={single} />
        <Picker label="Second cap:" value={b} onChange={setB} values={second?.values ?? [...CORE_COLOURWAYS]} single={single} />
        {stock ? <StockLine state={stock.state} quantity={stock.quantity} /> : null}
        <Button
          title={`Add the pair – ${price != null ? formatMoney(price) : ""}`}
          size="atc"
          disabled={!variant || stock?.state === "sold_out"}
          loading={quick.pending !== null}
          onPress={() => {
            if (!variant) return
            trackTap("offer_add")
            void quick.addVariant(pair, variant, "app_offer", { detail: `${shortColour(a)} + ${shortColour(b)}`, image: lead(a) })
          }}
        />
        <Text variant="meta" tone="muted" style={styles.center}>
          {price != null && price >= POLICY.freeShippingThreshold ? `${formatMoney(price)} qualifies for free shipping.` : POLICY.shipping}
          {" · "}
          {POLICY.returns}
        </Text>
      </View>
    </View>
  )
}

function Picker({
  label,
  value,
  values,
  onChange,
  single,
  inverse = false,
}: {
  label: string
  value: string
  values: string[]
  onChange: (v: string) => void
  single: Product | null
  inverse?: boolean
}) {
  const rope = ropeNameFor(single, value)
  return (
    <View style={styles.picker}>
      <View style={styles.pickerLabel}>
        <Text variant="label" tone={inverse ? "inverse" : "default"}>
          {label}
        </Text>
        <Text variant="meta" tone={inverse ? "inverse" : "default"}>
          {value}
        </Text>
        {rope ? (
          <Text variant="meta" tone={inverse ? "tint" : "muted"}>
            · {rope} rope
          </Text>
        ) : null}
      </View>
      <View style={styles.swatches}>
        {values.map((c) => (
          <Swatch key={c} name={c} selected={c === value} onPress={() => onChange(c)} />
        ))}
      </View>
      <RopeRule colourway={value} />
    </View>
  )
}

function FoursomeBand({ four, single }: { four: Product; single: Product | null }) {
  const quick = useQuickAdd()
  const { opts } = useOptionIds(four)
  const opt = opts[0]
  const [mode, setMode] = useState<"one" | "each">("one")
  const [colour, setColour] = useState<string>(CORE_COLOURWAYS[2])
  const saving = offerSaving(four, single)
  const price = saving?.price ?? four.variants?.[0]?.calculated_price?.calculated_amount ?? null
  const variant = (four.variants ?? []).find((v) => {
    const val = opt ? variantOptionMap(v)[opt.id] ?? v.title ?? "" : v.title ?? ""
    return mode === "each" ? /each/i.test(val) : val.includes(colour) && !/each/i.test(val)
  })
  const stock = variant ? variantStock(variant) : null
  return (
    <View style={styles.band}>
      <Text variant="kicker" tone="tint">
        For the group trip, the outing or Father&apos;s Day.
      </Text>
      <Text variant="section" tone="inverse">
        Four caps, {saving ? formatMoney(saving.perCap) : "$38"} each.
      </Text>
      <SegmentedControl
        options={[
          { value: "one", label: "Four of one color" },
          { value: "each", label: "One of each" },
        ]}
        value={mode}
        onChange={(m: "one" | "each") => setMode(m)}
        inverse
      />
      <View style={styles.bandPicker}>
        {mode === "one" ? (
          <Picker label="Color:" value={colour} onChange={setColour} values={[...CORE_COLOURWAYS]} single={single} inverse />
        ) : (
          <View style={styles.swatches}>
            {CORE_COLOURWAYS.map((c) => (
              <Swatch key={c} name={c} selected />
            ))}
          </View>
        )}
      </View>
      <View style={styles.priceRow}>
        {price != null ? (
          <Text variant="price" tone="inverse">
            {formatMoney(price)}
          </Text>
        ) : null}
        {saving ? (
          <>
            <Text variant="priceSm" tone="tint" style={styles.struck}>
              {formatMoney(saving.anchor)}
            </Text>
            <View style={styles.pill}>
              <Text variant="pricePill">Save {formatMoney(saving.saving)}</Text>
            </View>
          </>
        ) : null}
      </View>
      {stock ? <StockLine state={stock.state} quantity={stock.quantity} inverse /> : null}
      <Button
        title={`Add the Foursome – ${price != null ? formatMoney(price) : ""}`}
        variant="primary"
        size="atc"
        disabled={!variant || stock?.state === "sold_out"}
        loading={quick.pending !== null}
        onPress={() => {
          if (!variant) return
          trackTap("offer_foursome_add")
          void quick.addVariant(four, variant, "app_offer", {
            detail: mode === "each" ? "One of each" : `4 × ${shortColour(colour)}`,
            image: single ? imagesFor(single, mode === "each" ? CORE_COLOURWAYS[0] : colour)[0] : null,
          })
        }}
      />
      <Button title="Back to the Rope Cap" variant="link" inverse onPress={() => router.push("/products/rope-cap")} />
    </View>
  )
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20 },
  center: { textAlign: "center" },
  buyCard: { margin: 10, backgroundColor: colors.white, borderRadius: radius.xl, padding: 20, gap: 20 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  struck: { textDecorationLine: "line-through", opacity: 0.65 },
  pill: { backgroundColor: colors.naturalWhite, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  picker: { gap: 10 },
  pickerLabel: { flexDirection: "row", gap: 6, alignItems: "baseline", flexWrap: "wrap" },
  swatches: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  band: { backgroundColor: golf.green, marginHorizontal: 10, marginTop: 30, borderRadius: radius.xxxl, padding: 20, gap: 16 },
  bandPicker: { gap: 10 },
  section: { marginTop: 40, gap: 12 },
  tiles: { gap: 10, paddingHorizontal: 10 },
  why: { marginHorizontal: 10, backgroundColor: colors.white, borderRadius: radius.xxl, padding: 20, gap: 8 },
  faq: { margin: 10, marginTop: 30, backgroundColor: colors.white, borderRadius: radius.xl, paddingHorizontal: 20, paddingBottom: 20 },
})
