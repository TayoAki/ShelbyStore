import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"

import { colors, radius } from "@/constants/theme"

import { Text } from "./text"

/** Allbirds' value tile (APP_SPEC v5 §3): white, radius 16, eyebrow + body. */
export function ValueTile({
  eyebrow,
  body,
  children,
  style,
}: {
  eyebrow: string
  body?: string
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View style={[styles.tile, style]}>
      <Text variant="eyebrow">{eyebrow}</Text>
      {body ? <Text variant="body">{body}</Text> : null}
      {children}
    </View>
  )
}

/** The three true facts (web G.6.1). */
export const VALUE_TILES = [
  {
    eyebrow: "One size, adjustable",
    body: "The strap fits 21.5–23.75 in (55–60 cm). The crown sits mid, about 11–11.5 cm.",
  },
  { eyebrow: "Always in stock", body: "Four core colors that never run out. We show the live count for each." },
  { eyebrow: "Free shipping on $85+", body: "Any two caps ship free. Under $85, standard shipping is $6. 30-day returns." },
]

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 20,
    gap: 20,
  },
})
