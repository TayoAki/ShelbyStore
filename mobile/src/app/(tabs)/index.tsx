import { Image } from "expo-image"
import { router } from "expo-router"
import { Pressable, StyleSheet, View } from "react-native"

import { Button } from "@/components/button"
import { productHref } from "@/components/product-card"
import { LiveDropHero, UpcomingDropCard } from "@/components/release-cards"
import { Screen } from "@/components/screen"
import { SectionHeader } from "@/components/section-header"
import { SizeStrip } from "@/components/size-strip"
import { EmptyState, ErrorState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { colors, radius, spacing } from "@/constants/theme"
import { useCoreProducts } from "@/hooks/use-products"
import { useReleases } from "@/hooks/use-releases"
import { formatMoney } from "@/lib/format"
import { productMeta, productPrice, sizeAvailability, type Product } from "@/lib/product"

export default function HomeScreen() {
  const releases = useReleases()
  const core = useCoreProducts()

  const live = releases.data?.live ?? []
  const upcoming = releases.data?.upcoming ?? []
  const coreProducts = core.data ?? []
  const loading = releases.isLoading && core.isLoading
  const nothingYet =
    !loading && !releases.error && !core.error && !live.length && !upcoming.length && !coreProducts.length

  return (
    <Screen
      edges={["top"]}
      refreshing={releases.isRefetching || core.isRefetching}
      onRefresh={() => {
        releases.refetch()
        core.refetch()
      }}>
      <View style={styles.masthead}>
        <Text variant="title" style={styles.wordmark}>
          SHELBY
        </Text>
        <Text variant="small" tone="muted">
          The core, always. Drops, often.
        </Text>
      </View>

      {loading ? <LoadingState /> : null}

      {live.length ? (
        <View style={styles.section}>
          <LiveDropHero release={live[0]} />
          {live.length > 1 ? (
            <View style={styles.moreLive}>
              {live.slice(1).map((r) => (
                <Button
                  key={r.id}
                  title={`Also live: ${r.title}`}
                  variant="secondary"
                  size="sm"
                  onPress={() => router.push(`/drops/${r.handle}`)}
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.section}>
        {core.error ? (
          <ErrorState error={core.error} onRetry={() => core.refetch()} />
        ) : coreProducts.length ? (
          <>
            <SectionHeader eyebrow="The core" title="The one we always keep in stock" />
            <View style={styles.coreList}>
              {coreProducts.map((product) => (
                <CoreFeature key={product.id} product={product} />
              ))}
            </View>
          </>
        ) : null}
      </View>

      <View style={styles.section}>
        {releases.error ? (
          <ErrorState error={releases.error} onRetry={() => releases.refetch()} />
        ) : upcoming.length ? (
          <>
            <SectionHeader
              eyebrow="Coming up"
              title="Next drops"
              actionTitle="All drops"
              onAction={() => router.push("/drops")}
            />
            <View style={styles.cardList}>
              {upcoming.slice(0, 3).map((release) => (
                <UpcomingDropCard key={release.id} release={release} />
              ))}
            </View>
          </>
        ) : !live.length && !loading ? (
          <View style={styles.quiet}>
            <Text variant="eyebrow" tone="muted">
              Drops
            </Text>
            <Text tone="muted">Nothing scheduled right now. New drops land here first.</Text>
          </View>
        ) : null}
      </View>

      {nothingYet ? (
        <EmptyState title="The shop is getting ready" body="Pull down to refresh, or check back soon." />
      ) : null}
    </Screen>
  )
}

/** The signature basic: big image, promise, honest size availability, one clear action. */
function CoreFeature({ product }: { product: Product }) {
  const price = productPrice(product)
  const sizes = sizeAvailability(product)
  const { promise } = productMeta(product)
  const out = sizes.filter((s) => s.state === "sold_out").map((s) => s.size)
  const href = productHref(product.handle ?? product.id)

  return (
    <View style={styles.coreCard}>
      <Pressable accessibilityRole="link" accessibilityLabel={product.title} onPress={() => router.push(href)}>
        <Image
          source={product.thumbnail ?? product.images?.[0]?.url}
          style={styles.coreImage}
          contentFit="cover"
          transition={200}
        />
      </Pressable>
      <View style={styles.coreBody}>
        <View style={styles.coreTitleRow}>
          <Text variant="heading" style={styles.flex}>
            {product.title}
          </Text>
          {price ? <Text variant="heading">{formatMoney(price.amount, price.currency)}</Text> : null}
        </View>
        {promise ? <Text tone="muted">{promise}</Text> : null}
        {sizes.length ? (
          <View style={styles.sizes}>
            <SizeStrip sizes={sizes} />
            <Text variant="small" tone={out.length ? "muted" : "success"} style={styles.bold}>
              {out.length ? `Restocking ${out.join(", ")}` : "Every size in stock"}
            </Text>
          </View>
        ) : null}
        <Button title="Shop the core" onPress={() => router.push(href)} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  masthead: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.xs },
  wordmark: { letterSpacing: 6 },
  section: { marginBottom: spacing.xxl },
  moreLive: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.sm },
  coreList: { gap: spacing.xl },
  coreCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  coreImage: { width: "100%", aspectRatio: 4 / 5, backgroundColor: colors.surfaceAlt },
  coreBody: { padding: spacing.xl, gap: spacing.lg },
  coreTitleRow: { flexDirection: "row", alignItems: "baseline", gap: spacing.md },
  flex: { flex: 1 },
  sizes: { gap: spacing.sm },
  bold: { fontWeight: "600" },
  cardList: { gap: spacing.lg },
  quiet: { paddingHorizontal: spacing.xl, gap: spacing.xs },
})
