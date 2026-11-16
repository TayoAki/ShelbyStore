import { router } from "expo-router"
import { useState } from "react"
import { StyleSheet, View } from "react-native"

import { Box, inkFor } from "@/components/box"
import { CloseFace, crownRange, HolesFace, SideFace, SleeveFace, StoryFace } from "@/components/box-faces"
import { Button } from "@/components/button"
import { FrontFace } from "@/components/front-panel"
import { Screen } from "@/components/screen"
import { ErrorState, Skeleton } from "@/components/state-views"
import { colourwayOf, CORE_COLOURWAYS } from "@/constants/theme"
import { useHoles } from "@/hooks/use-holes"
import { useCatalog, useContentSeries } from "@/hooks/use-products"
import { useQuickAdd } from "@/hooks/use-quick-add"
import { trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { openWeb } from "@/lib/links"
import { TurnFace } from "@/lib/motion"
import { capsIn, colorCounts, imagesFor, offersFor, productPrice, type Product } from "@/lib/product"

/**
 * Home (APP_SPEC v7 §5): the box printed flat. The front face (window, model,
 * meta line, ink stripes, price and Add to bag) is the first screen; scrolling
 * turns the box to its side face (the crown on the ruler, the spec), then the
 * back: the six holes, the Pair and Foursome sleeves, the story, the bottom flap.
 * One rope line runs through every face in the chosen colourway's rope colour.
 */
export default function HomeScreen() {
  const catalog = useCatalog()
  const { next, holes } = useHoles()
  const series = useContentSeries()
  const core = catalog.data?.find((p) => p.handle === "rope-cap")
  const offers = offersFor(catalog.data ?? [], "rope-cap")
  const story = series.data?.find((x) => x.handle === "crown-test") ?? series.data?.[0] ?? null
  const [colour, setColour] = useState<string>(CORE_COLOURWAYS[0])

  return (
    <Screen ticker refreshing={catalog.isRefetching} onRefresh={() => catalog.refetch()}>
      {catalog.error && !catalog.data ? <ErrorState error={catalog.error} onRetry={() => catalog.refetch()} /> : null}
      {core ? (
        <View style={styles.wrap}>
          <Box rope={colourwayOf(colour).rope}>
            <HomeFront core={core} colour={colour} onSelect={setColour} pair={offers.find((o) => capsIn(o) === 2) ?? null} />
            <TurnFace>
              <SideFace product={core} colour={colour} />
            </TurnFace>
            <HolesFace holes={holes} next={next} />
            {offers
              .slice()
              .sort((a, b) => capsIn(a) - capsIn(b))
              .map((o) => (
                <SleeveFace key={o.id} offer={o} />
              ))}
            {story ? <StoryFace title={story.title} stance={story.stance ?? ""} handle={story.handle} /> : null}
            <CloseFace hole={next ?? holes.find((h) => h.status === "upcoming") ?? null} />
          </Box>
        </View>
      ) : (
        <Skeleton style={styles.skeleton} />
      )}
    </Screen>
  )
}

function HomeFront({
  core,
  colour,
  onSelect,
  pair,
}: {
  core: Product
  colour: string
  onSelect: (c: string) => void
  pair: Product | null
}) {
  const quick = useQuickAdd()
  const counts = colorCounts(core)
  const stock = counts.find((c) => c.color === colour) ?? null
  const price = productPrice(core)
  const pairPrice = pair ? productPrice(pair) : null
  const cm = crownRange(core)
  return (
    <FrontFace
      title={core.title ?? "The Rope Cap"}
      meta={`No.\u00A001 · Core · Mid crown${cm ? ` ${cm[0] === cm[1] ? cm[0] : `${cm[0]}\u2060–\u2060${cm[1]}`}\u00A0cm` : ""} · One\u00A0size`}
      colourways={CORE_COLOURWAYS}
      colour={colour}
      onSelect={(c) => {
        trackTap("shop_by_color", { color: c })
        onSelect(c)
      }}
      images={imagesFor(core, colour)}
      ink={inkFor(colour)}
      price={price}
      stock={stock ? { state: stock.state, quantity: stock.quantity } : null}
      soldOut={counts.filter((c) => c.state === "sold_out").map((c) => c.color)}
      pending={quick.pending !== null}
      onAdd={() => {
        trackTap("add_to_cart")
        void quick.addColour(core, colour, "app_home")
      }}>
      <View style={styles.links}>
        {pair && pairPrice ? (
          <Button
            title={`Any two ship free. The Pair is ${formatMoney(pairPrice.amount, pairPrice.currency)}`}
            variant="link"
            onPress={() => {
              trackTap("hero_shop_pair")
              router.push(`/offer/${pair.handle}` as never)
            }}
          />
        ) : null}
        <View style={styles.linkRow}>
          <Button
            title="Full details"
            variant="link"
            onPress={() => {
              trackTap("core_product")
              router.push({ pathname: "/products/[handle]", params: { handle: "rope-cap", color: colour } })
            }}
          />
          <Button
            title="Fit guide"
            variant="link"
            onPress={() => {
              trackTap("fit_guide")
              openWeb("/fit-guide")
            }}
          />
          <Button
            title="Which color? Take the quiz"
            variant="link"
            onPress={() => {
              trackTap("home_quiz")
              openWeb("/quiz")
            }}
          />
        </View>
      </View>
    </FrontFace>
  )
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 12 },
  skeleton: { height: 520, marginHorizontal: 12 },
  links: { gap: 0 },
  linkRow: { flexDirection: "row", flexWrap: "wrap", columnGap: 18 },
})
