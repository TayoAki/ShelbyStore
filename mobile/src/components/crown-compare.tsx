import { useState } from "react"
import { StyleSheet, View } from "react-native"
import Svg, { G, Line, Path, Text as SvgText } from "react-native-svg"

import { colourwayOf, fonts } from "@/constants/theme"

import { InkText, usePanelInk } from "./box"

/** A cap's side profile in centimetres, front of the crown at x = 0, baseline y = 0, y up. */
function profile(h: number) {
  return {
    crown: `M 0 0 C 0.2 ${h * 0.55} 3.5 ${h} 8.5 ${h} C 13.5 ${h} 16.8 ${h * 0.6} 17 0 Z`,
    brim: "M 0.6 0.2 C -2.5 0.6 -5 0 -7 -0.9 L -7 -1.4 C -4.8 -0.7 -2.2 -0.25 0.6 -0.3 Z",
    rope: `M 0.35 ${Math.min(1.4, h * 0.12)} C 2 ${Math.min(1.9, h * 0.16)} 4 ${Math.min(1.8, h * 0.15)} 6 ${Math.min(1.5, h * 0.13)}`,
  }
}

const LEFT = -11.8 // cm: room for the ruler and its figures before the brim tip
const RIGHT = 17.6
const TOP = 13
const BOTTOM = -1.8

/**
 * The side panel's measured drawing: the Rope Cap's side profile, filled in
 * the chosen colourway with its rope, standing on one baseline against a 12 cm
 * high crown drawn dashed behind it, beside a centimetre ruler. Drawn in
 * proportion so both crowns share one scale; sized to sit under the front panel.
 */
export function CrownCompare({ colour, cm }: { colour: string | null; cm: [number, number] }) {
  const ink = usePanelInk()
  const [w, setW] = useState(0)
  const cap = colourwayOf(colour)
  const s = w ? Math.min(13, w / (RIGHT - LEFT)) : 0
  const height = (TOP - BOTTOM) * s
  const X = (x: number) => (x - LEFT) * s
  const Y = (y: number) => (TOP - y) * s
  const high = profile(12)
  const ours = profile(cm[1])
  const t = `translate(${X(0)} ${Y(0)}) scale(${s} ${-s})`

  return (
    <View style={styles.wrap} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {s ? (
        <Svg
          width={w}
          height={height}
          accessible
          accessibilityLabel={`The Rope Cap's crown, ${cm[0]} to ${cm[1]} centimetres, drawn on one ruler against a 12 centimetre high crown`}>
          {/* ruler: a tick every centimetre, numbered every two */}
          <Line x1={X(-9.2)} y1={Y(0)} x2={X(-9.2)} y2={Y(12.6)} stroke={ink.ink} strokeWidth={1.5} />
          {Array.from({ length: 13 }, (_, i) => (
            <G key={i}>
              <Line x1={X(-9.2)} x2={X(i % 2 ? -8.6 : -8.2)} y1={Y(i)} y2={Y(i)} stroke={ink.ink} strokeWidth={1.2} />
              {i % 2 === 0 ? (
                <SvgText x={X(-9.6)} y={Y(i) + 4} fontSize={11} fill={ink.ink} textAnchor="end" fontFamily={fonts.label}>
                  {i}
                </SvgText>
              ) : null}
            </G>
          ))}
          {/* the shared baseline */}
          <Line x1={X(-9.2)} x2={X(RIGHT)} y1={Y(0)} y2={Y(0)} stroke={ink.ink} strokeWidth={2} />
          {/* the 12 cm high crown, dashed, behind */}
          <Line x1={X(-8.2)} x2={X(RIGHT)} y1={Y(12)} y2={Y(12)} stroke={ink.ink} strokeWidth={1} strokeDasharray="3 4" opacity={0.6} />
          <G transform={t}>
            <Path d={high.crown} fill="none" stroke={ink.ink} strokeWidth={1.6 / s} strokeDasharray={`${4 / s} ${3 / s}`} />
          </G>
          {/* the Rope Cap, in the chosen ink, in front */}
          <Line x1={X(-8.2)} x2={X(RIGHT)} y1={Y(cm[1])} y2={Y(cm[1])} stroke={ink.ink} strokeWidth={1} opacity={0.6} />
          <G transform={t}>
            <Path d={ours.crown} fill={cap.crown} stroke={ink.ink} strokeWidth={2 / s} />
            <Path d={ours.brim} fill={cap.crown} stroke={ink.ink} strokeWidth={2 / s} />
            <Path d={ours.rope} fill="none" stroke={cap.rope} strokeWidth={4 / s} strokeLinecap="round" />
          </G>
        </Svg>
      ) : null}
      <View style={styles.legend}>
        <View style={styles.flex}>
          <InkText variant="label">High crown</InkText>
          <InkText variant="meta">12 cm, published spec</InkText>
        </View>
        <View style={styles.flex}>
          <InkText variant="label">The Rope Cap</InkText>
          <InkText variant="meta">
            {cm[0] === cm[1] ? cm[0] : `${cm[0]}–${cm[1]}`} cm
            {colour ? `, ${colour}` : ""}
          </InkText>
        </View>
      </View>
      <InkText variant="caption" muted>
        Both drawn on one ruler, in proportion.
      </InkText>
    </View>
  )
}

const styles = StyleSheet.create({ wrap: { gap: 12, width: "100%" }, legend: { flexDirection: "row", gap: 16 }, flex: { flex: 1, gap: 2 } })
