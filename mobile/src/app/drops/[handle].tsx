import { router, Stack, useLocalSearchParams } from "expo-router"
import { useEffect } from "react"
import { StyleSheet, useWindowDimensions, View } from "react-native"

import { Button } from "@/components/button"
import { Countdown } from "@/components/countdown"
import { DropImage } from "@/components/drop-image"
import { NotifyMe } from "@/components/notify-me"
import { ProductCard, ProductGrid } from "@/components/product-card"
import { Screen } from "@/components/screen"
import { EmptyState, ErrorState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { colors, fonts, MAX_CONTENT_WIDTH } from "@/constants/theme"
import { useProductsByIds } from "@/hooks/use-products"
import { useRelease } from "@/hooks/use-releases"
import { useTrackOnce } from "@/lib/analytics"
import { captureAttribution } from "@/lib/attribution"
import { formatDropDate, formatShortDate } from "@/lib/format"
import { isNotFound } from "@/lib/medusa"
import type { StoreRelease } from "@/lib/types"
import { useCart } from "@/providers/cart-provider"

/** Drop detail (APP_SPEC §5.9): Melin's article page for one release. */
export default function DropScreen() {
  const params = useLocalSearchParams<{ handle: string; asset?: string }>()
  const { width: windowWidth } = useWindowDimensions()
  const W = Math.min(windowWidth, MAX_CONTENT_WIDTH)
  const { data: release, isLoading, error, refetch, isRefetching } = useRelease(params.handle)
  const { syncAttribution } = useCart()
  const asset = typeof params.asset === "string" ? params.asset : undefined
  const releaseId = release?.id
  useTrackOnce("drop_viewed", releaseId, () => ({
    release_id: release?.id,
    handle: release?.handle,
    phase: release?.phase,
  }))

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
            title="Drop Not Found"
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

  const cardWidth = (W - 48) / 2
  const paragraphs = (release.story ?? "").split(/\n+/).filter(Boolean)

  return (
    <Screen edges={["bottom"]} refreshing={isRefetching} onRefresh={() => refetch()}>
      <Stack.Screen options={{ title: "" }} />
      <DropImage release={release} width={W} height={(260 * W) / 390} />

      <View style={styles.column}>
        <Text style={styles.meta}>{metaLine(release)}</Text>
        <Text style={styles.title} accessibilityRole="header">
          {release.title}
        </Text>
        {release.product_promise ? <Text style={styles.paragraph}>{release.product_promise}</Text> : null}
        {paragraphs.map((p, i) => (
          <Text key={i} style={styles.paragraph}>
            {p}
          </Text>
        ))}

        {release.proof ? (
          <>
            <Text style={styles.h2}>What To Look For</Text>
            <Text style={styles.paragraph}>{release.proof}</Text>
          </>
        ) : null}

        {release.phase === "upcoming" ? (
          <View style={styles.upcoming}>
            {release.release_at ? <Countdown releaseAt={release.release_at} large /> : null}
            <NotifyMe releaseId={release.id} />
          </View>
        ) : null}
        {release.phase === "past" ? <Text style={styles.ended}>This drop has ended.</Text> : null}
      </View>

      {purchasable ? (
        products.isLoading ? (
          <LoadingState />
        ) : products.error ? (
          <ErrorState error={products.error} onRetry={() => products.refetch()} />
        ) : products.data?.length ? (
          <ProductGrid>
            {products.data.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                width={cardWidth}
                releaseId={release.phase === "live" ? release.id : undefined}
                status={release.phase === "live" ? "live" : null}
              />
            ))}
          </ProductGrid>
        ) : null
      ) : null}

      <View style={styles.column}>
        <View style={styles.rule} />
        <View style={styles.back}>
          <Button
            title="← Back to drops"
            variant="link"
            onPress={() => router.navigate("/drops")}
            style={styles.backLink}
          />
        </View>
      </View>
    </Screen>
  )
}

function metaLine(r: StoreRelease): string {
  const tier = r.tier === "major" ? "Major release" : "Limited release"
  const when =
    r.phase === "live"
      ? "Live now"
      : r.phase === "upcoming"
        ? formatDropDate(r.release_at)
        : `Ended ${formatShortDate(r.published_at ?? r.release_at)}`
  return `${tier}   |   ${when}`
}

const styles = StyleSheet.create({
  column: { paddingTop: 27, paddingHorizontal: 16 },
  meta: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.text,
    opacity: 0.6,
  },
  title: { fontFamily: fonts.subheading, fontSize: 26, lineHeight: 34, color: colors.text, marginTop: 12, marginBottom: 16 },
  paragraph: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25, letterSpacing: -0.12, color: colors.text, marginBottom: 16 },
  h2: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 28.6, color: colors.text, marginTop: 32, marginBottom: 12 },
  upcoming: { gap: 16, marginTop: 16, marginBottom: 16 },
  ended: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 23.4, color: colors.text, marginVertical: 16 },
  rule: { height: 4, backgroundColor: colors.primary, marginTop: 48, marginBottom: 24 },
  back: { alignItems: "center", minHeight: 56, justifyContent: "center" },
  backLink: { alignSelf: "center" },
})
