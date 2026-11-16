import { Image } from "expo-image"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from "react-native"
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated"

import { BundleThumb } from "@/components/bundle-rows"
import { Button } from "@/components/button"
import { CredibilityStrip } from "@/components/credibility-strip"
import { HoleBand } from "@/components/hole-band"
import { TeeSheet } from "@/components/notify-me"
import { PillWindow } from "@/components/pill-window"
import { coreCounts } from "@/components/product-card"
import { MaterialRing } from "@/components/ring"
import { Screen } from "@/components/screen"
import { ErrorState, Skeleton } from "@/components/state-views"
import { StockLine } from "@/components/stock-line"
import { Swatch } from "@/components/swatch"
import { Text } from "@/components/text"
import { Veil } from "@/components/veil"
import { VALUE_TILES, ValueTile } from "@/components/value-tile"
import { colors, CORE_COLOURWAYS, ease, golf, layout, motion, radius, shadow } from "@/constants/theme"
import { holeDay, useHoles } from "@/hooks/use-holes"
import { useNow } from "@/hooks/use-now"
import { useCatalog, useContentSeries } from "@/hooks/use-products"
import { trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { openWeb } from "@/lib/links"
import { Reveal, useMountProgress } from "@/lib/motion"
import { capsIn, detailsOf, hatImage, imagesFor, offersFor, productPrice, type Product } from "@/lib/product"

const TILE_BG: Record<string, string> = {
  "Tour White": golf.sage,
  "Clubhouse Navy": golf.tint,
  Pine: golf.sage,
  Fescue: golf.tint,
}

/** Home (APP_SPEC G.5): web G.6.2's order with live data. */
export default function HomeScreen() {
  const catalog = useCatalog()
  const { next, liveEditions, holes } = useHoles()
  const core = catalog.data?.find((p) => p.handle === "rope-cap")
  const offers = offersFor(catalog.data ?? [], "rope-cap")
  const bandHole = liveEditions[0] ?? next

  return (
    <Screen ticker under="ticker" refreshing={catalog.isRefetching} onRefresh={() => catalog.refetch()}>
      <Hero core={core} pair={offers.find((o) => capsIn(o) === 2) ?? null} upcoming={next ? { n: next.number, at: next.releaseAt } : null} />
      {catalog.error && !catalog.data ? <ErrorState error={catalog.error} onRetry={() => catalog.refetch()} /> : null}
      {core ? <PickAColor core={core} /> : <Skeleton style={styles.skeleton} />}
      {bandHole ? <HoleBand hole={bandHole} orbit label="home" /> : null}
      {core ? <TheBuild core={core} /> : null}
      {core ? <OneTwoFour core={core} offers={offers} /> : null}
      {core ? <InStockToday core={core} /> : null}
      <CrownTest />
      <PillWindow
        image={hatImage("rope-brim.jpg")}
        quote="We make one rope cap. We kept the crown lower than most, washed the cotton until it felt broken in, and put a rope on it worth looking at. Each season gets a new numbered color.">
        <Button
          title="Why the Rope Cap"
          onPress={() => {
            trackTap("home_reasons")
            openWeb("/reasons/rope-cap")
          }}
        />
      </PillWindow>
      <CredibilityStrip />
      <Stories />
      <View style={styles.tiles}>
        {VALUE_TILES.map((t) => (
          <ValueTile key={t.eyebrow} eyebrow={t.eyebrow} body={t.body} />
        ))}
      </View>
      <FooterCard hole={next ?? holes.find((h) => h.status === "upcoming") ?? null} />
    </Screen>
  )
}

/** M3: the container fades in, then the copy 300ms later. */
function Hero({ core, pair, upcoming }: { core: Product | undefined; pair: Product | null; upcoming: { n: number; at: string | null } | null }) {
  const { width, height } = useWindowDimensions()
  const container = useMountProgress(800)
  const copy = useMountProgress(800, 300)
  const cStyle = useAnimatedStyle(() => ({ opacity: container.value }))
  const tStyle = useAnimatedStyle(() => ({ opacity: copy.value }))
  const price = core ? productPrice(core) : null
  const pairPrice = pair ? productPrice(pair) : null
  const now = useNow(60_000)
  const soon = upcoming?.at && new Date(upcoming.at).getTime() - now < 60 * 86400_000
  const eyebrow = `The Rope Cap · Hole 1 · Out now${soon ? ` · Hole ${upcoming!.n} ${holeDay(upcoming!.at)}` : ""}`
  const h = Math.max(480, height - 132 - layout.ticker)
  return (
    <Animated.View style={[styles.hero, { width: Math.min(width, 720) - 20, height: h }, cStyle]}>
      <Image source={hatImage("rope-lifestyle-hero-mobile.jpg")} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={{ top: "35%" }} />
      <Veil alpha={0.6} />
      <Animated.View style={[styles.heroCopy, tStyle]}>
        <Text variant="heroEyebrow" tone="inverse">
          {eyebrow}
        </Text>
        <Text variant="hero" tone="inverse" accessibilityRole="header">
          One rope cap. Made properly.
        </Text>
        <Text variant="kicker" tone="inverse">
          Mid crown. Washed cotton. A rope worth looking at.
        </Text>
        {price ? (
          <Text variant="body" tone="inverse">
            The Rope Cap · {formatMoney(price.amount, price.currency)} · {CORE_COLOURWAYS.length} colors
          </Text>
        ) : null}
        <View style={styles.heroButtons}>
          <Button
            title="Shop the Rope Cap"
            variant="primary"
            size="small"
            style={styles.flex}
            onPress={() => {
              trackTap("hero_shop_core")
              router.push("/products/rope-cap")
            }}
          />
          {pair && pairPrice ? (
            <Button
              title={`The Pair · ${formatMoney(pairPrice.amount, pairPrice.currency)}`}
              variant="primary"
              size="small"
              style={styles.flex}
              onPress={() => {
                trackTap("hero_shop_pair")
                router.push(`/offer/${pair.handle}` as never)
              }}
            />
          ) : null}
        </View>
      </Animated.View>
    </Animated.View>
  )
}

/** Section header with the v5 tab title and its 2pt underline (M15). */
function TabTitle({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View style={styles.tabTitleRow}>
      <View>
        <Text variant="tab">{title}</Text>
        <View style={styles.tabUnderline} />
      </View>
      {right}
    </View>
  )
}

/** Pick a color: the centred-slide carousel; the centred tile morphs radius 20 → 250 (M5). */
function PickAColor({ core }: { core: Product }) {
  const { width } = useWindowDimensions()
  const itemW = Math.round(Math.min(width, 720) / 1.4)
  const [centred, setCentred] = useState(0)
  const [onViewable] = useState(() => ({ viewableItems }: { viewableItems: { index?: number | null; isViewable: boolean }[] }) => {
    const mid = viewableItems.find((v) => v.isViewable)
    if (mid?.index != null) setCentred(mid.index)
  })
  return (
    <Reveal style={styles.section} threshold={1}>
      <TabTitle
        title="Pick a color"
        right={
          <Button
            title="Not sure? Take the 30-second quiz"
            variant="link"
            onPress={() => {
              trackTap("home_quiz")
              openWeb("/quiz")
            }}
          />
        }
      />
      <FlatList
        data={[...CORE_COLOURWAYS]}
        horizontal
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemW + 10}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: (Math.min(width, 720) - itemW) / 2, gap: 10 }}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item, index }) => <ColorTile core={core} colour={item} width={itemW} centred={index === centred} index={index} />}
      />
    </Reveal>
  )
}

