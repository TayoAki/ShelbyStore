import { router, useLocalSearchParams } from "expo-router"
import { FlatList, StyleSheet, View } from "react-native"

import { Accordion } from "@/components/accordion"
import { Button } from "@/components/button"
import { Countdown } from "@/components/countdown"
import { HoleHero } from "@/components/hole-hero"
import { TeeSheet } from "@/components/notify-me"
import { EditionCard } from "@/components/product-card"
import { Screen } from "@/components/screen"
import { ErrorState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { layout } from "@/constants/theme"
import { holeDate, useHoles } from "@/hooks/use-holes"
import { useQuickAdd } from "@/hooks/use-quick-add"
import { useRelease } from "@/hooks/use-releases"
import { useTrackOnce } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { confirmHaptic } from "@/lib/haptics"
import { pad2 } from "@/lib/holes"
import { POLICY } from "@/lib/policy"

/**
 * A hole (APP_SPEC v8 V8.5 §5): the editorial block (the image is not a link),
 * the phase's action (real countdown and tee sheet; Add To Bag; or the played
 * line), accordions for the colour, the release and shipping, then the other
 * holes as a rail.
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
  const others = holes.filter((h) => h.number !== number)
  const eyebrow = [
    number ? `Hole ${pad2(number)}` : null,
    phase === "live" ? "Live now" : phase === "upcoming" ? "Upcoming" : phase === "sold_out" ? "Sold out" : "Played",
    hole?.editionSize
      ? phase === "live" && hole.left != null
        ? `${hole.left} of ${hole.editionSize} left`
        : `Edition of ${hole.editionSize}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <Screen back>
      <HoleHero number={number} name={name} image={image} eyebrow={eyebrow} date={phase === "upcoming" ? holeDate(r.release_at) : null}>
        {phase === "upcoming" ? (
          <>
            {r.release_at ? <Countdown target={r.release_at} /> : <Text variant="labelCaps">Going live shortly</Text>}
            <TeeSheet releaseId={r.id} hole={number ?? 0} name={name} showEyebrow={false} />
          </>
        ) : phase === "live" && product && colour ? (
          <>
            {hole?.price != null ? <Text variant="priceProduct">{formatMoney(hole.price)}</Text> : null}
            <Button
              title="Add To Bag"
              variant="primary"
              loading={quick.pending !== null}
              onPress={() => {
                confirmHaptic()
                void quick.addColour(product, colour, "app_card")
              }}
            />
            <Button title={`Shop Hole ${pad2(number ?? 0)} · full details`} variant="link" onPress={() => router.push(`/products/${product.handle}`)} />
          </>
        ) : (
          <>
            <Text variant="titleCard">This hole has been played.</Text>
            <Button title="Shop the Rope Cap" variant="secondary" onPress={() => router.push("/products/rope-cap")} />
          </>
        )}
      </HoleHero>

      <View style={styles.accordions}>
        {r.product_promise || r.proof ? (
          <Accordion title="The color" initiallyOpen>
            <View style={styles.gap8}>
              {r.product_promise ? <Text variant="bodyPdp">{r.product_promise}</Text> : null}
              {r.proof ? <Text variant="bodyPdp">{r.proof}</Text> : null}
            </View>
          </Accordion>
        ) : null}
        <Accordion title="The release">
          <View style={styles.gap8}>
            {r.story ? <Text variant="bodyPdp">{r.story}</Text> : null}
            <Text variant="bodyPdp">
              {r.release_at ? `${holeDate(r.release_at)}. ` : ""}
              {hole?.editionSize ? `A numbered edition of ${hole.editionSize}. ` : ""}
              {POLICY.limitedRun}
            </Text>
          </View>
        </Accordion>
        <Accordion title="Shipping">
          <Text variant="bodyPdp">
            {POLICY.shipping}. {POLICY.dispatch}. {POLICY.returns}.
          </Text>
        </Accordion>
      </View>

      {others.length ? (
        <View style={styles.rail}>
          <Text variant="headingRecs" accessibilityRole="header" style={styles.railTitle}>
            The other holes
          </Text>
          <FlatList
            data={others}
            horizontal
            keyExtractor={(h) => String(h.number)}
            showsHorizontalScrollIndicator={false}
            snapToInterval={164 + layout.gap}
            decelerationRate="fast"
            contentContainerStyle={styles.railList}
            renderItem={({ item }) => <EditionCard hole={item} trackAs="card_hole" style={styles.card} />}
          />
        </View>
      ) : null}

      <View style={styles.back}>
        <Button title="Back to The Card" variant="outline" onPress={() => router.navigate("/card")} />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  gap8: { gap: 8 },
  accordions: { paddingHorizontal: layout.edge, paddingTop: 24 },
  rail: { paddingTop: 40 },
  railTitle: { paddingHorizontal: layout.railEdge, marginBottom: 16 },
  railList: { paddingHorizontal: layout.railEdge, gap: layout.gap },
  card: { width: 164 },
  back: { paddingHorizontal: layout.edge, paddingVertical: 40 },
})
