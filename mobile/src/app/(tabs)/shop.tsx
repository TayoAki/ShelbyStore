import { useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { StyleSheet, View } from "react-native"

import { Box, Face, InkText } from "@/components/box"
import { SleeveFace } from "@/components/box-faces"
import { ColourwayCard, EditionCard } from "@/components/product-card"
import { Screen } from "@/components/screen"
import { SegmentedControl } from "@/components/segmented-control"
import { ErrorState, LoadingState } from "@/components/state-views"
import { colors, CORE_COLOURWAYS } from "@/constants/theme"
import { useHoles } from "@/hooks/use-holes"
import { useCatalog } from "@/hooks/use-products"
import { trackTap } from "@/lib/analytics"
import { capsIn, offersFor } from "@/lib/product"

type Group = "all" | "core" | "limited" | "bundles"

const GROUPS: { value: Group; label: string }[] = [
  { value: "all", label: "All" },
  { value: "core", label: "Core" },
  { value: "limited", label: "Limited" },
  { value: "bundles", label: "Bundles" },
]

/**
 * Shop (APP_SPEC v7 §5.4): the collection as one box. The heading face and
 * the group tabs, then the colourways printed as a sheet of inked cells that
 * share keylines, the numbered editions on a second sheet, then The Pair and
 * The Foursome sleeves. One size, so no filter sheet: colours are the cells.
 */
export default function ShopScreen() {
  const params = useLocalSearchParams<{ group?: string }>()
  const [group, setGroup] = useState<Group>((GROUPS.find((g) => g.value === params.group)?.value as Group) ?? "all")
  const catalog = useCatalog()
  const { holes } = useHoles()
  const core = catalog.data?.find((p) => p.handle === "rope-cap")
  const offers = offersFor(catalog.data ?? [], "rope-cap")
    .slice()
    .sort((a, b) => capsIn(a) - capsIn(b))
  const editions = holes.filter(
    (h) => h.number >= 2 && h.colourway && (h.status === "live" || h.status === "upcoming" || h.status === "sold_out")
  )
  const show = (g: Group) => group === "all" || group === g

  return (
    <Screen refreshing={catalog.isRefetching} onRefresh={() => catalog.refetch()}>
      <View style={styles.wrap}>
        <Box>
          <Face>
            <View style={styles.gap8}>
              <InkText variant="panelTitle" accessibilityRole="header">
                The Rope Cap
              </InkText>
              <InkText variant="specLine">
                {CORE_COLOURWAYS.length} core · {editions.length} numbered · One size
              </InkText>
            </View>
            <InkText variant="bodyLong">
              One mid-crown rope cap in four core colors, and a numbered color for each hole of the season.
            </InkText>
            <SegmentedControl
              scroll
              options={GROUPS}
              value={group}
              onChange={(g) => {
                trackTap("color_pill", { group: g })
                setGroup(g)
              }}
            />
          </Face>

          {catalog.isLoading ? (
            <Face>
              <LoadingState />
            </Face>
          ) : null}
          {catalog.error && !catalog.data ? (
            <Face>
              <ErrorState error={catalog.error} onRetry={() => catalog.refetch()} />
            </Face>
          ) : null}

          {core && show("core") ? (
            <Sheet>
              {CORE_COLOURWAYS.map((c) => (
                <ColourwayCard key={c} product={core} colourway={c} flat />
              ))}
            </Sheet>
          ) : null}

          {show("limited") && editions.length ? (
            <Sheet>
              {editions.map((h) => (
                <EditionCard key={h.number} hole={h} flat />
              ))}
            </Sheet>
          ) : null}
          {group === "limited" && !editions.length ? (
            <Face>
              <InkText variant="bodyLong">No numbered editions are on sale or scheduled right now. The Card has the 2027 dates.</InkText>
            </Face>
          ) : null}

          {show("bundles") ? offers.map((o) => <SleeveFace key={o.id} offer={o} track={{ page_type: "collection" }} />) : null}
        </Box>
      </View>
    </Screen>
  )
}

/** Cells printed two to a row on one sheet: a 2pt rule between them, none doubled. */
function Sheet({ children }: { children: React.ReactNode[] }) {
  const n = children.length
  return (
    <View style={styles.sheet}>
      {children.map((child, i) => (
        <View
          key={i}
          style={[
            styles.cell,
            i % 2 === 0 && i < n - 1 && styles.ruleRight,
            i < n - (n % 2 === 0 ? 2 : 1) && styles.ruleBottom,
            n % 2 === 1 && i === n - 1 && styles.ruleRightLast,
          ]}>
          {child}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 12 },
  gap8: { gap: 8 },
  sheet: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "50%" },
  ruleRight: { borderRightWidth: 2, borderRightColor: colors.ink },
  ruleRightLast: { borderRightWidth: 2, borderRightColor: colors.ink },
  ruleBottom: { borderBottomWidth: 2, borderBottomColor: colors.ink },
})
