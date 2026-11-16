import { useQueryClient } from "@tanstack/react-query"
import { Image } from "expo-image"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { FlatList, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native"

import { Accordion } from "@/components/accordion"
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { FitScale } from "@/components/fit-scale"
import { Gallery, PairGallery } from "@/components/gallery"
import { OfferCard } from "@/components/offer-card"
import { PerkRow } from "@/components/perk-row"
import { ProductCard } from "@/components/product-card"
import { Screen } from "@/components/screen"
import { SizeButton, SizeRow } from "@/components/size-button"
import { SizeGuide } from "@/components/size-guide"
import { EmptyState, ErrorState, LoadingState } from "@/components/state-views"
import { StockLine } from "@/components/stock-line"
import { Swatch, SwatchGrid } from "@/components/swatch"
import { Text } from "@/components/text"
import { colors, fonts, layout, MAX_CONTENT_WIDTH, shadow, type } from "@/constants/theme"
import { useCatalog, useProduct } from "@/hooks/use-products"
import { useRecentlyViewed } from "@/hooks/use-recently-viewed"
import { useLiveReleaseIndex } from "@/hooks/use-releases"
import { track, useTrackOnce } from "@/lib/analytics"
import { listable } from "@/lib/catalog"
import { formatMoney } from "@/lib/format"
import { openWeb } from "@/lib/links"
import { errorMessage } from "@/lib/medusa"
import { POLICY } from "@/lib/policy"
import {
  colorOptionOf,
  defaultSelection,
  detailsOf,
  findVariant,
  fitProfileOf,
  imagesFor,
  isLowStock,
  isOffer,
  isOneSize,
  leadImageFor,
  offerFor,
  offerSaving,
  offerSingleHandle,
  oneSizeRange,
  productMeta,
  productOptions,
  productPrice,
  productTypeOf,
  shapeOf,
  sizeChartOf,
  valueStock,
  variantPrice,
  variantStock,
  type Product,
} from "@/lib/product"
import { useAddedSheet } from "@/providers/added-sheet-provider"
import { useCart } from "@/providers/cart-provider"

const CROWN = ["Low", "Mid", "Tall"]
const STRUCTURE = ["Unstructured", "Semi", "Structured"]

/** Product (APP_SPEC §5.4): the web PDP at phone size, 21.5pt gutter. */
export default function ProductScreen() {
  const params = useLocalSearchParams<{ handle: string; release?: string; color?: string }>()
  const { data: product, isLoading, error, refetch, isRefetching } = useProduct(params.handle)
  const catalog = useCatalog()
  const liveIndex = useLiveReleaseIndex()
  const { record } = useRecentlyViewed()

  useTrackOnce("product_viewed", product?.id, () => ({
    product_id: product?.id,
    handle: product?.handle,
    release_id: product ? liveIndex.get(product.id) : undefined,
  }))
  useEffect(() => {
    if (product?.handle && !isOffer(product)) void record(product.handle)
  }, [product?.handle, product, record])

  if (isLoading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    )
  }
  if (error) {
    return (
      <Screen>
        <ErrorState error={error} onRetry={() => refetch()} />
      </Screen>
    )
  }
  if (!product) {
    return (
      <Screen>
        <EmptyState
          title="Not Available Right Now"
          body="This hat may be part of a drop that hasn't gone live yet, or it has sold through."
          actionTitle="See drops"
          onAction={() => router.replace("/drops")}
        />
      </Screen>
    )
  }

  const releaseId = liveIndex.get(product.id) ?? (typeof params.release === "string" ? params.release : undefined)
  return (
    <ProductView
      key={product.id}
      product={product}
      catalog={catalog.data ?? []}
      releaseId={releaseId}
      initialColor={typeof params.color === "string" ? params.color : null}
      refreshing={isRefetching}
      onRefresh={() => refetch()}
    />
  )
}

