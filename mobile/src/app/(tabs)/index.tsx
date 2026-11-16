import { Image } from "expo-image"
import { router } from "expo-router"
import { useState, type ReactNode } from "react"
import { FlatList, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg"

import { Button } from "@/components/button"
import { Countdown } from "@/components/countdown"
import { FooterBand } from "@/components/footer-band"
import { TeeSheet } from "@/components/notify-me"
import { ColourwayCard, EditionCard, KitCard } from "@/components/product-card"
import { Screen } from "@/components/screen"
import { SegmentedControl } from "@/components/segmented-control"
import { ErrorState, Skeleton } from "@/components/state-views"
import { Text } from "@/components/text"
import { Tile } from "@/components/tile"
import { colors, CORE_COLOURWAYS, colourwaySlug, layout } from "@/constants/theme"
import { holeDay, useHoles, type Hole } from "@/hooks/use-holes"
import { useCatalog, useContentSeries } from "@/hooks/use-products"
import { trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { pad2 } from "@/lib/holes"
import { openWeb } from "@/lib/links"
import { capsIn, hatImage, offersFor, productPrice, type Product } from "@/lib/product"

const CARD = 164
const GAP = layout.gap
const SHORT: Record<string, string> = { "Tour White": "White", "Clubhouse Navy": "Navy", Pine: "Pine", Fescue: "Fescue" }
type Rail = "core" | "holes" | "kits"

const openColour = (c: string) => {
  trackTap("shop_by_color", { color: c })
  router.push({ pathname: "/products/[handle]", params: { handle: "rope-cap", color: c } })
}
const openCard = () => {
  trackTap("home_scorecard")
  router.push("/card")
}

/**
 * Home (APP_SPEC v8 V8.5 §1), Eastside's mobile home in one scroll: the
 * announcement and sticky header, the colour strip, the full-bleed hero, the
 * Rope Cap rail, Shop by color, The Card, the crown story, the quiz splash and
 * the black footer band. Behaviour and tap labels are the v6/v7 Home's.
 */
export default function HomeScreen() {
  const catalog = useCatalog()
  const { next, holes } = useHoles()
  const series = useContentSeries()
  const core = catalog.data?.find((p) => p.handle === "rope-cap")
  const offers = offersFor(catalog.data ?? [], "rope-cap")
    .slice()
    .sort((a, b) => capsIn(a) - capsIn(b))
  const pair = offers.find((o) => capsIn(o) === 2) ?? null
  const story = series.data?.find((x) => x.handle === "crown-test") ?? series.data?.[0] ?? null
  const upcoming = next ?? holes.find((h) => h.status === "upcoming") ?? null

  return (
    <Screen ticker refreshing={catalog.isRefetching} onRefresh={() => catalog.refetch()}>
      <ColourStrip holes={holes} pair={pair} />
      <Hero pair={pair} />
      {catalog.error && !catalog.data ? <ErrorState error={catalog.error} onRetry={() => catalog.refetch()} /> : null}
      {core ? <RopeCapRail core={core} holes={holes} offers={offers} /> : <Skeleton style={styles.skeleton} />}
      <ShopByColor next={upcoming} />
      <CardRail holes={holes} next={next} />
      {story ? <CrownStory stance={story.stance ?? ""} handle={story.handle} /> : null}
      <QuizSplash />
      <FooterBand hole={upcoming} />
    </Screen>
  )
}

/** The #EEE9E3 strip of 79pt squares under the header (Eastside's category strip). */
function ColourStrip({ holes, pair }: { holes: Hole[]; pair: Product | null }) {
  const holeImage = holes.find((h) => h.number > 1 && h.image)?.image ?? null
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.strip} contentContainerStyle={styles.stripRow}>
      {CORE_COLOURWAYS.map((c) => (
        <StripTile key={c} label={SHORT[c] ?? c} onPress={() => openColour(c)} a11y={`Shop ${c}`}>
          <Tile source={hatImage(`rope-cap-${colourwaySlug(c)}-1.jpg`)} aspectRatio={1} inset={0.04} />
        </StripTile>
      ))}
      <StripTile label="Holes" onPress={openCard} a11y="The Card, six numbered holes">
        <Tile source={holeImage} aspectRatio={1} inset={0.04} />
      </StripTile>
      {pair ? (
        <StripTile
          label="Pair"
          a11y="The Pair"
          onPress={() => {
            trackTap("home_pair")
            router.push(`/offer/${pair.handle}` as never)
          }}>
          <View style={styles.pairSquare}>
            {["Clubhouse Navy", "Pine"].map((c) => (
              <View key={c} style={styles.half}>
                <Tile source={hatImage(`rope-cap-${colourwaySlug(c)}-1.jpg`)} aspectRatio={1} inset={0} />
              </View>
            ))}
          </View>
        </StripTile>
      ) : null}
    </ScrollView>
  )
}