function ColorTile({ core, colour, width, centred, index }: { core: Product; colour: string; width: number; centred: boolean; index: number }) {
  const reduce = useReducedMotion()
  const p = useSharedValue(centred ? 1 : 0)
  const title = useSharedValue(reduce ? 1 : 0)
  useEffect(() => {
    p.value = withTiming(centred ? 1 : 0, { duration: reduce ? 0 : 600, easing: ease.power3InOut, reduceMotion: motion.reduceMotion })
  }, [centred, p, reduce])
  useEffect(() => {
    title.value = withDelay(index * 150, withTiming(1, { duration: 800, easing: ease.sineOut, reduceMotion: motion.reduceMotion }))
  }, [index, title])
  const tile = useAnimatedStyle(() => ({ borderRadius: 20 + (width / 2 - 20) * p.value }))
  const cta = useAnimatedStyle(() => ({ opacity: 0.35 + 0.65 * p.value }))
  const titleStyle = useAnimatedStyle(() => ({ opacity: title.value }))
  const image = imagesFor(core, colour)[0]
  const hover = imagesFor(core, colour)[2]
  const go = () => {
    trackTap("shop_by_color", { color: colour })
    router.push({ pathname: "/products/[handle]", params: { handle: "rope-cap", color: colour } })
  }
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={`Shop ${colour}`} onPress={go}>
      <Animated.View style={[styles.colorTile, { width, height: width / 0.77, backgroundColor: TILE_BG[colour] }, tile]}>
        <View style={[styles.disc, shadow.float, { width: width * 0.72, height: width * 0.72, borderRadius: width * 0.36 }]}>
          <Image source={centred && hover ? hover : image} style={styles.discImage} contentFit="contain" transition={300} />
        </View>
        <Animated.View style={[styles.tileText, titleStyle]}>
          <Text variant="tile">{colour}</Text>
          <Animated.View style={[styles.flexStretch, cta]}>
            <Button title={`Shop ${colour}`} variant="outlineBlack" onPress={go} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  )
}

