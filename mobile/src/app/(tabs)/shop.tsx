import { Image } from "expo-image"
import { router, useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native"

import { BundleThumb } from "@/components/bundle-rows"
import { Button } from "@/components/button"
import { ColourwayCard, EditionCard } from "@/components/product-card"
import { Screen } from "@/components/screen"
import { SegmentedControl } from "@/components/segmented-control"
import { ErrorState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { Veil } from "@/components/veil"
import { colors, CORE_COLOURWAYS, golf, radius } from "@/constants/theme"
import { useHoles } from "@/hooks/use-holes"
import { useCatalog } from "@/hooks/use-products"
import { trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { Reveal } from "@/lib/motion"
import { capsIn, hatImage, offersFor, productPrice } from "@/lib/product"

type Group = "all" | "core" | "limited" | "bundles"

const GROUPS: { value: Group; label: string }[] = [
  { value: "all", label: "All" },
  { value: "core", label: "Core" },
  { value: "limited", label: "Limited" },
  { value: "bundles", label: "Bundles" },
]

/**
 * Shop (APP_SPEC G.5): the Rope Cap collection. A colourway card per core
 * colour, then the editions, then the Bundles band (this screen's golf-green
 * band). No filter sheet: one size, and colours are the cards.
 */
export default function ShopScreen() {
  const params = useLocalSearchParams<{ group?: string }>()
  const [group, setGroup] = useState<Group>((GROUPS.find((g) => g.value === params.group)?.value as Group) ?? "all")
  const catalog = useCatalog()
  const { holes } = useHoles()
  const { width } = useWindowDimensions()
  const core = catalog.data?.find((p) => p.handle === "rope-cap")
  const offers = offersFor(catalog.data ?? [], "rope-cap")
  const editions = holes.filter((h) => h.number >= 2 && h.colourway && (h.status === "live" || h.status === "upcoming" || h.status === "sold_out"))
  const cardW = (Math.min(width, 720) - 30) / 2
  const show = (g: Group) => group === "all" || group === g
  const limitedCount = editions.length

  return (
    <Screen refreshing={catalog.isRefetching} onRefresh={() => catalog.refetch()}>
      <View style={styles.banner}>
        <Image source={hatImage("rope-lifestyle-hero-mobile.jpg")} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={{ top: "35%" }} />
        <Veil alpha={0.65} />
        <View style={styles.bannerText}>
          <Text variant="meta" tone="inverse">
            Home / The Rope Cap
          </Text>
          <Text variant="section" tone="inverse" accessibilityRole="header">
            The Rope Cap
          </Text>
          <Text variant="body" style={{ color: colors.naturalWhite }}>
            One cap, four core colors, a numbered edition each season.
          </Text>
          <Text variant="label" tone="inverse">
            {CORE_COLOURWAYS.length} core colors · {limitedCount} limited
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <SegmentedControl
          scroll
          options={GROUPS}
          value={group}
          onChange={(g) => {
            trackTap("color_pill", { group: g })
            setGroup(g)
          }}
        />
      </View>

      {catalog.isLoading ? <LoadingState /> : null}
      {catalog.error && !catalog.data ? <ErrorState error={catalog.error} onRetry={() => catalog.refetch()} /> : null}

      {core && show("core") ? (
        <View style={styles.grid}>
          {CORE_COLOURWAYS.map((c) => (
            <ColourwayCard key={c} product={core} colourway={c} style={{ width: cardW }} />
          ))}
        </View>
      ) : null}

      {show("limited") && editions.length ? (
        <View style={[styles.grid, { marginTop: 10 }]}>
          {editions.map((h) => (
            <EditionCard key={h.number} hole={h} style={{ width: cardW }} />
          ))}
        </View>
      ) : null}
      {group === "limited" && !editions.length ? (
        <Text variant="body" tone="muted" style={styles.empty}>
          No numbered editions are on sale or scheduled right now. The Card has the 2027 dates.
        </Text>
      ) : null}

      {show("bundles") && offers.length ? (
        <Reveal style={styles.band}>
          <Text variant="section" tone="inverse">
            Two or four
          </Text>
          {offers.map((o) => {
            const caps = capsIn(o)
            const pr = productPrice(o)
            const four = caps >= 4
            const go = () => {
              trackTap(four ? "home_foursome" : "home_pair", { page_type: "collection" })
              router.push(`/offer/${o.handle}` as never)
            }
            return (
              <Pressable key={o.id} accessibilityRole="link" onPress={go} style={styles.bundleCard}>
                <BundleThumb caps={caps} size={96} />
                <View style={styles.flex}>
                  <Text variant="kicker">{four ? "The Foursome" : "The Pair"}</Text>
                  {pr ? (
                    <Text variant="label">
                      {formatMoney(pr.amount, pr.currency)} · {formatMoney(pr.amount / caps)} a cap
                    </Text>
                  ) : null}
                  <Button title={four ? "Shop the Foursome" : "Shop the Pair"} size="small" onPress={go} style={styles.bundleBtn} />
                </View>
              </Pressable>
            )
          })}
        </Reveal>
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 6 },
  banner: { marginHorizontal: 10, aspectRatio: 1, borderRadius: radius.xxl, overflow: "hidden", justifyContent: "flex-end" },
  bannerText: { padding: 20, gap: 6 },
  controls: { paddingHorizontal: 10, marginVertical: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 10 },
  empty: { paddingHorizontal: 20, paddingVertical: 24 },
  band: {
    backgroundColor: golf.green,
    marginHorizontal: 10,
    marginVertical: 40,
    borderRadius: radius.xxxl,
    padding: 20,
    gap: 12,
  },
  bundleCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  bundleBtn: { alignSelf: "flex-start", marginTop: 4 },
})
