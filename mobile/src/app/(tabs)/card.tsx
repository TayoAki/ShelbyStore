import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { router } from "expo-router"
import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { Box, Digits, Face, InkText, inkFor, usePanelInk, Window } from "@/components/box"
import { Button } from "@/components/button"
import { Countdown } from "@/components/countdown"
import { TeeSheet } from "@/components/notify-me"
import { Screen } from "@/components/screen"
import { ErrorState, LoadingState } from "@/components/state-views"
import { colors } from "@/constants/theme"
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
  ended: "Ended",
}

/**
 * The Card (APP_SPEC v7 §5.5): one box. The heading face, the next hole
 * printed in its own edition's ink with its real countdown and tee sheet,
 * then the six holes ruled as one scorecard. Sold-out and ended holes stay
 * in their row.
 */
export default function CardScreen() {
  const { holes, next, isLoading, error } = useHoles()
  const releases = useReleases()

  return (
    <Screen refreshing={releases.isRefetching} onRefresh={() => releases.refetch()}>
      <View style={styles.wrap}>
        <Box>
          <Face>
            <View style={styles.gap8}>
              <InkText variant="panelTitle" accessibilityRole="header">
                The Card
              </InkText>
              <InkText variant="specLine">Six holes · 2027</InkText>
            </View>
            <InkText variant="bodyLong">
              Hole 1 is the core cap, always in stock. Each hole after it is one numbered color, released on its date and not remade.
            </InkText>
          </Face>
          {next ? <NextHoleFace hole={next} /> : null}
          {isLoading ? (
            <Face>
              <LoadingState />
            </Face>
          ) : null}
          {error && !holes.length ? (
            <Face>
              <ErrorState error={error} onRetry={() => releases.refetch()} />
            </Face>
          ) : null}
          {holes.length ? (
            <Face padded={false}>
              <View style={styles.head} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <InkText variant="scoreLabel" style={styles.headNo}>
                  Hole
                </InkText>
                <InkText variant="scoreLabel" style={styles.headText}>
                  Color · date · edition
                </InkText>
              </View>
              {holes.map((h, i) => (
                <HoleRow key={h.number} hole={h} last={i === holes.length - 1} />
              ))}
            </Face>
          ) : null}
        </Box>
      </View>
    </Screen>
  )
}

/** The next hole on its own face, inked in its edition's colours. */
function NextHoleFace({ hole }: { hole: Hole }) {
  const live = hole.status === "live"
  const ink = inkFor(hole.colourway)
  return (
    <Face ink={ink}>
      {hole.image ? <Window source={hole.image} alt={`${hole.name} rope cap`} aspectRatio={4 / 3} /> : null}
      <View style={styles.gap8}>
        <InkText variant="panelTitle" accessibilityRole="header">
          {hole.name}
        </InkText>
        <InkText variant="specLine">
          No. {pad2(hole.number)} · {live ? "Live now" : "Next hole"}
          {hole.editionSize ? ` · Edition of ${hole.editionSize}` : ""}
        </InkText>
        <InkText variant="meta">{holeDate(hole.releaseAt ?? hole.dateIso)}</InkText>
      </View>
      {!live && hole.releaseAt ? <Countdown target={hole.releaseAt} inverse={ink.ink.toUpperCase() === colors.paper} /> : null}
      {live && hole.product?.handle ? (
        <Button
          title={`Shop ${hole.name}${hole.price != null ? ` · ${formatMoney(hole.price)}` : ""}`}
          variant="ink"
          size="large"
          onPress={() => {
            trackTap("hero_shop_drop", { hole: hole.number })
            router.push(`/products/${hole.product!.handle}`)
          }}
        />
      ) : hole.release ? (
        <TeeSheet
          releaseId={hole.release.id}
          hole={hole.number}
          name={hole.name}
          inverse={ink.ink.toUpperCase() === colors.paper}
          showEyebrow={false}
        />
      ) : null}
    </Face>
  )
}

/**
 * One hole as a scorecard row: the number in tight figures, a small window
 * onto the edition, the name, then date, edition and status in the meta line.
 * The action follows the hole's phase.
 */
function HoleRow({ hole, last }: { hole: Hole; last: boolean }) {
  const ink = usePanelInk()
  const [teeSheet, setTeeSheet] = useState(false)
  const isCore = hole.number === 1
  const tappable = isCore || !!hole.handle
  const open = () => {
    trackTap("card_hole", { hole: hole.number })
    if (isCore) router.push("/products/rope-cap")
    else if (hole.handle) router.push(`/card/${hole.handle}`)
  }
  const meta = [
    isCore ? "Always in stock" : holeDate(hole.dateIso),
    !isCore && hole.editionSize
      ? hole.status === "live" && hole.left != null
        ? `${hole.left} of ${hole.editionSize} left`
        : `Edition of ${hole.editionSize}`
      : null,
    isCore ? null : STATUS[hole.status],
    hole.price != null ? formatMoney(hole.price) : null,
  ].filter(Boolean)
  return (
    <View style={[styles.row, !last && { borderBottomWidth: 2, borderBottomColor: ink.ink }]}>
      <Pressable
        accessibilityRole={tappable ? "link" : undefined}
        accessibilityLabel={`Hole ${hole.number}, ${hole.name}, ${meta.join(", ")}`}
        disabled={!tappable}
        onPress={open}
        style={({ pressed }) => [styles.rowMain, pressed && { opacity: 0.7 }]}>
        <Digits value={pad2(hole.number)} variant="holeNumber" style={styles.no} inked={false} />
        <View style={styles.thumb}>
          {hole.image && hole.status !== "announced" ? <Image source={hole.image} style={styles.thumbImage} contentFit="contain" /> : null}
        </View>
        <View style={styles.flex}>
          <InkText variant="cardTitle" numberOfLines={1}>
            {hole.name}
          </InkText>
          <InkText variant="caption" numberOfLines={2}>
            {meta.join(" · ")}
          </InkText>
        </View>
        {tappable ? <Ionicons name="chevron-forward" size={18} color={ink.ink} /> : null}
      </Pressable>
      {hole.status === "live" && !isCore ? (
        <Button
          title={`Shop ${hole.name}`}
          variant="outlineBlack"
          size="small"
          onPress={() => router.push(`/products/${hole.product?.handle ?? "rope-cap"}`)}
        />
      ) : hole.status === "upcoming" && hole.release ? (
        teeSheet ? (
          <TeeSheet releaseId={hole.release.id} hole={hole.number} name={hole.name} showEyebrow={false} />
        ) : (
          <Button title="Join the tee sheet" variant="outlineBlack" size="small" onPress={() => setTeeSheet(true)} />
        )
      ) : hole.status === "announced" ? (
        <InkText variant="caption" muted>
          Details closer to the date.
        </InkText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 12 },
  gap8: { gap: 8 },
  flex: { flex: 1, gap: 2 },
  head: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.ink,
    backgroundColor: colors.ink,
  },
  headNo: { width: 108, color: colors.paper },
  headText: { color: colors.paper },
  row: { paddingHorizontal: 20, paddingVertical: 14, gap: 10 },
  rowMain: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56 },
  no: { width: 44 },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.paper,
    overflow: "hidden",
  },
  thumbImage: { position: "absolute", top: "8%", left: "8%", right: "8%", bottom: "8%" },
})
