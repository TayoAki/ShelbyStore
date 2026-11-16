import { Image } from "expo-image"
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native"

import { HoleBand } from "@/components/hole-band"
import { HoleCard } from "@/components/hole-card"
import { Screen } from "@/components/screen"
import { ErrorState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { Veil } from "@/components/veil"
import { colors, radius } from "@/constants/theme"
import { useHoles } from "@/hooks/use-holes"
import { useReleases } from "@/hooks/use-releases"
import { hatImage } from "@/lib/product"

/**
 * The Card (APP_SPEC G.5): six numbered holes in 2027. The next-hole band is
 * this screen's golf-green band; sold-out and ended holes stay in place.
 */
export default function CardScreen() {
  const { holes, next, isLoading, error } = useHoles()
  const releases = useReleases()
  const { width } = useWindowDimensions()
  const cardW = (Math.min(width, 720) - 30) / 2

  return (
    <Screen refreshing={releases.isRefetching} onRefresh={() => releases.refetch()}>
      <View style={styles.banner}>
        <Image source={hatImage("rope-clubhouse.jpg")} style={StyleSheet.absoluteFill} contentFit="cover" />
        <Veil alpha={0.7} />
        <View style={styles.bannerText}>
          <Text variant="cardHeading" tone="inverse" accessibilityRole="header">
            The Card
          </Text>
          <Text variant="body" tone="inverse">
            Six numbered holes in 2027. Hole 1 is the core cap. Each hole after it is one numbered color, released on
            its date and not remade.
          </Text>
        </View>
      </View>

      {next ? <HoleBand hole={next} /> : null}

      {isLoading ? <LoadingState /> : null}
      {error && !holes.length ? <ErrorState error={error} onRetry={() => releases.refetch()} /> : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.header}>
        {["Hole", "Name", "Date", "Edition", "Status"].map((h) => (
          <Text key={h} variant="scoreLabel" style={styles.headerCell}>
            {h}
          </Text>
        ))}
      </ScrollView>
      <View style={styles.grid}>
        {holes.map((h) => (
          <View key={h.number} style={{ width: cardW }}>
            <HoleCard hole={h} />
          </View>
        ))}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  banner: { marginHorizontal: 10, aspectRatio: 1, borderRadius: radius.xxl, overflow: "hidden", justifyContent: "flex-end" },
  bannerText: { padding: 20, gap: 8 },
  header: {
    marginHorizontal: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 28,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.black,
    marginBottom: 10,
  },
  headerCell: { minWidth: 48 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 10, alignItems: "stretch" },
})
