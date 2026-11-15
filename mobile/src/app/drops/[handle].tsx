import { Image } from "expo-image"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { useEffect } from "react"
import { StyleSheet, View } from "react-native"

import { PhaseBadge } from "@/components/badge"
import { Button } from "@/components/button"
import { Countdown } from "@/components/countdown"
import { NotifyMe } from "@/components/notify-me"
import { ProductCard, ProductGrid } from "@/components/product-card"
import { Screen } from "@/components/screen"
import { SectionHeader } from "@/components/section-header"
import { EmptyState, ErrorState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { colors, radius, spacing } from "@/constants/theme"
import { useProductsByIds } from "@/hooks/use-products"
import { useRelease } from "@/hooks/use-releases"
import { captureAttribution } from "@/lib/attribution"
import { formatReleaseDate, formatShortDate } from "@/lib/format"
import { isNotFound } from "@/lib/medusa"
import type { StoreRelease } from "@/lib/types"
import { useCart } from "@/providers/cart-provider"

export default function DropScreen() {
  const params = useLocalSearchParams<{ handle: string; asset?: string }>()
  const { data: release, isLoading, error, refetch, isRefetching } = useRelease(params.handle)
  const { syncAttribution } = useCart()
  const asset = typeof params.asset === "string" ? params.asset : undefined
  const releaseId = release?.id

  // Deep link from a campaign asset: remember which release + asset brought the shopper in.
  useEffect(() => {
    if (!releaseId || !asset) return
    captureAttribution({ release_id: releaseId, asset })
      .then(() => syncAttribution())
      .catch(() => undefined)
  }, [releaseId, asset, syncAttribution])

  const purchasable = release?.phase === "live" || release?.phase === "past"
  const products = useProductsByIds(release?.products.map((p) => p.id) ?? [], purchasable)

  if (isLoading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    )
  }
  if (error || !release) {
    return (
      <Screen>
        {isNotFound(error) || !release ? (
          <EmptyState
            title="Drop not found"
            body="It may have been rescheduled. Check the drop calendar."
            actionTitle="See all drops"
            onAction={() => router.replace("/drops")}
          />
        ) : (
          <ErrorState error={error} onRetry={() => refetch()} />
        )}
      </Screen>
    )
  }

  const hero = release.hero_image ?? release.products[0]?.thumbnail ?? undefined

  return (
    <Screen edges={["bottom"]} refreshing={isRefetching} onRefresh={() => refetch()}>
      <Stack.Screen options={{ title: release.title }} />
      <View style={styles.heroWrap}>
        <Image source={hero} style={styles.hero} contentFit="cover" transition={250} />
        <View style={styles.badge}>
          <PhaseBadge phase={release.phase} onImage />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleBlock}>
          <Text variant="eyebrow" tone="muted">
            {release.tier === "major" ? "Major drop" : "New arrival"}
          </Text>
          <Text variant="display">{release.title}</Text>
          <DropTiming release={release} />
        </View>

        {release.product_promise ? <Text variant="quote">“{release.product_promise}”</Text> : null}
        {release.story ? <Text>{release.story}</Text> : null}

        {release.proof ? (
          <View style={styles.proof}>
            <Text variant="eyebrow" tone="muted">
              What to look for
            </Text>
            <Text>{release.proof}</Text>
          </View>
        ) : null}

        {release.phase === "upcoming" ? <NotifyMe releaseId={release.id} /> : null}
      </View>

      <View style={styles.products}>
        <SectionHeader
          eyebrow={release.phase === "upcoming" ? "First look" : "In this drop"}
          title={release.phase === "upcoming" ? "What's coming" : "Shop the drop"}
        />
        {release.phase === "upcoming" ? (
          <Teaser release={release} />
        ) : products.isLoading ? (
          <LoadingState />
        ) : products.error ? (
          <ErrorState error={products.error} onRetry={() => products.refetch()} />
        ) : products.data?.length ? (
          <ProductGrid>
            {products.data.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                releaseId={release.phase === "live" ? release.id : undefined}
                label={release.phase === "live" ? "Drop" : undefined}
              />
            ))}
          </ProductGrid>
        ) : (
          <EmptyState
            title="This drop has sold through"
            body="The core is always in stock while you wait for the next one."
            actionTitle="Shop the core"
            onAction={() => router.push("/shop")}
          />
        )}
      </View>
    </Screen>
  )
}

function DropTiming({ release }: { release: StoreRelease }) {
  if (release.phase === "upcoming") {
    return (
      <View style={styles.timing}>
        <Text tone="muted">{formatReleaseDate(release.release_at)}</Text>
        {release.release_at ? <Countdown releaseAt={release.release_at} variant="heading" /> : null}
      </View>
    )
  }
  const when = formatShortDate(release.published_at ?? release.release_at)
  return (
    <Text tone={release.phase === "live" ? "accent" : "muted"} style={styles.bold}>
      {release.phase === "live" ? `Live now${when ? ` · dropped ${when}` : ""}` : `Dropped ${when}`}
    </Text>
  )
}

/** Before release day products aren't purchasable; show the line-up and push to Notify me. */
function Teaser({ release }: { release: StoreRelease }) {
  if (!release.products.length) {
    return (
      <Text tone="muted" style={styles.pad}>
        The line-up is under wraps until release day.
      </Text>
    )
  }
  return (
    <View style={styles.teaserGrid}>
      {release.products.map((p) => (
        <View key={p.id} style={styles.teaserItem}>
          <View style={styles.teaserImageWrap}>
            <Image source={p.thumbnail ?? undefined} style={styles.teaserImage} contentFit="cover" />
          </View>
          <Text variant="bodyStrong" numberOfLines={1}>
            {p.title}
          </Text>
          <Text variant="small" tone="muted">
            {release.release_at ? `Available ${formatShortDate(release.release_at)}` : "Available soon"}
          </Text>
        </View>
      ))}
      <View style={styles.teaserCta}>
        <Button title="Browse the core meanwhile" variant="ghost" size="sm" onPress={() => router.push("/shop")} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  heroWrap: { width: "100%", aspectRatio: 4 / 5, backgroundColor: colors.surfaceAlt },
  hero: { width: "100%", height: "100%" },
  badge: { position: "absolute", top: spacing.lg, left: spacing.lg },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.xl },
  titleBlock: { gap: spacing.sm },
  timing: { gap: spacing.xs },
  bold: { fontWeight: "600" },
  proof: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  products: { marginTop: spacing.xxl },
  pad: { paddingHorizontal: spacing.xl },
  teaserGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.xl - spacing.sm / 2,
    rowGap: spacing.xl,
  },
  teaserItem: { width: "50%", paddingHorizontal: spacing.sm / 2, gap: spacing.xxs },
  teaserImageWrap: {
    aspectRatio: 3 / 4,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.sm,
  },
  teaserImage: { width: "100%", height: "100%", opacity: 0.92 },
  teaserCta: { width: "100%", alignItems: "center" },
})