/** The build: the material ring on the clubhouse photo, with the rope macro at its centre. */
function TheBuild({ core }: { core: Product }) {
  const d = Object.fromEntries(detailsOf(core))
  const callouts = [
    { title: "Crown", body: d.Crown },
    { title: "Rope", body: d.Rope },
    { title: "Brim", body: d.Brim },
    { title: "Closure", body: d.Closure },
  ].filter((c): c is { title: string; body: string } => !!c.body)
  return (
    <MaterialRing background={hatImage("rope-clubhouse.jpg")} centre={hatImage("rope-cap-tour-white-5.jpg")} callouts={callouts} title="What it's made of">
      <Button
        title="See the scorecard"
        variant="primary"
        onPress={() => {
          trackTap("home_scorecard")
          router.push({ pathname: "/products/[handle]", params: { handle: "rope-cap", section: "scorecard" } })
        }}
      />
    </MaterialRing>
  )
}

/** One, two or four: three promo tiles with live prices and per-cap prices. */
function OneTwoFour({ core, offers }: { core: Product; offers: Product[] }) {
  const { width } = useWindowDimensions()
  const tileW = Math.round(Math.min(width, 720) * 0.8)
  const single = productPrice(core)
  const tiles = [
    {
      key: "one",
      title: "The Rope Cap",
      price: single ? formatMoney(single.amount, single.currency) : "",
      cta: "Shop one",
      bg: golf.sage,
      art: <Image source={hatImage("rope-cap-tour-white-1.jpg")} style={styles.discImage} contentFit="contain" />,
      go: () => {
        trackTap("core_product")
        router.push("/products/rope-cap")
      },
    },
    ...offers.map((o) => {
      const caps = capsIn(o)
      const pr = productPrice(o)
      const four = caps >= 4
      return {
        key: o.id,
        title: four ? "The Foursome" : "The Pair",
        price: pr ? `${formatMoney(pr.amount, pr.currency)} · ${formatMoney(pr.amount / caps)} a cap` : "",
        cta: four ? "Shop the Foursome" : "Shop the Pair",
        bg: four ? golf.sage : golf.tint,
        art: <BundleThumb caps={caps} size={Math.round(tileW * 0.5)} />,
        go: () => {
          trackTap(four ? "home_foursome" : "home_pair")
          router.push(`/offer/${o.handle}` as never)
        },
      }
    }),
  ]
  return (
    <Reveal style={styles.section}>
      <TabTitle title="One, two or four" />
      <FlatList
        data={tiles}
        horizontal
        keyExtractor={(t) => t.key}
        showsHorizontalScrollIndicator={false}
        snapToInterval={tileW + 10}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 10, gap: 10 }}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="link" accessibilityLabel={`${item.title}, ${item.price}`} onPress={item.go}>
            <View style={[styles.promo, { width: tileW, height: tileW / 0.7, backgroundColor: item.bg }]}>
              <View style={[styles.promoArt, shadow.float]}>{item.art}</View>
              <Text variant="tile">{item.title}</Text>
              <Text variant="label">{item.price}</Text>
              <Button title={item.cta} variant="outlineBlack" onPress={item.go} />
            </View>
          </Pressable>
        )}
      />
    </Reveal>
  )
}

