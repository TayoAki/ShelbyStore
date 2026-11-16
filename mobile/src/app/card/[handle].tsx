import { Image } from "expo-image"
import { router, useLocalSearchParams } from "expo-router"
import { StyleSheet, useWindowDimensions, View } from "react-native"

import { Button } from "@/components/button"
import { Countdown } from "@/components/countdown"
import { EditionBadge } from "@/components/edition-badge"
import { TeeSheet } from "@/components/notify-me"
import { RopeRule } from "@/components/rope-rule"
import { Screen } from "@/components/screen"
import { ErrorState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { colors, golf, radius } from "@/constants/theme"
import { holeDate, useHoles } from "@/hooks/use-holes"
import { useQuickAdd } from "@/hooks/use-quick-add"
import { useRelease } from "@/hooks/use-releases"
import { useTrackOnce } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { pad2 } from "@/lib/holes"

/**
 * A hole (APP_SPEC G.5 Card detail): v5's drop-detail layout with the Card
 * heading in midnight on the white article card; by phase, the countdown and
 * tee sheet, the edition buy card, or "This hole has been played."
 */
export default function HoleScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>()
  const release = useRelease(handle)
  const { holes } = useHoles()
  const quick = useQuickAdd()
  const { width } = useWindowDimensions()
  const hole = holes.find((h) => h.handle === handle) ?? null
  useTrackOnce("drop_viewed", release.data?.id, () => ({ release_id: release.data?.id, handle, hole: hole?.number }))

  if (release.isLoading) {
    return (
      <Screen back>
        <LoadingState />
      </Screen>
    )
  }
  if (release.error || !release.data) {
    return (
      <Screen back>
        <ErrorState error={release.error ?? new Error("This hole isn't on the card.")} onRetry={() => release.refetch()} />
      </Screen>
    )
  }

  const r = release.data
  const phase = hole?.status ?? (r.phase === "live" ? "live" : r.phase === "upcoming" ? "upcoming" : "ended")
  const name = hole?.name ?? r.title
  const number = hole?.number ?? null
  const image = hole?.image ?? r.hero_image
  const product = hole?.product ?? null
  const colour = hole?.colourway ?? null

  return (
    <Screen back>
      <View style={[styles.hero, { width: Math.min(width, 720) - 20 }]}>
        {image ? <Image source={image} style={StyleSheet.absoluteFill} contentFit="contain" /> : null}
      </View>
      <View style={styles.article}>
        <Text variant="eyebrow" tone="muted">
          {number ? `Hole ${number} · ` : ""}
          {phase === "live" ? "Live now" : phase === "upcoming" ? holeDate(r.release_at) : phase === "sold_out" ? "Sold out" : "Played"}
        </Text>
        <Text variant="cardHeading" tone="midnight" accessibilityRole="header">
          {number ? `${pad2(number)} · ${name}` : name}
        </Text>
        {colour ? <RopeRule colourway={colour} /> : null}
        {hole?.editionSize ? <EditionBadge size={hole.editionSize} left={phase === "live" ? hole.left : null} /> : null}
        {r.story ? (
          <Text variant="article" tone="charcoal">
            {r.story}
          </Text>
        ) : null}
        {r.product_promise ? <Text variant="kicker">{r.product_promise}</Text> : null}
        {r.proof ? (
          <View style={styles.proof}>
            <Text variant="label">What to look for</Text>
            <Text variant="bodyLong" tone="charcoal">
              {r.proof}
            </Text>
          </View>
        ) : null}

        {phase === "upcoming" ? (
          <View style={styles.phase}>
            {r.release_at ? <Countdown target={r.release_at} /> : <Text variant="label">Going live shortly</Text>}
            <TeeSheet releaseId={r.id} hole={number ?? 0} name={name} />
          </View>
        ) : phase === "live" && product && colour ? (
          <View style={styles.buy}>
            <Text variant="pdpTitle">The Rope Cap, {name}</Text>
            {hole?.price != null ? <Text variant="price">{formatMoney(hole.price)}</Text> : null}
            <Button
              title={hole?.price != null ? `Add to bag – ${formatMoney(hole.price)}` : "Add to bag"}
              size="atc"
              loading={quick.pending !== null}
              onPress={() => void quick.addColour(product, colour, "app_card")}
            />
            <Button title="See the scorecard" variant="link" onPress={() => router.push(`/products/${product.handle}`)} />
          </View>
        ) : (
          <View style={styles.phase}>
            <Text variant="empty">This hole has been played.</Text>
            <Button title="Shop the Rope Cap" onPress={() => router.push("/products/rope-cap")} />
          </View>
        )}
        <Button title="← Back to The Card" variant="link" onPress={() => router.navigate("/card")} />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: { marginHorizontal: 10, aspectRatio: 1, borderRadius: radius.tile, overflow: "hidden", backgroundColor: colors.white },
  article: { margin: 10, backgroundColor: colors.white, borderRadius: radius.xxxl, padding: 24, gap: 16 },
  proof: { gap: 8, paddingTop: 8 },
  phase: { gap: 16, paddingTop: 8, alignItems: "flex-start" },
  buy: { gap: 12, paddingTop: 8, padding: 16, borderRadius: radius.xl, backgroundColor: golf.tint },
})
