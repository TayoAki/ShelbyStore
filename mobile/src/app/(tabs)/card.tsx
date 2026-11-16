import { router } from "expo-router"
import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { Button } from "@/components/button"
import { Countdown } from "@/components/countdown"
import { HoleHero } from "@/components/hole-hero"
import { TeeSheet } from "@/components/notify-me"
import { Screen } from "@/components/screen"
import { ErrorState, Skeleton } from "@/components/state-views"
import { Text } from "@/components/text"
import { Tile } from "@/components/tile"
import { colors, layout } from "@/constants/theme"
import { holeDate, useHoles, type Hole } from "@/hooks/use-holes"
import { useReleases } from "@/hooks/use-releases"
import { trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { pad2 } from "@/lib/holes"

const STATUS: Record<Hole["status"], string> = {
  live: "Live",
  upcoming: "Upcoming",
  announced: "Announced",
  sold_out: "Sold out",
  ended: "Played",
}

/**
 * The Card (APP_SPEC v8 V8.5 §5, web E.6.7): the page title and intro, the
 * next hole as an editorial block (square tile, then the name, date, real
 * countdown and tee sheet on #F6F6F6), then the six holes as one column of
 * hole cards. Sold-out and played holes keep their place.
 */
export default function CardScreen() {
  const { holes, next, isLoading, error } = useHoles()
  const releases = useReleases()

  return (
    <Screen refreshing={releases.isRefetching} onRefresh={() => releases.refetch()}>
      <View style={styles.head}>
        <Text variant="breadcrumb">Home / The Card</Text>
        <Text variant="titlePage" accessibilityRole="header" style={styles.center}>
          The Card
        </Text>
        <Text variant="bodyPdp" style={styles.center}>
          Six holes in 2027. Hole 1 is the core cap, always in stock. Each hole after it is one numbered color, released on its date and
          not remade.
        </Text>
      </View>

      {next ? <NextHole hole={next} /> : null}
      {isLoading ? <Skeleton style={styles.skeleton} /> : null}
      {error && !holes.length ? <ErrorState error={error} onRetry={() => releases.refetch()} /> : null}

      <View style={styles.list}>
        {holes.map((h) => (
          <HoleCard key={h.number} hole={h} />
        ))}
      </View>
    </Screen>
  )
}

/** The next hole as the editorial block. */
function NextHole({ hole }: { hole: Hole }) {
  const live = hole.status === "live"
  return (
    <HoleHero
      number={hole.number}
      name={hole.name}
      image={hole.image}
      eyebrow={`${live ? "Live now" : "Next"} · Hole ${pad2(hole.number)}${hole.editionSize ? ` · Edition of ${hole.editionSize}` : ""}`}
      date={holeDate(hole.releaseAt ?? hole.dateIso)}>
      {!live && hole.releaseAt ? <Countdown target={hole.releaseAt} /> : null}
      {live && hole.product?.handle ? (
        <Button
          title={`Shop Hole ${pad2(hole.number)}${hole.price != null ? ` · ${formatMoney(hole.price)}` : ""}`}
          variant="primary"
          onPress={() => {
            trackTap("hero_shop_drop", { hole: hole.number })
            router.push(`/products/${hole.product!.handle}`)
          }}
        />
      ) : hole.release ? (
        <TeeSheet releaseId={hole.release.id} hole={hole.number} name={hole.name} showEyebrow={false} />
      ) : null}
    </HoleHero>
  )
}

/** One hole: a 4:3 tile, the name, the meta line, then the phase's action. */
function HoleCard({ hole }: { hole: Hole }) {
  const [teeSheet, setTeeSheet] = useState(false)
  const isCore = hole.number === 1
  const tappable = isCore || !!hole.handle
  const open = () => {
    trackTap("card_hole", { hole: hole.number })
    if (isCore) router.push("/products/rope-cap")
    else if (hole.handle) router.push(`/card/${hole.handle}`)
  }
  const meta = [
    isCore ? "Always in stock" : holeDate(hole.dateIso).split(" · ")[0],
    !isCore && hole.editionSize
      ? hole.status === "live" && hole.left != null
        ? `${hole.left} of ${hole.editionSize} left`
        : `Edition of ${hole.editionSize}`
      : null,
    isCore ? null : STATUS[hole.status],
    hole.price != null ? formatMoney(hole.price) : null,
  ].filter(Boolean)
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole={tappable ? "link" : undefined}
        accessibilityLabel={`Hole ${hole.number}, ${hole.name}, ${meta.join(", ")}`}
        disabled={!tappable}
        onPress={open}>
        {({ pressed }) => (
          <>
            <View>
              <Tile
                source={hole.status === "announced" ? null : hole.image}
                alt={`${hole.name} rope cap`}
                aspectRatio={4 / 3}
                inset={0.1}
                badge={hole.status === "sold_out" ? "Sold out" : `No. ${pad2(hole.number)}`}
                badgeDark={hole.status === "sold_out"}
              />
              {hole.status === "announced" || !hole.image ? (
                <View style={[StyleSheet.absoluteFill, styles.numeral]} pointerEvents="none">
                  <Text variant="holeNumeral" tone="muted">
                    {pad2(hole.number)}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={styles.cardText}>
              <Text variant="titleCard" style={pressed && { color: colors.linkPressed }}>
                Hole {hole.number}, {hole.name}
              </Text>
              <Text variant="meta" tone="muted">
                {meta.join(" · ")}
              </Text>
            </View>
          </>
        )}
      </Pressable>
      <View style={styles.action}>
        {hole.status === "live" && !isCore ? (
          <Button
            title={`Shop ${hole.name}`}
            variant="outline"
            size="small"
            onPress={() => router.push(`/products/${hole.product?.handle ?? "rope-cap"}`)}
          />
        ) : hole.status === "upcoming" && hole.release ? (
          teeSheet ? (
            <TeeSheet releaseId={hole.release.id} hole={hole.number} name={hole.name} showEyebrow={false} />
          ) : (
            <Button title="Join the tee sheet" variant="outline" size="small" onPress={() => setTeeSheet(true)} />
          )
        ) : hole.status === "announced" ? (
          <Text variant="meta" tone="muted">
            Details closer to the date.
          </Text>
        ) : isCore ? (
          <Button title="Shop the Rope Cap" variant="outline" size="small" onPress={open} />
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: layout.edge, paddingTop: 16, paddingBottom: 28, gap: 10 },
  center: { textAlign: "center" },
  skeleton: { height: 420, marginHorizontal: layout.railEdge },
  list: { paddingHorizontal: layout.railEdge, paddingTop: 40, paddingBottom: 48, gap: 32 },
  card: { gap: 0 },
  numeral: { alignItems: "center", justifyContent: "center" },
  cardText: { paddingTop: 12, gap: 4 },
  action: { paddingTop: 12, alignItems: "flex-start" },
})
