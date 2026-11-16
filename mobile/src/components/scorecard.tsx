import { useEffect } from "react"
import { StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated"

import { colors, ease, golf, motion, radius } from "@/constants/theme"
import { pad2 } from "@/lib/holes"
import { POLICY } from "@/lib/policy"
import { detailsOf, ropeNameFor, type Product } from "@/lib/product"

import { Text } from "./text"

export type ScoreRow = { label: string; value: string }

/**
 * The scorecard spec table (APP_SPEC G.3, web G.5.2): a bordered table with a
 * golf-green head row, rows numbered like holes. Missing values are dropped
 * and the numbering closes up. Rows stagger in (M35) once `play` is true.
 */
export function Scorecard({ title, rows, play = true }: { title: string; rows: ScoreRow[]; play?: boolean }) {
  const filled = rows.filter((r) => r.value && r.value.trim())
  return (
    <View style={styles.table} accessibilityLabel={`${title} specs`}>
      <View style={styles.head}>
        <Text variant="scoreLabel" tone="inverse" style={styles.noCol}>
          No.
        </Text>
        <Text variant="scoreLabel" tone="inverse" style={styles.labelCol}>
          Spec
        </Text>
        <Text variant="kicker" tone="inverse" style={styles.valueCol} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {filled.map((row, i) => (
        <Row key={row.label} index={i} row={row} play={play} />
      ))}
    </View>
  )
}

function Row({ index, row, play }: { index: number; row: ScoreRow; play: boolean }) {
  const reduce = useReducedMotion()
  const o = useSharedValue(reduce ? 1 : 0)
  useEffect(() => {
    if (!play) return
    o.value = withDelay(index * 50, withTiming(1, { duration: 800, easing: ease.sineOut, reduceMotion: motion.reduceMotion }))
  }, [index, o, play])
  const style = useAnimatedStyle(() => ({ opacity: o.value }))
  return (
    <Animated.View style={[styles.row, style]} accessible accessibilityLabel={`${row.label}: ${row.value}`}>
      <View style={styles.noCell}>
        <Text variant="scoreNumber" tone="muted">
          {pad2(index + 1)}
        </Text>
      </View>
      <View style={styles.labelCell}>
        <Text variant="scoreLabel">{row.label}</Text>
      </View>
      <View style={styles.valueCell}>
        <Text variant="body">{row.value}</Text>
      </View>
    </Animated.View>
  )
}

/** The Rope Cap's rows in the fixed order of web G.5.2. */
export function productScoreRows(
  product: Product,
  colourway: string | null,
  edition?: { size: number | null; left: number | null } | null
): ScoreRow[] {
  const d = Object.fromEntries(detailsOf(product))
  const rope = ropeNameFor(product, colourway)
  const editionValue =
    edition?.size != null
      ? `Edition of ${edition.size}${edition.left != null ? ` · ${edition.left} left` : ""}`
      : ""
  return [
    { label: "Crown", value: d.Crown ?? "" },
    { label: "Panels", value: d.Panels ?? "" },
    { label: "Rope", value: d.Rope ? `${d.Rope}${rope ? ` · ${rope}` : ""}` : "" },
    { label: "Brim", value: d.Brim ?? "" },
    { label: "Closure", value: d.Closure ?? "" },
    { label: "Fabric", value: d.Fabric ?? "" },
    { label: "Sweatband", value: d.Sweatband ?? "" },
    { label: "Fit", value: `One size · ${POLICY.oneSize.replace(/^fits /, "")}` },
    { label: "Origin", value: d.Origin ?? "" },
    { label: "Edition", value: editionValue },
  ]
}

const NO = 44
const LABEL = 104

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  head: { height: 40, backgroundColor: golf.green, flexDirection: "row", alignItems: "center" },
  noCol: { width: NO, paddingHorizontal: 6, letterSpacing: 1 },
  labelCol: { width: LABEL, paddingHorizontal: 14 },
  valueCol: { flex: 1, paddingHorizontal: 14 },
  row: { minHeight: 44, flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.black },
  noCell: { width: NO, paddingVertical: 12, paddingHorizontal: 8 },
  labelCell: {
    width: LABEL,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(33,33,33,.2)",
  },
  valueCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(33,33,33,.2)",
  },
})
