import { StyleSheet, View } from "react-native"

import { ProductCard, ProductGrid } from "@/components/product-card"
import { Screen } from "@/components/screen"
import { SectionHeader } from "@/components/section-header"
import { EmptyState, ErrorState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { spacing } from "@/constants/theme"
import { useCoreProducts, useProductsByIds } from "@/hooks/use-products"
import { useReleases } from "@/hooks/use-releases"
import type { StoreRelease } from "@/lib/types"

export default function ShopScreen() {
  const core = useCoreProducts()
  const releases = useReleases()
  const live = releases.data?.live ?? []

  return (
    <Screen
      edges={["top"]}
      refreshing={core.isRefetching || releases.isRefetching}
      onRefresh={() => {
        core.refetch()
        releases.refetch()
      }}>
      <View style={styles.header}>
        <Text variant="display">Shop</Text>
        <Text tone="muted">The core collection, plus whatever has dropped.</Text>
      </View>

      <View style={styles.section}>
        <SectionHeader eyebrow="Always in stock" title="The core" />
        {core.isLoading ? <LoadingState /> : null}
        {core.error ? <ErrorState error={core.error} onRetry={() => core.refetch()} /> : null}
        {core.data?.length ? (
          <ProductGrid>
            {core.data.map((p) => (
              <ProductCard key={p.id} product={p} label="Core" />
            ))}
          </ProductGrid>
        ) : !core.isLoading && !core.error ? (
          <EmptyState title="The core is restocking" body="Check back shortly." />
        ) : null}
      </View>

      {live.map((release) => (
        <LiveReleaseProducts key={release.id} release={release} />
      ))}
    </Screen>
  )
}

function LiveReleaseProducts({ release }: { release: StoreRelease }) {
  const ids = release.products.map((p) => p.id)
  const { data, isLoading, error, refetch } = useProductsByIds(ids)
  if (!ids.length) return null
  return (
    <View style={styles.section}>
      <SectionHeader eyebrow="Live drop" title={release.title} />
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={() => refetch()} /> : null}
      {data?.length ? (
        <ProductGrid>
          {data.map((p) => (
            <ProductCard key={p.id} product={p} releaseId={release.id} label="Drop" />
          ))}
        </ProductGrid>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  section: { marginBottom: spacing.xxl },
})