function ProductView({
  product,
  catalog,
  releaseId,
  initialColor,
  refreshing,
  onRefresh,
}: {
  product: Product
  catalog: Product[]
  releaseId?: string
  initialColor: string | null
  refreshing: boolean
  onRefresh: () => void
}) {
  const { width: windowWidth } = useWindowDimensions()
  const W = Math.min(windowWidth, MAX_CONTENT_WIDTH)
  const { addItem } = useCart()
  const sheet = useAddedSheet()
  const queryClient = useQueryClient()
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null)
  const offer = isOffer(product)
  const single = useProduct(offer ? offerSingleHandle(product) ?? undefined : undefined).data ?? null

  const [selected, setSelected] = useState<Record<string, string>>(() => defaultSelection(product, initialColor))
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [atcBottom, setAtcBottom] = useState(Number.POSITIVE_INFINITY)
  const [sticky, setSticky] = useState(false)
  const [sizeY, setSizeY] = useState(0)
  // onLayout y values are relative to the body; add its offset in the scroll content.
  const [bodyY, setBodyY] = useState(0)

  const options = productOptions(product)
  const sizeOption = options.find((o) => o.isSize)
  const colorOption = colorOptionOf(product)
  const oneSize = isOneSize(product)
  const variant = findVariant(product, selected)
  const stock = variant ? variantStock(variant) : null
  const price = variant ? variantPrice(variant) : null
  const fallbackPrice = productPrice(product)
  const shownPrice = price ?? fallbackPrice
  const { fitNotes } = productMeta(product)
  const color = colorOption ? selected[colorOption.id] ?? null : null
  const needsSize = !!sizeOption && !oneSize && !selected[sizeOption.id]
  const fit = fitProfileOf(product)
  const details = detailsOf(product)
  const shape = shapeOf(product)
  const twoPack = offerFor(catalog, product.handle)
  const saving = offer ? offerSaving(product, single) : null
  const badge = releaseId ? "Limited" : product.collection?.handle === "core" ? "Core" : isLowStock(product) ? "Low Stock" : null
  const care = details.find(([k]) => k === "Care")?.[1] ?? null
  const pickedLabels = options
    .filter((o) => !o.isSize)
    .map((o) => selected[o.id])
    .filter(Boolean)
    .join(" + ")

  const pick = (optionId: string, value: string) => {
    setAdded(false)
    setSelected((s) => ({ ...s, [optionId]: value }))
    if (colorOption && optionId === colorOption.id) router.setParams({ color: value })
  }

  const add = async () => {
    if (needsSize) {
      scroll.current?.scrollTo({ y: Math.max(0, bodyY + sizeY - 80), animated: true })
      return
    }
    if (!variant || stock?.state === "sold_out") return
    setAdding(true)
    setAddError(null)
    try {
      await addItem(variant.id, 1, { releaseId })
      track("add_to_cart", {
        product_id: product.id,
        variant_id: variant.id,
        quantity: 1,
        price: price?.amount,
        currency: price?.currency?.toUpperCase(),
        release_id: releaseId,
        source: "app_pdp",
      })
      setAdded(true)
      sheet.show({
        title: product.title,
        detail: [pickedLabels, sizeOption ? selected[sizeOption.id] : null].filter(Boolean).join(" / "),
        price: price ? formatMoney(price.amount, price.currency) : null,
        image: offer && single ? leadImageFor(single, Object.values(selected)[0] ?? "") : imagesFor(product, color)[0],
      })
      queryClient.invalidateQueries({ queryKey: ["product", product.handle] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    } catch (e) {
      setAddError(errorMessage(e))
    } finally {
      setAdding(false)
    }
  }

  const soldOut = stock?.state === "sold_out"
  const ctaTitle = needsSize
    ? "Select a size"
    : soldOut
      ? "Sold out"
      : offer
        ? `Add the pair - ${shownPrice ? formatMoney(shownPrice.amount, shownPrice.currency) : ""}`
        : added
          ? "Added"
          : stock?.state === "low"
            ? "Add to cart - low inventory"
            : "Add to cart"

  const gallery = imagesFor(product, color)
  const pairs = offer
    ? options.filter((o) => !o.isSize).map((o) => (single ? leadImageFor(single, selected[o.id] ?? "") : null))
    : []
  const alsoLike = listable(catalog)
    .filter((p) => p.id !== product.id)
    .sort((a, b) => Number(shapeOf(a)?.handle === shape?.handle) - Number(shapeOf(b)?.handle === shape?.handle))
    .slice(0, 6)

  return (
    <Screen
      edges={["bottom"]}
      scrollRef={scroll}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onScrollY={(y) => setSticky(y > bodyY + atcBottom)}
      overlay={
        sticky ? (
          <StickyBar
            image={offer ? pairs[0] ?? null : gallery[0] ?? null}
            price={shownPrice ? formatMoney(shownPrice.amount, shownPrice.currency) : ""}
            detail={pickedLabels}
            title={needsSize ? "Select a size" : soldOut ? "Sold out" : "Add to cart"}
            disabled={soldOut}
            loading={adding}
            onPress={add}
          />
        ) : null
      }>
      <Stack.Screen options={{ title: "" }} />
      {offer ? (
        <PairGallery first={pairs[0] ?? null} second={pairs[1] ?? null} width={W} />
      ) : (
        <Gallery images={gallery} pageWidth={W} imageSize={W - 43} alt={product.title} badge={badge} resetKey={color} />
      )}

      <View style={styles.body} onLayout={(e) => setBodyY(e.nativeEvent.layout.y)}>
        <View style={styles.titleRow}>
          <Text style={styles.title} accessibilityRole="header">
            {product.title}
          </Text>
          {shownPrice ? (
            <Text style={styles.price}>
              {!price && fallbackPrice?.varies ? "From " : ""}
              {formatMoney(shownPrice.amount, shownPrice.currency)}
            </Text>
          ) : null}
        </View>
        {offer && saving ? (
          <View style={styles.savingRow}>
            <Badge label={`Save ${formatMoney(saving.saving, shownPrice?.currency)}`} small />
            <Text style={styles.strike}>{formatMoney(saving.anchor, shownPrice?.currency)}</Text>
          </View>
        ) : (
          <Text style={styles.type}>{productTypeOf(product)}</Text>
        )}

        <View style={styles.crumbs}>
          <Crumb label="Shop All" onPress={() => router.navigate("/shop")} />
          {shape ? (
            <>
              <Text style={styles.crumb}> &gt; </Text>
              <Crumb label={shape.name} onPress={() => router.navigate(`/shop?shape=${shape.handle}` as never)} />
            </>
          ) : null}
          <Text style={styles.crumb}> &gt; </Text>
          <Text style={[styles.crumb, styles.crumbCurrent]} numberOfLines={1}>
            {product.title}
          </Text>
        </View>

        {options
          .filter((o) => !o.isSize)
          .map((o) => (
            <View key={o.id} style={styles.colorBlock}>
              <Text style={styles.label}>
                {offer ? o.title.replace(/\b\w/g, (c) => c.toUpperCase()) : "Color"}: {selected[o.id] ?? "Pick one"}
              </Text>
              <SwatchGrid>
                {o.values.map((v) => (
                  <Swatch
                    key={v}
                    name={v}
                    selected={selected[o.id] === v}
                    soldOut={valueStock(product, o.id, v, selected).state === "sold_out"}
                    onPress={() => pick(o.id, v)}
                  />
                ))}
              </SwatchGrid>
            </View>
          ))}

        {!offer ? (
          <View style={styles.sizeBlock} onLayout={(e) => setSizeY(e.nativeEvent.layout.y)}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Choose your Size</Text>
              <Button title="Size Guide" variant="micro" onPress={() => setGuideOpen(true)} />
            </View>
            {oneSize ? (
              <>
                <SizeRow>
                  <SizeButton label="One Size" selected />
                </SizeRow>
                <Text style={styles.range}>Fits {oneSizeRange(product)}</Text>
              </>
            ) : sizeOption ? (
              <SizeRow>
                {sizeOption.values.map((v) => {
                  const s = valueStock(product, sizeOption.id, v, selected)
                  return (
                    <SizeButton
                      key={v}
                      label={v}
                      selected={selected[sizeOption.id] === v}
                      soldOut={s.state === "sold_out"}
                      left={s.state === "low" ? s.quantity : null}
                      onPress={() => pick(sizeOption.id, v)}
                    />
                  )
                })}
              </SizeRow>
            ) : null}
          </View>
        ) : null}

        {twoPack && !offer ? <OfferCard offer={twoPack} single={product} /> : null}

        <View
          style={styles.atc}
          onLayout={(e) => setAtcBottom(e.nativeEvent.layout.y + e.nativeEvent.layout.height)}>
          <Button
            title={ctaTitle}
            size="atc"
            onPress={add}
            loading={adding}
            disabled={soldOut || (!variant && !needsSize)}
          />
          {addError ? <Text style={styles.error}>{addError}</Text> : null}
        </View>

        {variant?.sku ? <Text style={styles.sku}>SKU: {variant.sku}</Text> : null}
        {stock ? (
          <View style={styles.stock}>
            <StockLine
              state={stock.state}
              quantity={stock.quantity}
              where={[color, sizeOption ? selected[sizeOption.id] : null].filter(Boolean).join(" / ")}
            />
          </View>
        ) : null}
        {releaseId ? (
          <Text variant="micro" tone="muted" style={styles.limited}>
            {POLICY.limitedRun}
          </Text>
        ) : null}

        <View style={styles.perks}>
          <PerkRow icon="car-outline" title={POLICY.shippingShort} detail={`${POLICY.dispatch}. Express $15.`} />
          <PerkRow icon="return-down-back-outline" title={POLICY.returnsShort} detail={POLICY.returnsDetail} />
          <PerkRow
            icon="resize-outline"
            title={oneSize ? "One Size, Adjustable" : "Sized S/M & L/XL"}
            detail={oneSize ? `Fits ${oneSizeRange(product)}.` : POLICY.sizedRange}
          />
          <PerkRow icon="cube-outline" title="Live Stock Counts" detail={POLICY.stockDetail} />
          {care ? <PerkRow icon="water-outline" title="Product Care" detail={care} /> : null}
        </View>

        {product.description ? <Text style={[type.system, styles.description]}>{product.description}</Text> : null}

        {fit ? (
          <View style={styles.fit}>
            <Text style={type.promo}>Fit Guide</Text>
            <FitScale label="Crown height" steps={CROWN} active={CROWN.indexOf(fit.crown)} />
            <FitScale
              label="Structure"
              steps={STRUCTURE}
              active={["Unstructured", "Semi-structured", "Structured"].indexOf(fit.structure)}
            />
            <Button
              title="Read the fit guide"
              variant="micro"
              onPress={() => openWeb(`/fit-guide#${offer ? offerSingleHandle(product) : product.handle}`)}
            />
          </View>
        ) : null}

        <View style={styles.accordions}>
          {details.length ? (
            <Accordion title="Details" first initiallyOpen>
              <View style={styles.details}>
                {details.map(([k, v]) => (
                  <View key={k}>
                    <Text style={styles.detailLabel}>{k}</Text>
                    <Text style={styles.detailValue}>{v}</Text>
                  </View>
                ))}
              </View>
            </Accordion>
          ) : null}
          <Accordion title="Shipping & Returns" first={!details.length}>
            <Text variant="bodySm">
              {POLICY.shippingShort} · Express $15. {POLICY.dispatch}. {POLICY.returnsShort}: {POLICY.returnsDetail}
            </Text>
          </Accordion>
        </View>
      </View>

      {alsoLike.length ? (
        <View style={styles.alsoLike}>
          <Text style={[type.section, styles.alsoTitle]}>You May Also Like</Text>
          <FlatList
            data={alsoLike}
            keyExtractor={(p) => p.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.alsoRow}
            renderItem={({ item }) => <ProductCard product={item} width={171} carousel={false} />}
          />
        </View>
      ) : null}

      <SizeGuide visible={guideOpen} onClose={() => setGuideOpen(false)} chart={sizeChartOf(product)} notes={fitNotes} />
    </Screen>
  )
}

function Crumb({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} hitSlop={6}>
      <Text style={styles.crumb}>{label}</Text>
    </Pressable>
  )
}

