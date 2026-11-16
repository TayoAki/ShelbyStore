import { router, useLocalSearchParams } from "expo-router"
import { StyleSheet, View } from "react-native"

import { Box, confirmHaptic, Digits, Face, InkText, inkFor, Window } from "@/components/box"
import { Button } from "@/components/button"
import { Countdown } from "@/components/countdown"
import { TeeSheet } from "@/components/notify-me"
import { Screen } from "@/components/screen"
import { ErrorState, LoadingState } from "@/components/state-views"
import { colors } from "@/constants/theme"
import { holeDate, useHoles } from "@/hooks/use-holes"
import { useQuickAdd } from "@/hooks/use-quick-add"
import { useRelease } from "@/hooks/use-releases"
import { useTrackOnce } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { pad2 } from "@/lib/holes"

/**
 * A hole (APP_SPEC v7 §5.5): the edition's own box. The front face is printed
 * in the edition's ink (window, name, number and edition in the meta line) and
 * carries the phase: the real countdown and tee sheet, Add to bag, or "This
 * hole has been played." The story and what to look for sit on the next face.
 */
export default function HoleScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>()
  const release = useRelease(handle)
  const { holes } = useHoles()
  const quick = useQuickAdd()
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

  const ink = inkFor(colour)
  const light = ink.ink.toUpperCase() === colors.paper
  return (
    <Screen back>
      <View style={styles.wrap}>
        <Box>
          <Face ink={ink}>
            {image ? <Window source={image} alt={`${name} rope cap`} aspectRatio={1} /> : null}
            <View style={styles.gap8}>
              <InkText variant="model" accessibilityRole="header">
                {name}
              </InkText>
              <InkText variant="specLine">
                {[
                  number ? `No. ${pad2(number)}` : null,
                  phase === "live" ? "Live now" : phase === "upcoming" ? "Upcoming" : phase === "sold_out" ? "Sold out" : "Played",
                  hole?.editionSize
                    ? phase === "live" && hole.left != null
                      ? `${hole.left} of ${hole.editionSize} left`
                      : `Edition of ${hole.editionSize}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </InkText>
              {phase === "upcoming" ? <InkText variant="meta">{holeDate(r.release_at)}</InkText> : null}
            </View>
            {phase === "upcoming" ? (
              <View style={styles.phase}>
                {r.release_at ? <Countdown target={r.release_at} inverse={light} /> : <InkText variant="label">Going live shortly</InkText>}
                <TeeSheet releaseId={r.id} hole={number ?? 0} name={name} inverse={light} showEyebrow={false} />
              </View>
            ) : phase === "live" && product && colour ? (
              <View style={styles.phase}>
                <View style={styles.priceRow}>
                  {hole?.price != null ? <Digits value={formatMoney(hole.price)} /> : null}
                  <Button
                    title="Add to bag"
                    variant="ink"
                    size="atc"
                    style={styles.flex}
                    loading={quick.pending !== null}
                    onPress={() => {
                      confirmHaptic()
                      void quick.addColour(product, colour, "app_card")
                    }}
                  />
                </View>
                <Button title="Full details" variant="link" onPress={() => router.push(`/products/${product.handle}`)} />
              </View>
            ) : (
              <View style={styles.phase}>
                <InkText variant="cardTitle">This hole has been played.</InkText>
                <Button title="Shop the Rope Cap" variant="ink" size="large" onPress={() => router.push("/products/rope-cap")} />
              </View>
            )}
          </Face>
          {r.story || r.product_promise || r.proof ? (
            <Face>
              {r.product_promise ? (
                <InkText variant="panelTitle" accessibilityRole="header">
                  {r.product_promise}
                </InkText>
              ) : null}
              {r.story ? <InkText variant="article">{r.story}</InkText> : null}
              {r.proof ? (
                <View style={styles.gap8}>
                  <InkText variant="cardTitle">What to look for</InkText>
                  <InkText variant="bodyLong">{r.proof}</InkText>
                </View>
              ) : null}
            </Face>
          ) : null}
          <Face>
            <Button title="Back to The Card" variant="outlineBlack" onPress={() => router.navigate("/card")} />
          </Face>
        </Box>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 12 },
  gap8: { gap: 8 },
  flex: { flex: 1 },
  phase: { gap: 12 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 14 },
})