function InStockToday({ core }: { core: Product }) {
  const counts = coreCounts(core)
  if (!counts.length) return null
  return (
    <Reveal style={styles.section}>
      <TabTitle title="In stock today" />
      <View style={styles.grid}>
        {counts.map((c) => (
          <View key={c.color} style={styles.stockTile}>
            <Swatch name={c.color} />
            <Text variant="cardTitle">{c.color}</Text>
            <StockLine state={c.state} quantity={c.quantity} />
            {c.quantity != null && c.state === "in_stock" ? (
              <Text variant="label" tone="muted">
                {c.quantity} in stock
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </Reveal>
  )
}

const EPISODE_IMAGES = ["rope-brim.jpg", "rope-cap-tour-white-3.jpg", "rope-brim.jpg", "rope-cap-pine-3.jpg"]

/** From The Crown Test: the active series' episodes; captions rise in (M29). */
function CrownTest() {
  const series = useContentSeries()
  const s = series.data?.find((x) => x.handle === "crown-test") ?? series.data?.[0]
  const [played, setPlayed] = useState(false)
  if (!s || !s.episodes.length) return null
  return (
    <Reveal style={styles.section} onReveal={() => setPlayed(true)}>
      <TabTitle title={`From ${s.title}`} />
      <FlatList
        data={s.episodes}
        horizontal
        keyExtractor={(e) => e.asset_key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10, gap: 10 }}
        renderItem={({ item, index }) => (
          <Pressable
            accessibilityRole="link"
            onPress={() => {
              trackTap("story_episode", { asset: item.asset_key })
              openWeb(`/stories/${s.handle}`)
            }}
            style={styles.episode}>
            <Image source={hatImage(EPISODE_IMAGES[index % EPISODE_IMAGES.length])} style={styles.episodeImage} contentFit={index % 2 ? "contain" : "cover"} />
            <Caption played={played}>
              <Text variant="eyebrow" tone="muted">
                Episode {index + 1} · {s.channel === "tiktok" ? "TikTok" : (s.channel ?? "Video")}
              </Text>
              <Text variant="cardTitle" numberOfLines={2}>
                {item.title}
              </Text>
              {item.subject ? (
                <Text variant="caption" tone="charcoal" numberOfLines={2}>
                  {item.subject}
                </Text>
              ) : null}
            </Caption>
          </Pressable>
        )}
      />
    </Reveal>
  )
}

function Caption({ played, children }: { played: boolean; children: React.ReactNode }) {
  const reduce = useReducedMotion()
  const p = useSharedValue(reduce ? 1 : 0)
  useEffect(() => {
    if (!played) return
    p.value = withDelay(400, withTiming(1, { duration: 800, easing: ease.power3Out, reduceMotion: motion.reduceMotion }))
  }, [p, played])
  const style = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: 20 * (1 - p.value) }] }))
  return <Animated.View style={[styles.caption, style]}>{children}</Animated.View>
}

