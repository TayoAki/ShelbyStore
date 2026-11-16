import { Image } from "expo-image"
import { router } from "expo-router"
import { Pressable, StyleSheet, View } from "react-native"

import { colors, colourwaySlug } from "@/constants/theme"
import { holeDay, type Hole } from "@/hooks/use-holes"
import { trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { openWeb } from "@/lib/links"
import { POLICY } from "@/lib/policy"
import { capsIn, crownCmOf, detailsOf, hatImage, productPrice, type Product } from "@/lib/product"

import { BOARD_INK, Digits, Face, InkText, Plate, usePanelInk, type Ink } from "./box"
import { Button } from "./button"
import { Countdown } from "./countdown"
import { CrownCompare } from "./crown-compare"
import { TeeSheet } from "./notify-me"

const ORDER = ["Crown", "Panels", "Rope", "Brim", "Closure", "Fabric", "Sweatband", "Care"]

/** "11–11.5" → [11, 11.5]; a single value repeats. */
export function crownRange(product: Product): [number, number] | null {
  const cm = crownCmOf(product)
  if (!cm) return null
  const nums = cm
    .split(/[–-]/)
    .map((x) => Number.parseFloat(x.trim()))
    .filter((n) => Number.isFinite(n))
  return nums.length ? [nums[0], nums[nums.length - 1]] : null
}

/**
 * The side face (APP_SPEC v7 §5.2): the heading, the crown drawn against a
 * 12 cm high crown on one ruler, then the printed spec as units on a keylined plate.
 */
export function SideFace({ product, colour }: { product: Product; colour: string | null }) {
  const cm = crownRange(product)
  const details = Object.fromEntries(detailsOf(product))
  const rows = [...ORDER.filter((k) => details[k]).map((k) => [k, details[k]] as const), ["Fit", `One size, ${POLICY.oneSize}`] as const]
  return (
    <Face ink={BOARD_INK}>
      <View style={styles.gap8}>
        <InkText variant="panelTitle" accessibilityRole="header">
          The crown sits lower.
        </InkText>
        <InkText variant="bodyLong">
          The rope caps that sell best are built high, and their buyers say the height takes getting used to. The Rope Cap is cut to a mid
          crown, about {crownCmOf(product) ?? "11–11.5"} cm, so it sits on your head the first time you put it on.
        </InkText>
      </View>
      {cm ? <CrownCompare colour={colour} cm={cm} /> : null}
      <Plate columns={1}>
        {rows.map(([k, v]) => (
          <View key={k} style={styles.unit}>
            <InkText variant="label">{k}</InkText>
            <InkText variant="body">{v}</InkText>
          </View>
        ))}
      </Plate>
    </Face>
  )
}

/**
 * The back face, part one: the six holes as numbered units on one keylined
 * plate, then the next hole with its real countdown and tee sheet.
 */
export function HolesFace({ holes, next }: { holes: Hole[]; next: Hole | null }) {
  return (
    <Face ink={BOARD_INK}>
      <View style={styles.gap8}>
        <InkText variant="panelTitle" accessibilityRole="header">
          Six holes in 2027.
        </InkText>
        <InkText variant="bodyLong">
          Hole 1 is the cap, always in stock. Each hole after it is one numbered color on a date of the golf season, and we don&apos;t
          remake it.
        </InkText>
      </View>
      <Plate columns={2}>
        {holes.map((h) => (
          <HoleUnit key={h.number} hole={h} />
        ))}
      </Plate>
      {next?.release && next.releaseAt ? (
        <View style={styles.next}>
          <InkText variant="cardTitle">
            Hole {next.number}, {next.name}: {holeDay(next.releaseAt)}
          </InkText>
          <Countdown target={next.releaseAt} small />
          <TeeSheet releaseId={next.release.id} hole={next.number} name={next.name} showEyebrow={false} />
        </View>
      ) : null}
      <Button
        title="The Card"
        variant="outlineBlack"
        onPress={() => {
          trackTap("home_scorecard")
          router.push("/card")
        }}
      />
    </Face>
  )
}

function HoleUnit({ hole: h }: { hole: Hole }) {
  const live = h.status === "live" && h.number > 1
  const go = () => {
    trackTap("card_hole", { hole: h.number })
    if (h.number === 1) router.push("/products/rope-cap")
    else if (h.status === "live" && h.product?.handle) router.push(`/products/${h.product.handle}`)
    else if (h.handle) router.push(`/card/${h.handle}`)
  }
  const tappable = h.number === 1 || !!h.handle || !!h.product
  const status = h.number === 1 ? "Always in stock" : h.status === "announced" ? "Date to come" : (holeDay(h.releaseAt ?? h.dateIso) ?? "")
  return (
    <Pressable
      accessibilityRole={tappable ? "link" : undefined}
      accessibilityLabel={`Hole ${h.number}, ${h.name}, ${status}`}
      disabled={!tappable}
      onPress={go}
      style={({ pressed }) => [styles.hole, live && { backgroundColor: colors.stripeTint }, pressed && { opacity: 0.7 }]}>
      <Digits value={String(h.number).padStart(2, "0")} variant="holeNumber" inked={false} />
      <InkText variant="cardTitle">{h.name}</InkText>
      <InkText variant="caption" muted>
        {status}
        {h.editionSize && h.number > 1 ? ` · Edition of ${h.editionSize}` : ""}
      </InkText>
    </Pressable>
  )
}

const SLEEVE_INK: Ink = { panel: colors.ink, ink: colors.paper, edge: colors.ink }
const PAIR_INK: Ink = { panel: colors.pine, ink: colors.pineInk, edge: colors.ink }

/**
 * The back face, part two: The Pair and The Foursome as inked sleeves, two or
 * four die-cut windows in a row, the price and its action at the sleeve's foot.
 */
export function SleeveFace({ offer, track = {} }: { offer: Product; track?: Record<string, string> }) {
  const caps = capsIn(offer)
  const four = caps >= 4
  const price = productPrice(offer)
  const colours = four ? ["Tour White", "Clubhouse Navy", "Pine", "Fescue"] : ["Clubhouse Navy", "Pine"]
  const go = () => {
    trackTap(four ? "home_foursome" : "home_pair", track)
    router.push(`/offer/${offer.handle}` as never)
  }
  return (
    <Face ink={four ? SLEEVE_INK : PAIR_INK}>
      <View style={styles.gap8}>
        <InkText variant="panelTitle" accessibilityRole="header">
          {four ? "The Foursome" : "The Pair"}
        </InkText>
        <InkText variant="bodyLong">
          {four ? "Four caps for the group trip, the outing or Father's Day." : "Any two colors. One for the bag, one for the car."}
        </InkText>
      </View>
      <SleeveWindows colours={colours} />
      <View style={styles.sleeveFoot}>
        {price ? <Digits value={formatMoney(price.amount, price.currency)} /> : null}
        <InkText variant="label" style={styles.flex}>
          {price ? `${formatMoney(price.amount / caps)} a cap · ships free` : "Ships free"}
        </InkText>
      </View>
      <Button title="Choose colors" variant="ink" size="large" onPress={go} />
    </Face>
  )
}

function SleeveWindows({ colours }: { colours: string[] }) {
  const ink = usePanelInk()
  return (
    <View style={styles.sleeveRow}>
      {colours.map((c) => (
        <View key={c} style={[styles.sleeveWindow, { borderColor: ink.ink }]}>
          <Image
            source={hatImage(`rope-cap-${colourwaySlug(c)}-1.jpg`)}
            style={styles.sleeveImage}
            contentFit="contain"
            accessibilityLabel={`The Rope Cap in ${c}`}
            accessible
          />
        </View>
      ))}
    </View>
  )
}

/** The story face: the content series' stance beside its photo window. */
export function StoryFace({ title, stance, handle }: { title: string; stance: string; handle: string }) {
  const ink = usePanelInk()
  return (
    <Face ink={BOARD_INK}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={title}
        onPress={() => {
          trackTap("home_story")
          openWeb(`/stories/${handle}`)
        }}
        style={[styles.storyWindow, { borderColor: ink.edge }]}>
        <Image
          source={hatImage("story-crush.jpg")}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          accessibilityLabel="A cap folded into a back pocket"
          accessible
        />
      </Pressable>
      <View style={styles.gap8}>
        <InkText variant="panelTitle" accessibilityRole="header">
          {title}
        </InkText>
        <InkText variant="bodyLong">{stance}</InkText>
      </View>
      <View style={styles.row}>
        <Button
          title="See the full test"
          variant="outlineBlack"
          style={styles.flex}
          onPress={() => {
            trackTap("series_story")
            openWeb(`/stories/${handle}`)
          }}
        />
        <Button
          title="Six reasons"
          variant="outlineBlack"
          style={styles.flex}
          onPress={() => {
            trackTap("home_reasons")
            openWeb("/reasons/rope-cap")
          }}
        />
      </View>
    </Face>
  )
}

const CLOSE_INK: Ink = { panel: colors.ink, ink: colors.paper, edge: colors.ink }

/** The bottom flap: the next hole's tee sheet and the help links, printed in navy. */
export function CloseFace({ hole }: { hole: Hole | null }) {
  return (
    <Face ink={CLOSE_INK}>
      <InkText variant="panelTitle" accessibilityRole="header">
        One rope cap, properly.
      </InkText>
      {hole?.release ? (
        <View style={styles.gap8}>
          <InkText variant="body">
            Hole {hole.number}, {hole.name}: join the tee sheet and we&apos;ll email you when it goes live.
          </InkText>
          <TeeSheet releaseId={hole.release.id} hole={hole.number} name={hole.name} inverse showEyebrow={false} />
        </View>
      ) : null}
      <View style={styles.links}>
        <Button title="Custom orders" variant="link" inverse onPress={() => (trackTap("footer_custom"), router.push("/custom"))} />
        <Button title="Fit guide" variant="link" inverse onPress={() => openWeb("/fit-guide")} />
        <Button title="Shipping & returns" variant="link" inverse onPress={() => openWeb("/help/shipping-returns")} />
      </View>
    </Face>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: "row", gap: 10 },
  gap8: { gap: 8 },
  unit: { paddingHorizontal: 14, paddingVertical: 12, gap: 2 },
  hole: { minHeight: 132, padding: 14, gap: 4, backgroundColor: colors.paper },
  next: { gap: 12 },
  sleeveRow: { flexDirection: "row", gap: 8 },
  sleeveWindow: { flex: 1, aspectRatio: 1, borderRadius: 18, borderWidth: 2, backgroundColor: colors.paper, overflow: "hidden" },
  sleeveImage: { position: "absolute", top: "8%", left: "8%", right: "8%", bottom: "8%" },
  sleeveFoot: { flexDirection: "row", alignItems: "center", gap: 14 },
  storyWindow: { width: "100%", aspectRatio: 4 / 5, borderRadius: 28, borderWidth: 2, overflow: "hidden", backgroundColor: colors.paper },
  links: { flexDirection: "row", flexWrap: "wrap", columnGap: 20 },
})
