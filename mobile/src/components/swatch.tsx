import { Pressable, StyleSheet, View } from "react-native"

import { colors, colourwayOf } from "@/constants/theme"

import { usePanelInk } from "./box"
import { Text } from "./text"

/**
 * An ink chip (APP_SPEC v7 §3): a printed square of the crown colour with the
 * rope colour across it, the way a ball box prints its colour range. The
 * chosen chip carries a heavy keyline in the face's ink; sold out is struck
 * through. Pressable chips are 44pt targets.
 */
export function Swatch({
  name,
  selected = false,
  size = 36,
  soldOut = false,
  caption,
  onPress,
  accessibilityHint,
}: {
  name: string
  selected?: boolean
  size?: 36 | 20
  soldOut?: boolean
  /** A date under upcoming numbered editions. */
  caption?: string | null
  onPress?: () => void
  accessibilityHint?: string
}) {
  const ink = usePanelInk()
  const cw = colourwayOf(name)
  const body = (
    <View style={styles.wrap}>
      <View style={[styles.ring, { width: size + 10, height: size + 10, borderColor: selected ? ink.ink : "transparent" }]}>
        <View
          style={[
            styles.chip,
            { width: size, height: size, backgroundColor: cw.crown, borderColor: cw.light ? colors.stroke : "transparent" },
          ]}>
          <View style={[styles.rope, { height: size === 36 ? 4 : 3, backgroundColor: cw.rope }]} />
          {soldOut ? <View style={[styles.cross, { backgroundColor: ink.ink }]} /> : null}
        </View>
      </View>
      {caption ? (
        <Text variant="badge" style={{ color: ink.ink }}>
          {caption}
        </Text>
      ) : null}
    </View>
  )
  if (!onPress) return body
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}${soldOut ? ", sold out" : ""}`}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected }}
      hitSlop={6}
      onPress={onPress}
      style={styles.hit}>
      {body}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  hit: { minWidth: 44, minHeight: 44 },
  wrap: { alignItems: "center", gap: 4 },
  ring: { borderWidth: 2.5, alignItems: "center", justifyContent: "center" },
  chip: { borderWidth: 1.5, overflow: "hidden" },
  rope: { position: "absolute", left: 0, right: 0, top: "60%" },
  cross: { position: "absolute", width: "140%", height: 1.5, top: "50%", left: "-20%", transform: [{ rotate: "-45deg" }] },
})
