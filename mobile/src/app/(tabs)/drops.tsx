import { router } from "expo-router"
import { useState } from "react"
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native"

import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/button"
import { Countdown } from "@/components/countdown"
import { DropImage } from "@/components/drop-image"
import { NotifyMe } from "@/components/notify-me"
import { Screen } from "@/components/screen"
import { SegmentedControl } from "@/components/segmented-control"
import { EmptyState, ErrorState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { colors, fonts, MAX_CONTENT_WIDTH, type } from "@/constants/theme"
import { useReleases } from "@/hooks/use-releases"
import { formatDropDate, formatShortDate } from "@/lib/format"
import type { StoreRelease } from "@/lib/types"

/** "LIVE NOW | NOV 16, 2026" with the first part in muted 11pt (web §6.6). */
function Meta({ first, rest }: { first: string; rest: string }) {
  return (
    <Text variant="eyebrow" numberOfLines={1}>
      <Text variant="eyebrow" tone="muted" style={styles.metaFirst}>
        {first}
      </Text>
      {"  |  "}
      {rest}
    </Text>
  )
}

function metaFor(r: StoreRelease): { first: string; rest: string } {
  if (r.phase === "live") return { first: "Live now", rest: formatShortDate(r.published_at ?? r.release_at) }
  if (r.phase === "upcoming") return { first: "Drops", rest: formatDropDate(r.release_at) }
  return { first: "Ended", rest: formatShortDate(r.published_at ?? r.release_at) }
}

/** Drops (APP_SPEC §5.9): Melin's blog index for releases. */
export default function DropsScreen() {
  const { width: windowWidth } = useWindowDimensions()
  const W = Math.min(windowWidth, MAX_CONTENT_WIDTH)
  const { data, isLoading, error, refetch, isRefetching } = useReleases()
  const [tab, setTab] = useState<"current" | "past">("current")
  const [condensed, setCondensed] = useState(false)
  const live = data?.live ?? []
  const upcoming = data?.upcoming ?? []
  const past = data?.past ?? []
  const featured = live[0] ?? upcoming[0] ?? null
  const list = tab === "current" ? [...live, ...upcoming].filter((r) => r.id !== featured?.id) : past

  return (
    <Screen
      edges={["top"]}
      header={<AppHeader condensed={condensed} />}
      onScrollY={(y) => setCondensed(y > 121)}
      refreshing={isRefetching}
      onRefresh={() => refetch()}>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={() => refetch()} /> : null}

      {featured ? (
        <View>
          <Pressable accessibilityRole="link" onPress={() => router.push(`/drops/${featured.handle}` as never)}>
            <DropImage release={featured} width={W} height={(293 * W) / 390} />
          </Pressable>
          <View style={styles.featuredText}>
            {featured.phase === "live" ? (
              <Meta first="Limited release" rest="Live now" />
            ) : (
              <Meta first="Next drop" rest={formatDropDate(featured.release_at)} />
            )}
            <Text style={styles.featuredTitle} accessibilityRole="header">
              {featured.title}
            </Text>
            {featured.product_promise ? (
              <Text style={[type.body, styles.center]}>{featured.product_promise}</Text>
            ) : null}
            {featured.phase === "upcoming" && featured.release_at ? <Countdown releaseAt={featured.release_at} large /> : null}
            <Button
              title={featured.phase === "live" ? "Shop the drop" : "Get notified"}
              variant="light"
              onPress={() => router.push(`/drops/${featured.handle}` as never)}
            />
          </View>
        </View>
      ) : null}

      <SegmentedControl
        compact
        options={[
          { value: "current", label: "Live & Upcoming" },
          { value: "past", label: "Past" },
        ]}
        value={tab}
        onChange={setTab}
        style={styles.tabs}
      />

      <View style={styles.cards}>
        {list.map((r) => (
          <View key={r.id} style={styles.card}>
            <Meta {...metaFor(r)} />
            <Pressable accessibilityRole="link" onPress={() => router.push(`/drops/${r.handle}` as never)}>
              <DropImage release={r} width={W - 32} height={((W - 32) * 2) / 3} />
            </Pressable>
            <Text style={styles.cardTitle}>{r.title}</Text>
            {r.phase === "upcoming" ? (
              <View style={styles.cardUpcoming}>
                {r.release_at ? <Countdown releaseAt={r.release_at} /> : null}
                <NotifyMe releaseId={r.id} />
              </View>
            ) : null}
          </View>
        ))}
        {!isLoading && !list.length ? <EmptyState title="No Drops Here Yet" /> : null}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: { textAlign: "center" },
  metaFirst: { fontSize: 11 },
  featuredText: { paddingVertical: 24, paddingHorizontal: 16, alignItems: "center", gap: 8 },
  featuredTitle: {
    fontFamily: fonts.heading,
    fontSize: 39.8,
    lineHeight: 39.8,
    textTransform: "uppercase",
    color: colors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  tabs: { marginTop: 8 },
  cards: { paddingHorizontal: 16, gap: 32, marginTop: 32 },
  card: { gap: 8 },
  cardTitle: { fontFamily: fonts.heading, fontSize: 16, lineHeight: 20.8, color: colors.text, marginBottom: 10 },
  cardUpcoming: { gap: 12 },
})
