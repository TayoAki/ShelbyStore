import { Image } from "expo-image"
import { router } from "expo-router"
import { useState } from "react"
import { FlatList, Platform, Pressable, StyleSheet, useWindowDimensions, View } from "react-native"

import { AnnouncementBar } from "@/components/announcement-bar"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/button"
import { NotifyMe } from "@/components/notify-me"
import { productHref } from "@/components/product-card"
import { Screen } from "@/components/screen"
import { ErrorState, LoadingState } from "@/components/state-views"
import { StatusDot } from "@/components/stock-line"
import { Swatch } from "@/components/swatch"
import { Text } from "@/components/text"
import { colors, fonts, layout, MAX_CONTENT_WIDTH, radius, type } from "@/constants/theme"
import { useCatalog, useContentSeries, useShapes } from "@/hooks/use-products"
import { useReleases } from "@/hooks/use-releases"
import type { ContentSeries } from "@/lib/catalog"
import { formatDropDate, formatMoney } from "@/lib/format"
import { cutout, openWeb } from "@/lib/links"
import {
  cardImages,
  colorCounts,
  colorOptionOf,
  colorThumbs,
  hatImage,
  imageUrl,
  leadImageFor,
  productPrice,
  type Product,
} from "@/lib/product"
import { colorTile } from "@/lib/swatches"
import type { StoreRelease } from "@/lib/types"

const CONDENSE_AT = 121

/** Home (APP_SPEC §5.1): the web home at phone size, in the same order, with live data. */
export default function HomeScreen() {
  const { width: windowWidth } = useWindowDimensions()
  const W = Math.min(windowWidth, MAX_CONTENT_WIDTH)
  const [condensed, setCondensed] = useState(false)
  const catalog = useCatalog()
  const releases = useReleases()
  const shapes = useShapes()
  const series = useContentSeries()

  const core = catalog.data?.find((p) => p.handle === "everyday-cap") ?? catalog.data?.find((p) => p.collection?.handle === "core")
  const live = releases.data?.live ?? []
  const upcoming = releases.data?.upcoming ?? []
  const featured = live[0] ?? upcoming[0] ?? null

  return (
    <Screen
      edges={["top"]}
      header={
        <>
          <AnnouncementBar liveDrop={live[0]?.title} />
          <AppHeader condensed={condensed} />
        </>
      }
      onScrollY={(y) => setCondensed(y > CONDENSE_AT)}
      refreshing={catalog.isRefetching || releases.isRefetching}
      onRefresh={() => {
        catalog.refetch()
        releases.refetch()
        series.refetch()
      }}>
      {catalog.isLoading ? <LoadingState /> : null}
      {catalog.error ? <ErrorState error={catalog.error} onRetry={() => catalog.refetch()} /> : null}

      <Hero W={W} core={core} />
      <BrowseByStyle W={W} shapes={shapes.data} core={core} />
      {featured ? <DropBanner W={W} release={featured} live={featured.phase === "live"} /> : null}
      <FindYourFit />
      {core ? <ShopByColor core={core} /> : null}
      {core ? <InStockToday core={core} /> : null}
      {series.data?.[0] ? <CrushTest series={series.data[0]} /> : null}
      <AboutShelby W={W} />
      <Stories series={series.data?.[0] ?? null} />
      {upcoming[0] ? <JoinTheList release={upcoming[0]} /> : null}
    </Screen>
  )
}

