import { Image } from "expo-image"
import { router } from "expo-router"
import { Pressable, StyleSheet, View } from "react-native"

import { colors, radius, spacing } from "@/constants/theme"
import { formatReleaseDate, formatShortDate } from "@/lib/format"
import type { StoreRelease } from "@/lib/types"

import { PhaseBadge } from "./badge"
import { Button } from "./button"
import { Countdown } from "./countdown"
import { NotifyMe } from "./notify-me"
import { Text } from "./text"

export const dropHref = (handle: string) => `/drops/${handle}`

function heroSource(release: StoreRelease) {
  return release.hero_image ?? release.products[0]?.thumbnail ?? undefined
}

/** Full-bleed hero for the drop that's live right now. */
export function LiveDropHero({ release }: { release: StoreRelease }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${release.title}, live now`}
      onPress={() => router.push(dropHref(release.handle))}
      style={styles.hero}>
      <Image source={heroSource(release)} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
      <View style={styles.heroShade} />
      <View style={styles.heroContent}>
        <PhaseBadge phase="live" />
        <Text variant="display" tone="inverse">
          {release.title}
        </Text>
        {release.product_promise ? (
          <Text tone="inverse" numberOfLines={2}>
            {release.product_promise}
          </Text>
        ) : null}
        <Button
          title="Shop the drop"
          variant="secondary"
          onPress={() => router.push(dropHref(release.handle))}
          style={styles.heroButton}
        />
      </View>
    </Pressable>
  )
}

/** Upcoming drop: teaser image, date, live countdown and Notify me. */
export function UpcomingDropCard({ release }: { release: StoreRelease }) {
  return (
    <View style={styles.upcoming}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${release.title}, ${formatReleaseDate(release.release_at)}`}
        onPress={() => router.push(dropHref(release.handle))}
        style={styles.upcomingTop}>
        <Image source={heroSource(release)} style={styles.upcomingImage} contentFit="cover" transition={200} />
        <View style={styles.upcomingMeta}>
          <Text variant="eyebrow" tone="muted">
            {release.tier === "major" ? "Major drop" : "New arrival"}
          </Text>
          <Text variant="heading" numberOfLines={2}>
            {release.title}
          </Text>
          <Text variant="small" tone="muted">
            {formatReleaseDate(release.release_at)}
          </Text>
          {release.release_at ? <Countdown releaseAt={release.release_at} variant="small" /> : null}
        </View>
      </Pressable>
      <NotifyMe releaseId={release.id} compact />
    </View>
  )
}

/** Compact row for past drops. */
export function PastDropRow({ release }: { release: StoreRelease }) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push(dropHref(release.handle))}
      style={({ pressed }) => [styles.pastRow, pressed && { opacity: 0.8 }]}>
      <Image source={heroSource(release)} style={styles.pastImage} contentFit="cover" />
      <View style={styles.pastMeta}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {release.title}
        </Text>
        <Text variant="small" tone="muted">
          Dropped {formatShortDate(release.published_at ?? release.release_at)}
        </Text>
      </View>
      <Text tone="muted">›</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: spacing.xl,
    aspectRatio: 4 / 5,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.text,
    justifyContent: "flex-end",
  },
  heroShade: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.overlay },
  heroContent: { padding: spacing.xl, gap: spacing.md },
  heroButton: { alignSelf: "flex-start", backgroundColor: colors.surface, borderColor: colors.surface, marginTop: spacing.xs },
  upcoming: {
    marginHorizontal: spacing.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  upcomingTop: { flexDirection: "row", gap: spacing.lg },
  upcomingImage: { width: 96, height: 120, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  upcomingMeta: { flex: 1, gap: spacing.xs },
  pastRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  pastImage: { width: 56, height: 70, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  pastMeta: { flex: 1, gap: spacing.xxs },
})