function Stories() {
  const rows = [
    { key: "crown", title: "The Crown Test", excerpt: "A ruler on the crown of a tall rope cap and on ours.", image: "rope-brim.jpg", path: "/stories/crown-test", label: "home_story" },
    { key: "fit", title: "Fit Guide", excerpt: "One size. The strap fits 21.5–23.75 in.", image: "rope-cap-tour-white-3.jpg", path: "/fit-guide", label: "fit_guide" },
  ]
  return (
    <Reveal style={styles.section}>
      <Text variant="section" style={styles.centerText}>
        Stories
      </Text>
      <View style={styles.storyRow}>
        {rows.map((r) => (
          <Pressable
            key={r.key}
            accessibilityRole="link"
            style={styles.story}
            onPress={() => {
              trackTap(r.label)
              openWeb(r.path)
            }}>
            <Image source={hatImage(r.image)} style={styles.storyImage} contentFit={r.key === "fit" ? "contain" : "cover"} />
            <Text variant="body" style={styles.storyTitle}>
              {r.title}
            </Text>
            <Text variant="meta" tone="muted" numberOfLines={2}>
              {r.excerpt}
            </Text>
          </Pressable>
        ))}
      </View>
    </Reveal>
  )
}

/** The dark footer card: the tee sheet for the next hole, plus links. */
function FooterCard({ hole }: { hole: ReturnType<typeof useHoles>["next"] }) {
  return (
    <View style={styles.footer}>
      {hole?.release ? (
        <TeeSheet releaseId={hole.release.id} hole={hole.number} name={hole.name} inverse />
      ) : (
        <Text variant="eyebrow" tone="inverse">
          Shelby makes one rope cap, properly.
        </Text>
      )}
      <View style={styles.footerLinks}>
        <Button title="Custom orders" variant="link" inverse onPress={() => (trackTap("footer_custom"), router.push("/custom"))} />
        <Button title="Fit guide" variant="link" inverse onPress={() => openWeb("/fit-guide")} />
        <Button title="Shipping & returns" variant="link" inverse onPress={() => openWeb("/help/shipping-returns")} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexStretch: { alignSelf: "stretch" },
  skeleton: { height: 320, marginHorizontal: 10, marginVertical: 20, borderRadius: radius.tile },
  hero: { marginHorizontal: 10, borderRadius: radius.tile, overflow: "hidden", justifyContent: "flex-end" },
  heroCopy: { padding: 20, paddingTop: 80, gap: 10 },
  heroButtons: { flexDirection: "row", gap: 8, marginTop: 6 },
  section: { marginTop: 40, gap: 16 },
  tabTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 20, gap: 12 },
  tabUnderline: { height: 2, backgroundColor: golf.green, marginTop: 2 },
  colorTile: { overflow: "hidden", alignItems: "center" },
  disc: { position: "absolute", top: "10%", backgroundColor: colors.white, overflow: "hidden" },
  discImage: { width: "86%", height: "86%", margin: "7%" },
  tileText: { position: "absolute", bottom: 24, left: 20, right: 20, alignItems: "center", gap: 12 },
  promo: { borderRadius: radius.xxxl, padding: 20, alignItems: "center", justifyContent: "flex-end", gap: 10, overflow: "hidden" },
  promoArt: {
    position: "absolute",
    top: "8%",
    width: "64%",
    aspectRatio: 1,
    borderRadius: radius.xxxl,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 10 },
  stockTile: {
    width: "48.5%",
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    padding: 20,
    gap: 8,
    alignItems: "flex-start",
  },
  episode: { width: 233, gap: 8 },
  episodeImage: { width: 233, aspectRatio: 0.8, borderRadius: radius.xxl, backgroundColor: colors.white },
  caption: { gap: 4 },
  centerText: { textAlign: "center" },
  storyRow: { flexDirection: "row", gap: 10, paddingHorizontal: 10 },
  story: { flex: 1, gap: 6 },
  storyImage: { width: "100%", aspectRatio: 1.25, borderRadius: radius.xxl, backgroundColor: colors.white },
  storyTitle: { fontSize: 18, lineHeight: 28 },
  tiles: { gap: 10, marginHorizontal: 10, marginTop: 40 },
  footer: { backgroundColor: colors.black, borderRadius: radius.xxl, margin: 10, marginTop: 20, padding: 24, gap: 20 },
  footerLinks: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
})
