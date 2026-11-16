import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"

import { colors } from "@/constants/theme"

import { Text } from "./text"

/** A fact block (APP_SPEC v8): an #F6F6F6 tile, a green eyebrow over one line of body. */
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
      <Text variant="eyebrowSm">{eyebrow}</Text>
      {body ? <Text variant="bodyPdp">{body}</Text> : null}
      {children}
    </View>
  )
}

/** The three true facts (web G.6.1). */
export const VALUE_TILES = [
  { eyebrow: "One size, adjustable", body: "The strap fits 21.5–23.75 in (55–60 cm). The crown sits mid, about 11–11.5 cm." },
  { eyebrow: "Always in stock", body: "Four core colors that never run out. We show the live count for each." },
  { eyebrow: "Free shipping on $85+", body: "Any two caps ship free. Under $85, standard shipping is $6. 30-day returns." },
]

const styles = StyleSheet.create({ tile: { backgroundColor: colors.tile, padding: 20, gap: 6 } })