/** 1. Hero: live text over the lifestyle photo, product and price in the first screen. */
function Hero({ W, core }: { W: number; core?: Product }) {
  const price = core ? productPrice(core) : null
  const colorsCount = core ? colorOptionOf(core)?.values.length ?? 0 : 0
  return (
    <View style={{ width: W, height: (521 * W) / 390 }}>
      <Image
        source={hatImage("lifestyle-hero-mobile.jpg")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition={{ top: "70%" }}
        priority="high"
        accessibilityLabel="A man in the Everyday Cap on a coastal road"
      />
      <View style={styles.heroText}>
        <Text style={type.hero} accessibilityRole="header">
          {"ONE CAP.\nEVERY COLOR.\nALWAYS IN STOCK."}
        </Text>
        {core && price ? (
          <Text variant="bodySm" style={styles.heroLine}>
            {core.title} · {formatMoney(price.amount, price.currency)} · {colorsCount} colors
          </Text>
        ) : null}
        <Button
          title="Shop now"
          variant="light"
          size="hero"
          onPress={() => router.push(productHref(core?.handle ?? "everyday-cap") as never)}
          style={styles.heroButton}
        />
      </View>
    </View>
  )
}

/** 2. Browse By Style: a 2-column grid of shape tiles plus SHOP ALL. */
function BrowseByStyle({
  W,
  shapes,
  core,
}: {
  W: number
  shapes: { name: string; handle: string; products: Product[] }[]
  core?: Product
}) {
  const tile = (W - 16) / 2
  const height = (tile * 207) / 187
  const allImage = core ? leadImageFor(core, colorThumbs(core)[1]?.color ?? colorThumbs(core)[0]?.color ?? "") : null
  const tiles = [
    ...shapes.map((s) => ({ key: s.handle, label: s.name, image: cardImages(s.products[0])[0] ?? null, href: `/shop?shape=${s.handle}` })),
    { key: "all", label: "Shop All", image: allImage, href: "/shop" },
  ]
  if (!shapes.length) return null
  return (
    <View>
      <Text style={[type.section, styles.sectionHeading, { marginLeft: 21 }]}>Browse By Style</Text>
      <View style={styles.tileGrid}>
        {tiles.map((t) => (
          <Pressable
            key={t.key}
            accessibilityRole="link"
            accessibilityLabel={t.label}
            onPress={() => router.push(t.href as never)}
            style={[styles.styleTile, { width: tile, height }]}>
            {/* The blend sits on the wrapper so it multiplies against the tile (RN-web
                gives every View its own stacking context). */}
            <View style={[styles.cutoutBox, { width: tile - 42, height: tile - 42 }, cutout]}>
              {t.image ? <Image source={t.image} style={{ width: tile - 42, height: tile - 42 }} contentFit="contain" /> : null}
            </View>
            <Text style={styles.tileLabel}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

/** A lifestyle image for the drop banner; product shots on white fall back to the corduroy lifestyle. */
function bannerImage(release: StoreRelease): string {
  const src = imageUrl(release.hero_image)
  return src && /lifestyle|story/.test(src) ? src : hatImage("lifestyle-corduroy.jpg")
}

/** 3. Drop banner: the live (or next) release over a lifestyle photo. */
function DropBanner({ W, release, live }: { W: number; release: StoreRelease; live: boolean }) {
  return (
    <View style={{ width: W, height: (520 * W) / 390 }}>
      <Image source={bannerImage(release)} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={{ top: "35%" }} />
      <View style={styles.scrim} />
      <View style={styles.bannerText}>
        <Text style={styles.bannerEyebrow}>
          {live ? "Limited release · Live now" : `Next drop · ${formatDropDate(release.release_at)}`}
        </Text>
        <Text style={[type.campaign, styles.white, styles.center]}>{release.title}</Text>
        <Button
          title={live ? "Shop the drop" : "Get notified"}
          variant="highlight"
          onPress={() => router.push(`/drops/${release.handle}` as never)}
          style={styles.bannerButton}
        />
      </View>
    </View>
  )
}

/** 4. Find Your Fit: the quiz lives on the web. */
function FindYourFit() {
  return (
    <View style={styles.fit}>
      <Image source={hatImage("everyday-cap-black-3.jpg")} style={[styles.fitImage, cutout]} contentFit="contain" />
      <Text style={[type.promo, styles.center]}>Find Your Fit</Text>
      <Text variant="bodySm" style={[styles.center, styles.fitCopy]}>
        Four questions about how you wear a hat. We&apos;ll match you to one style, a color that&apos;s in stock and, for
        sized hats, a size.
      </Text>
      <Button title="Take the quiz" variant="light" onPress={() => openWeb("/quiz")} style={styles.fitButton} />
    </View>
  )
}

/** 5. Shop By Color: the core cap's colours on tonal tiles. */
function ShopByColor({ core }: { core: Product }) {
  const thumbs = colorThumbs(core)
  return (
    <View>
      <Text style={[type.section, styles.sectionHeading, { marginLeft: 28 }]}>Shop By Color</Text>
      <FlatList
        data={thumbs}
        keyExtractor={(t) => t.color}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={347}
        decelerationRate="fast"
        contentContainerStyle={styles.colorRow}
        renderItem={({ item }) => {
          const tile = colorTile(item.color)
          return (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`${core.title} in ${item.color}`}
              onPress={() => router.push(productHref(core.handle ?? core.id, { color: item.color }) as never)}
              style={[styles.colorTile, { backgroundColor: tile.background }]}>
              <Text style={[styles.colorLabel, { color: tile.label }]}>{item.color}</Text>
              {item.image ? (
                <View style={[styles.colorPhotoWrap, cutout]}>
                  <Image source={item.image} style={styles.colorPhoto} contentFit="contain" />
                </View>
              ) : null}
            </Pressable>
          )
        }}
      />
    </View>
  )
}

/** 6. In Stock Today: live sellable counts for the core cap. */
function InStockToday({ core }: { core: Product }) {
  const counts = colorCounts(core)
  return (
    <View style={styles.stockBand}>
      <Text style={styles.stockTitle}>In Stock Today</Text>
      <Text variant="micro" tone="muted" style={styles.center}>
        Live sellable stock for the Everyday Cap. Updated every visit.
      </Text>
      <View style={styles.stockGrid}>
        {counts.map((c) => (
          <Pressable
            key={c.color}
            accessibilityRole="link"
            onPress={() => router.push(productHref(core.handle ?? core.id, { color: c.color }) as never)}
            style={styles.stockItem}>
            <Swatch name={c.color} />
            <Text style={styles.stockColor}>{c.color}</Text>
            <View style={styles.stockLine}>
              <StatusDot state={c.state} />
              <Text variant="bodySm">
                {c.state === "sold_out"
                  ? "Restocking"
                  : c.state === "low"
                    ? `Only ${c.quantity} left`
                    : c.quantity === null
                      ? "In stock"
                      : `${c.quantity} in stock`}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const EPISODE_IMAGES = ["story-crush.jpg", "everyday-cap-black-3.jpg", "story-crush.jpg", "everyday-cap-bone-1.jpg"]

/** 7. From The Crush Test: the content series' published episodes. */
function CrushTest({ series }: { series: ContentSeries }) {
  const episodes = [...series.episodes]
    .map((e) => ({ ...e, n: Number(/(\d+)$/.exec(e.asset_key)?.[1] ?? 0) }))
    .sort((a, b) => a.n - b.n)
  if (!episodes.length) return null
  return (
    <View style={styles.series}>
      <Text style={[type.section, styles.sectionHeading, { marginLeft: 16 }]}>From {series.title}</Text>
      <FlatList
        data={episodes}
        keyExtractor={(e) => e.asset_key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.seriesRow}
        renderItem={({ item, index }) => {
          const file = EPISODE_IMAGES[index % EPISODE_IMAGES.length]
          const photo = file.startsWith("story")
          return (
            <View style={styles.episode}>
              <Text style={type.subline} numberOfLines={2}>
                {item.title}
              </Text>
              <Text variant="micro" tone="muted" style={styles.episodeMeta}>
                Episode {item.n} · TikTok
              </Text>
              <Image
                source={hatImage(file)}
                style={styles.episodeImage}
                contentFit={photo ? "cover" : "contain"}
              />
              {item.subject ? (
                <Text variant="bodySm" numberOfLines={3} style={styles.episodeSubject}>
                  {item.subject}
                </Text>
              ) : null}
              <Button title="See the test" variant="link" onPress={() => openWeb(`/stories/${series.handle}`)} />
            </View>
          )
        }}
      />
    </View>
  )
}

/** 8. About Shelby. */
function AboutShelby({ W }: { W: number }) {
  return (
    <View style={{ width: W, height: (521 * W) / 390 }}>
      <Image source={hatImage("lifestyle-bucket.jpg")} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={styles.aboutScrim} />
      <View style={styles.aboutText}>
        <Text style={styles.aboutTitle}>About Shelby</Text>
        <Text style={[type.body, styles.white]}>
          We make one cap we never let run out, and a few small drops a year. We show you the stock count, and we fold
          every cap into a back pocket before we sign it off.
        </Text>
        <Button
          title="Why the Everyday Cap"
          variant="highlight"
          onPress={() => openWeb("/reasons/everyday-cap")}
          style={styles.aboutButton}
        />
      </View>
    </View>
  )
}

/** 9. Stories: the crush-test story and the fit guide (web pages). */
function Stories({ series }: { series: ContentSeries | null }) {
  const posts = [
    ...(series
      ? [
          {
            key: "story",
            meta: `Story | ${series.title}`,
            title: series.title,
            excerpt: series.stance ?? "",
            image: "story-crush.jpg",
            contain: false,
            path: `/stories/${series.handle}`,
          },
        ]
      : []),
    {
      key: "fit",
      meta: "Guide | Fit",
      title: "Fit Guide",
      excerpt: "Crown height, structure and the one-size range, hat by hat.",
      image: "everyday-cap-black-3.jpg",
      contain: true,
      path: "/fit-guide",
    },
  ]
  return (
    <View style={styles.stories}>
      <Text style={[type.section, styles.sectionHeading, { marginLeft: 28 }]}>Stories</Text>
      {posts.map((p) => (
        <Pressable key={p.key} accessibilityRole="link" onPress={() => openWeb(p.path)} style={styles.storyRow}>
          <View style={[styles.storyImageWrap, p.contain && { backgroundColor: colors.tile }]}>
            <Image source={hatImage(p.image)} style={[styles.storyImage, p.contain && cutout]} contentFit={p.contain ? "contain" : "cover"} />
          </View>
          <View style={styles.storyText}>
            <Text variant="eyebrow" tone="muted" numberOfLines={1}>
              {p.meta}
            </Text>
            <Text style={type.item} numberOfLines={1}>
              {p.title}
            </Text>
            <Text variant="bodySm" numberOfLines={2}>
              {p.excerpt}
            </Text>
            <Button title="Read more" variant="light" onPress={() => openWeb(p.path)} style={styles.readMore} />
          </View>
        </Pressable>
      ))}
    </View>
  )
}

/** 11. Join The Shelby List: drop alerts for the next upcoming release. */
function JoinTheList({ release }: { release: StoreRelease }) {
  return (
    <View style={styles.join}>
      <Text style={[type.section, styles.upper, styles.center]}>Join The Shelby List</Text>
      <Text style={[type.body, styles.center, styles.joinCopy]}>Get an email the moment a drop goes live. Nothing else.</Text>
      <NotifyMe releaseId={release.id} buttonLabel="Sign up" />
    </View>
  )
}

const styles = StyleSheet.create({
  center: { textAlign: "center" },
  white: { color: colors.textInverse },
  upper: { textTransform: "uppercase" },
  sectionHeading: { marginTop: 28, marginBottom: 16, color: colors.text },
  heroText: { position: "absolute", left: 20, top: 64, right: 20 },
  heroLine: { marginTop: 16 },
  heroButton: { marginTop: 16, alignSelf: "flex-start" },
  tileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 28 },
  styleTile: { backgroundColor: colors.tile, borderRadius: radius.tile, alignItems: "center", paddingTop: 21 },
  // Native draws the white-backed photo on a white square; web multiplies it into the tile.
  cutoutBox: { backgroundColor: Platform.OS === "web" ? "transparent" : colors.secondary, borderRadius: 1 },
  tileLabel: {
    fontFamily: fonts.heading,
    fontSize: 13,
    lineHeight: 19.5,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: colors.text,
    marginTop: 12,
    textAlign: "center",
  },
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: "45%", backgroundColor: "rgba(0,0,0,0.35)" },
  bannerText: { position: "absolute", left: 16, right: 16, bottom: 32, alignItems: "center", gap: 12 },
  bannerEyebrow: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 4,
    textTransform: "uppercase",
    color: colors.textInverse,
    textAlign: "center",
  },
  bannerButton: { marginTop: 8 },
  fit: { backgroundColor: colors.tile, alignItems: "center", paddingTop: 40, paddingBottom: 32, paddingHorizontal: 24 },
  fitImage: { width: 300, height: 300, marginBottom: 16 },
  fitCopy: { marginTop: 8, maxWidth: 340 },
  fitButton: { marginTop: 24, width: 162 },
  colorRow: { paddingHorizontal: 28, gap: 14, paddingBottom: 28 },
  colorTile: { width: 333, height: 444, alignItems: "center" },
  colorLabel: {
    position: "absolute",
    top: "12%",
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 4.8,
    textTransform: "uppercase",
  },
  colorPhotoWrap: {
    position: "absolute",
    bottom: "10%",
    width: "80%",
    aspectRatio: 1,
    backgroundColor: Platform.OS === "web" ? "transparent" : colors.secondary,
  },
  colorPhoto: { width: "100%", height: "100%" },
  stockBand: { backgroundColor: colors.tile, paddingVertical: 40, paddingHorizontal: 16, alignItems: "center" },
  stockTitle: {
    fontFamily: fonts.heading,
    fontSize: 26,
    lineHeight: 39,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  stockGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", rowGap: 24, marginTop: 24, width: "100%" },
  stockItem: { width: "50%", alignItems: "center" },
  stockColor: {
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: colors.text,
    marginTop: 12,
  },
  stockLine: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  series: { paddingBottom: 28 },
  seriesRow: { paddingHorizontal: 16, gap: 16 },
  episode: { width: 233, minHeight: 466 },
  episodeMeta: { marginTop: 2, marginBottom: 12 },
  episodeImage: { width: 233, height: 233, backgroundColor: colors.secondary },
  episodeSubject: { marginTop: 12, marginBottom: 12 },
  aboutScrim: { position: "absolute", left: 0, top: 0, bottom: 0, width: "70%", backgroundColor: "rgba(0,0,0,0.45)" },
  aboutText: { position: "absolute", left: 20, right: 40, top: 0, bottom: 0, justifyContent: "center", gap: 16 },
  aboutTitle: {
    fontFamily: fonts.heading,
    fontSize: 26,
    lineHeight: 34,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.textInverse,
  },
  aboutButton: { alignSelf: "flex-start", marginTop: 8 },
  stories: { paddingBottom: 12 },
  storyRow: { flexDirection: "row", gap: 16, paddingHorizontal: 28, marginBottom: 16 },
  storyImageWrap: { width: 133, height: 133, overflow: "hidden" },
  storyImage: { width: 133, height: 133 },
  storyText: { flex: 1, gap: 4 },
  readMore: { alignSelf: "flex-start", marginTop: 8, width: 136 },
  join: { paddingVertical: layout.section, paddingHorizontal: 16, alignItems: "center", gap: 10 },
  joinCopy: { marginBottom: 22 },
})