function StripTile({ label, onPress, a11y, children }: { label: string; onPress: () => void; a11y: string; children: ReactNode }) {
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={a11y} onPress={onPress} style={styles.stripTile}>
      {({ pressed }) => (
        <>
          <View style={[styles.stripSquare, pressed && { opacity: 0.8 }]}>{children}</View>
          <Text variant="stripLabel" numberOfLines={1} style={[styles.stripLabel, pressed && { color: colors.linkPressed }]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  )
}

/** The 650pt hero: the lifestyle photo with the copy bottom-right on a soft radial shade. */
function Hero({ pair }: { pair: Product | null }) {
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const h = Math.min(650, height - layout.tabBar - insets.bottom)
  const pairPrice = pair ? productPrice(pair) : null
  return (
    <View style={[styles.hero, { height: h }]}>
      <Image
        source={hatImage("rope-lifestyle-hero-mobile.jpg")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        accessibilityLabel="A golfer in the Rope Cap on the first tee"
        accessible
      />
      <View style={styles.heroCopy}>
        <Svg style={styles.heroShade} pointerEvents="none">
          <Defs>
            <RadialGradient id="heroShade" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0" stopColor="#000" stopOpacity={0.2} />
              <Stop offset="0.7" stopColor="#000" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#heroShade)" />
        </Svg>
        <Text variant="displayHero" tone="inverse" style={styles.right} accessibilityRole="header">
          The Rope Cap
        </Text>
        <Text variant="bodyEastside" tone="inverse" style={styles.right}>
          A mid-crown six-panel with a rope on the brim. One size, four colors, six numbered holes.
        </Text>
        <Button
          title="Shop the Rope Cap"
          variant="outlineWhite"
          onPress={() => {
            trackTap("core_product")
            router.push({ pathname: "/products/[handle]", params: { handle: "rope-cap" } })
          }}
        />
        {pair && pairPrice ? (
          <Button
            title={`The Pair is ${formatMoney(pairPrice.amount, pairPrice.currency).replace(/\.00$/, "")}`}
            variant="link"
            inverse
            style={styles.alignEnd}
            onPress={() => {
              trackTap("hero_shop_pair")
              router.push(`/offer/${pair.handle}` as never)
            }}
          />
        ) : null}
      </View>
    </View>
  )
}

/** "The Rope Cap": tabs over one horizontal rail of 164pt cards that snaps card to card. */
function RopeCapRail({ core, holes, offers }: { core: Product; holes: Hole[]; offers: Product[] }) {
  const [rail, setRail] = useState<Rail>("core")
  const items: { key: string; node: ReactNode }[] =
    rail === "core"
      ? CORE_COLOURWAYS.map((c) => ({ key: c, node: <ColourwayCard product={core} colourway={c} source="app_home" /> }))
      : rail === "holes"
        ? holes.filter((h) => h.number > 1).map((h) => ({ key: `h${h.number}`, node: <EditionCard hole={h} trackAs="card_hole" /> }))
        : offers.map((o) => ({ key: o.id, node: <KitCard offer={o} /> }))
  return (
    <View style={styles.section}>
      <Text variant="displayLg" style={styles.sectionTitle} accessibilityRole="header">
        The Rope Cap
      </Text>
      <View style={styles.tabs}>
        <SegmentedControl<Rail>
          options={[
            { value: "core", label: "Core colors" },
            { value: "holes", label: "Numbered holes" },
            { value: "kits", label: "Kits" },
          ]}
          value={rail}
          onChange={setRail}
        />
      </View>
      <CardList items={items} />
    </View>
  )
}

function CardList({ items }: { items: { key: string; node: ReactNode }[] }) {
  return (
    <FlatList
      horizontal
      data={items}
      keyExtractor={(i) => i.key}
      renderItem={({ item }) => <View style={styles.card}>{item.node}</View>}
      ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD + GAP}
      decelerationRate="fast"
      contentContainerStyle={styles.railPad}
    />
  )
}

/** The #F6F6F6 band of 5:7 colour tiles (179×251) with a label row, ending on The Card. */
function ShopByColor({ next }: { next: Hole | null }) {
  return (
    <View style={styles.band}>
      <Text variant="displayMd" style={styles.sectionTitle} accessibilityRole="header">
        Shop by color
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={179 + GAP} decelerationRate="fast" contentContainerStyle={styles.railRow}>
        {CORE_COLOURWAYS.map((c) => (
          <ColorTile key={c} label={c} onPress={() => openColour(c)} source={hatImage(`rope-cap-${colourwaySlug(c)}-2.jpg`)} />
        ))}
        <ColorTile label="The Card" onPress={openCard} source={next?.image ?? null} numeral={next ? pad2(next.number) : null} />
      </ScrollView>
    </View>
  )
}

function ColorTile({ label, onPress, source, numeral = null }: { label: string; onPress: () => void; source: string | null; numeral?: string | null }) {
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={label} onPress={onPress} style={styles.colorTile}>
      {({ pressed }) => (
        <>
          <View>
            <Tile source={source} aspectRatio={5 / 7} style={styles.whiteTile} inset={0.08} />
            {!source && numeral ? (
              <View style={[StyleSheet.absoluteFill, styles.centre]}>
                <Text variant="holeNumeral">{numeral}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.colorLabel}>
            <Text variant="stripLabel" numberOfLines={1} style={pressed && { color: colors.linkPressed }}>
              {label}
            </Text>
          </View>
        </>
      )}
    </Pressable>
  )
}

/** The Card: the six holes as edition cards, then the next hole's countdown and tee sheet. */
function CardRail({ holes, next }: { holes: Hole[]; next: Hole | null }) {
  return (
    <View style={styles.section}>
      <View style={styles.headRow}>
        <Text variant="displayMd" accessibilityRole="header">
          The Card
        </Text>
        <Button title="See all six holes" variant="link" onPress={openCard} />
      </View>
      <CardList items={holes.map((h) => ({ key: `c${h.number}`, node: <EditionCard hole={h} trackAs="card_hole" /> }))} />
      {next?.release && next.releaseAt ? (
        <View style={styles.next}>
          <Text variant="eyebrowSm">Next · Hole {pad2(next.number)}</Text>
          <Text variant="titleCard">
            {next.name}: {holeDay(next.releaseAt)}
          </Text>
          <Countdown target={next.releaseAt} small />
          <TeeSheet releaseId={next.release.id} hole={next.number} name={next.name} showEyebrow={false} />
        </View>
      ) : null}
    </View>
  )
}

/** The crown story: a square photo, then the stance on #F6F6F6. */
function CrownStory({ stance, handle }: { stance: string; handle: string }) {
  const { width } = useWindowDimensions()
  const side = Math.min(width, 720)
  return (
    <View>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="The crown test"
        onPress={() => {
          trackTap("home_story")
          openWeb(`/stories/${handle}`)
        }}>
        <Image
          source={hatImage("story-crush.jpg")}
          style={{ width: side, height: side, alignSelf: "center" }}
          contentFit="cover"
          accessibilityLabel="A cap folded into a back pocket"
          accessible
        />
      </Pressable>
      <View style={styles.storyText}>
        <Text variant="displayXl" accessibilityRole="header">
          Sits right the first time.
        </Text>
        {stance ? <Text variant="bodyEditorial">{stance}</Text> : null}
        <View style={styles.storyActions}>
          <Button
            title="See the crown test"
            variant="black"
            size="small"
            onPress={() => {
              trackTap("series_story")
              openWeb(`/stories/${handle}`)
            }}
          />
          <Button
            title="Six reasons"
            variant="link"
            onPress={() => {
              trackTap("home_reasons")
              openWeb("/reasons/rope-cap")
            }}
          />
        </View>
      </View>
    </View>
  )
}

/** The quiz splash: a 403pt clubhouse photo with centred white copy. */
function QuizSplash() {
  return (
    <View style={styles.splash}>
      <Image source={hatImage("rope-clubhouse.jpg")} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="The clubhouse at dusk" accessible />
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id="splashShade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000" stopOpacity={0.05} />
            <Stop offset="0.45" stopColor="#000" stopOpacity={0.15} />
            <Stop offset="1" stopColor="#000" stopOpacity={0.65} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#splashShade)" />
      </Svg>
      <View style={styles.splashCopy}>
        <Text variant="displaySplash" tone="inverse" style={styles.centreText} accessibilityRole="header">
          Find your color
        </Text>
        <Text variant="bodySplash" tone="inverse" style={styles.centreText}>
          Four questions about your bag, your course and your shirts. One color at the end.
        </Text>
        <Button
          title="Take the Quiz"
          variant="white"
          size="small"
          onPress={() => {
            trackTap("home_quiz")
            openWeb("/quiz")
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: { height: 360, marginHorizontal: layout.railEdge, marginTop: 40 },
  strip: { backgroundColor: colors.sand, flexGrow: 0 },
  stripRow: { paddingTop: 19, paddingBottom: 9, paddingHorizontal: 14, gap: GAP },
  stripTile: { width: 79, alignItems: "center" },
  stripSquare: { width: 79, height: 79, backgroundColor: colors.tile, overflow: "hidden" },
  stripLabel: { marginTop: 7 },
  pairSquare: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: colors.tile },
  half: { width: "50%" },
  hero: { width: "100%", backgroundColor: colors.tile, overflow: "hidden" },
  heroCopy: { position: "absolute", right: 16, bottom: 16, width: 220, alignItems: "flex-end", gap: 10 },
  heroShade: { position: "absolute", left: -80, right: -40, top: -70, bottom: -40 },
  right: { textAlign: "right" },
  alignEnd: { alignSelf: "flex-end" },
  section: { paddingTop: 40, paddingBottom: 40 },
  sectionTitle: { paddingHorizontal: layout.railEdge, marginBottom: 16 },
  tabs: { marginBottom: 24 },
  railPad: { paddingHorizontal: layout.railEdge },
  card: { width: CARD },
  band: { backgroundColor: colors.tile, paddingVertical: 40 },
  railRow: { paddingHorizontal: layout.railEdge, gap: GAP },
  colorTile: { width: 179 },
  whiteTile: { backgroundColor: colors.white },
  colorLabel: { height: 27, justifyContent: "flex-end" },
  centre: { alignItems: "center", justifyContent: "center" },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.railEdge,
    marginBottom: 16,
  },
  next: { paddingHorizontal: layout.edge, paddingTop: 24, gap: 8 },
  storyText: { backgroundColor: colors.tile, padding: 24, gap: 14 },
  storyActions: { flexDirection: "row", alignItems: "center", gap: 20, flexWrap: "wrap" },
  splash: { height: 403, overflow: "hidden", justifyContent: "flex-end" },
  splashCopy: { alignItems: "center", paddingHorizontal: 32, paddingBottom: 36, gap: 12 },
  centreText: { textAlign: "center" },
})