/** Sticky buy bar (APP_SPEC §5.4 item 15): appears once the CTA scrolls under the header. */
function StickyBar({
  image,
  price,
  detail,
  title,
  disabled,
  loading,
  onPress,
}: {
  image: string | null
  price: string
  detail: string
  title: string
  disabled?: boolean
  loading?: boolean
  onPress: () => void
}) {
  return (
    <View style={[styles.sticky, shadow.sticky]}>
      {image ? <Image source={image} style={styles.stickyImage} contentFit="contain" /> : null}
      <View style={styles.stickyText}>
        <Text style={styles.stickyPrice}>{price}</Text>
        <Text style={styles.stickyDetail} numberOfLines={1}>
          {detail}
        </Text>
      </View>
      <Button title={title} onPress={onPress} disabled={disabled} loading={loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: layout.pdpGutter, paddingTop: 16 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  title: { flex: 1, fontFamily: fonts.body, fontSize: 20, lineHeight: 25, textTransform: "uppercase", color: colors.text },
  price: { fontFamily: fonts.body, fontSize: 18, lineHeight: 25, color: colors.text },
  type: { fontFamily: fonts.body, fontSize: 15, lineHeight: 19.5, color: colors.textMuted, marginTop: 2 },
  savingRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  strike: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  crumbs: { flexDirection: "row", alignItems: "center", marginTop: 16, flexWrap: "nowrap" },
  crumb: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.text },
  crumbCurrent: { color: colors.textMuted, flexShrink: 1 },
  colorBlock: { marginTop: 20 },
  label: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19.5, color: colors.text, marginBottom: 10 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  sizeBlock: { marginTop: 24 },
  range: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19.5, color: colors.textMuted, marginTop: 8 },
  atc: { marginTop: 20, gap: 8 },
  error: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.error },
  sku: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19.5, color: colors.text, marginTop: 12 },
  stock: { marginTop: 12 },
  limited: { marginTop: 8, lineHeight: 19.5 },
  perks: { marginTop: 24 },
  description: { marginTop: 16, color: colors.text },
  fit: { marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: colors.line, gap: 20 },
  accordions: { marginTop: 24 },
  details: { gap: 12 },
  detailLabel: {
    fontFamily: fonts.heading,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: colors.text,
  },
  detailValue: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19.5, color: colors.text },
  alsoLike: { backgroundColor: colors.band, paddingVertical: layout.section, marginTop: 32 },
  alsoTitle: { marginLeft: 16, marginBottom: 16 },
  alsoRow: { paddingHorizontal: 16, gap: 16 },
  sticky: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stickyImage: { width: 56, height: 56 },
  stickyText: { flex: 1 },
  stickyPrice: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22, color: colors.text },
  stickyDetail: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16, letterSpacing: 0.8, color: colors.textMuted },
})
