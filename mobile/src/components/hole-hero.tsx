import type { ReactNode } from "react"
import { StyleSheet, useWindowDimensions, View } from "react-native"

import { colors, MAX_CONTENT_WIDTH } from "@/constants/theme"
import { pad2 } from "@/lib/holes"

import { Text } from "./text"
import { Tile } from "./tile"

/**
 * The Card's editorial block (APP_SPEC v8 V8.5 §5): a square tile (the
 * edition photo, or #F6F6F6 with the hole numeral when there is none yet),
 * then a #F6F6F6 text block with the eyebrow, the hole's name in Monomakh,
 * the date and whatever the phase calls for (countdown and tee sheet, Shop,
 * or the played line).
 */
export function HoleHero({
  number,
  name,
  image,
  eyebrow,
  date,
  children,
}: {
  number: number | null
  name: string
  image: string | null
  eyebrow: string
  date?: string | null
  children?: ReactNode
}) {
  const { width } = useWindowDimensions()
  const side = Math.min(width, MAX_CONTENT_WIDTH)
  return (
    <View>
      <View style={{ width: side, height: side }}>
        <Tile source={image} alt={image ? `${name} rope cap` : undefined} aspectRatio={1} inset={0.1} />
        {!image && number ? (
          <View style={[StyleSheet.absoluteFill, styles.centre]} pointerEvents="none">
            <Text variant="holeNumeral" style={styles.numeral}>
              {pad2(number)}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.text}>
        <Text variant="eyebrowSm">{eyebrow}</Text>
        <Text variant="displayXl" accessibilityRole="header">
          {name}
        </Text>
        {date ? (
          <Text variant="meta" tone="muted">
            {date}
          </Text>
        ) : null}
        {children ? <View style={styles.actions}>{children}</View> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  centre: { alignItems: "center", justifyContent: "center" },
  numeral: { color: colors.green },
  text: { backgroundColor: colors.tile, padding: 24, gap: 8 },
  actions: { marginTop: 12, gap: 14 },
})
