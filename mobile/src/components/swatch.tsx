import { Pressable, StyleSheet, View } from "react-native"

import { colors, colourwayOf } from "@/constants/theme"
import { confirmHaptic } from "@/lib/haptics"

import { Text } from "./text"

/**
 * Eastside's colour dots (APP_SPEC v8 V8.3). Card dots are 20pt with a 1pt
 * #E9E9E9 border (#8C8C8C on light crowns); picker swatches are 32pt in a 44pt
 * hit area, selected shown as a 2pt white gap and a 1pt #212121 ring. The
 * crown colour fills the circle and a rope band runs across its lower third.
 * Sold out is struck through.
 */
export function Swatch({
  name,
  selected = false,
  size = 32,
  soldOut = false,
  caption,
  onPress,
  accessibilityHint,
}: {
  name: string
  selected?: boolean
  /** 32 (picker) or 20 (card dot); 36 is accepted from older call sites. */
  size?: 36 | 32 | 20
  soldOut?: boolean
  /** A date under upcoming numbered editions. */
  caption?: string | null
  onPress?: () => void
  accessibilityHint?: string
}) {
  const cw = colourwayOf(name)
  const d = size === 20 ? 20 : 32
  const dot = (
    <View
      style={[
        styles.dot,
        { width: d, height: d, borderRadius: d / 2, backgroundColor: cw.crown, borderColor: cw.light ? colors.fieldBorder : colors.swatchBorder },
      ]}>
      <View style={[styles.rope, { backgroundColor: cw.rope }]} />
      {soldOut ? <View style={[styles.cross, { backgroundColor: colors.text }]} /> : null}
    </View>
  )
  const body = (
    <View style={styles.wrap}>
      {d === 32 ? (
        <View style={[styles.ring, { width: d + 6, height: d + 6, borderRadius: (d + 6) / 2, borderColor: selected ? colors.text : "transparent" }]}>
          {dot}
        </View>
      ) : (
        dot
      )}
      {caption ? (
        <Text variant="micro" tone="muted">
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
      onPress={() => {
        confirmHaptic()
        onPress()
      }}
      style={styles.hit}>
      {body}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  hit: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  wrap: { alignItems: "center", gap: 4 },
  ring: { borderWidth: 1, alignItems: "center", justifyContent: "center" },
  dot: { borderWidth: 1, overflow: "hidden" },
  rope: { position: "absolute", left: 0, right: 0, top: "62%", height: "14%" },
  cross: { position: "absolute", width: "140%", height: 1, top: "50%", left: "-20%", transform: [{ rotate: "-45deg" }] },
})
