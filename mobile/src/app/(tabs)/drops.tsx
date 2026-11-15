import { StyleSheet, View } from "react-native"

import { LiveDropHero, PastDropRow, UpcomingDropCard } from "@/components/release-cards"
import { Screen } from "@/components/screen"
import { SectionHeader } from "@/components/section-header"
import { EmptyState, ErrorState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { colors, spacing } from "@/constants/theme"
import { useReleases } from "@/hooks/use-releases"

export default function DropsScreen() {
  const { data, isLoading, error, refetch, isRefetching } = useReleases()
  const live = data?.live ?? []
  const upcoming = data?.upcoming ?? []
  const past = data?.past ?? []

  return (
    <Screen edges={["top"]} refreshing={isRefetching} onRefresh={() => refetch()}>
      <View style={styles.header}>
        <Text variant="display">Drops</Text>
        <Text tone="muted">Small releases, often. Turn on a reminder and we'll tell you the moment one lands.</Text>
      </View>

      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={() => refetch()} /> : null}

      {live.length ? (
        <View style={styles.section}>
          <SectionHeader eyebrow="Now" title="Live now" />
          <View style={styles.list}>
            {live.map((r) => (
              <LiveDropHero key={r.id} release={r} />
            ))}
          </View>
        </View>
      ) : null}

      {upcoming.length ? (
        <View style={styles.section}>
          <SectionHeader eyebrow="Calendar" title="Coming up" />
          <View style={styles.list}>
            {upcoming.map((r) => (
              <UpcomingDropCard key={r.id} release={r} />
            ))}
          </View>
        </View>
      ) : null}

      {past.length ? (
        <View style={styles.section}>
          <SectionHeader eyebrow="Archive" title="Past drops" />
          <View style={styles.pastList}>
            {past.map((r) => (
              <PastDropRow key={r.id} release={r} />
            ))}
          </View>
        </View>
      ) : null}

      {!isLoading && !error && !live.length && !upcoming.length && !past.length ? (
        <EmptyState title="No drops yet" body="The first one is on its way. Check back soon." />
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  section: { marginBottom: spacing.xxl },
  list: { gap: spacing.lg },
  pastList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
})
