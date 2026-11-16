import { Pressable, StyleSheet, View } from "react-native"

import { colors } from "@/constants/theme"
import { isLightSwatch, swatchParts } from "@/lib/swatches"

const SIZE = 42

/** The swatch dot: one fill, or two half circles rotated 45° for "A / B". */
function SwatchFill({ name, size }: { name: string; size: number }) {
  const parts = swatchParts(name)
  const light = isLightSwatch(name)
  return (
    <View
      style={[
        styles.fill,
        { width: size, height: size, borderRadius: size / 2 },
        light && styles.lightRing,
      ]}>
      {parts.length === 2 ? (
        <View style={[styles.split, { transform: [{ rotate: "45deg" }] }]}>
          <View style={[styles.half, { backgroundColor: parts[0] }]} />
          <View style={[styles.half, { backgroundColor: parts[1] }]} />
        </View>
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: parts[0] }]} />
      )}
    </View>
  )
}

/**
 * A 42pt colour circle (APP_SPEC §3): 1pt ring that turns black when
 * selected, 1pt padding, a diagonal strike when sold out. Sold-out colours
 * stay pressable so shoppers can still see the photos.
 */
export function Swatch({
  name,
  selected = false,
  soldOut = false,
  onPress,
  size = SIZE,
}: {
  name: string
  selected?: boolean
  soldOut?: boolean
  onPress?: () => void
  size?: number
}) {
  const inner = size - 4
  const body = (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }, selected && styles.ringOn]}>
      <SwatchFill name={name} size={inner} />
      {soldOut ? (
        <View pointerEvents="none" style={[styles.strike, { width: size * 1.1, transform: [{ rotate: "-45deg" }] }]} />
      ) : null}
    </View>
  )
  if (!onPress) return body
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${name}${soldOut ? ", sold out" : ""}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      hitSlop={4}>
      {body}
    </Pressable>
  )
}

/** Swatches in rows of 7 with a 9pt gap. */
export function SwatchGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 1,
    borderColor: "transparent",
    padding: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ringOn: { borderColor: colors.primary },
  fill: { overflow: "hidden", backgroundColor: colors.tile },
  lightRing: { borderWidth: 1, borderColor: colors.line },
  split: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "row" },
  half: { flex: 1 },
  strike: { position: "absolute", height: 1, backgroundColor: colors.primary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
})
