import * as Haptics from "expo-haptics"
import { Image, type ImageSource } from "expo-image"
import { Children, createContext, Fragment, useContext, useEffect, useState, type ReactNode } from "react"
import { Platform, Pressable, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type TextStyle, type ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated"

import { BEAT, colors, colourwayOf, ease, motion, radius, type } from "@/constants/theme"

import { Text, type TextVariant } from "./text"

/**
 * The box's parts (APP_SPEC v7 §2): printed panels with a heavy keyline and a
 * second hairline rule inside it, dieline creases, die-cut photo windows,
 * numerals in fixed digit slots, numbered units on one keylined plate, and the
 * ink stripes that choose a colourway. Ink changes ride one beat.
 */

export type Ink = { panel: string; ink: string; edge: string }

export const BOARD_INK: Ink = { panel: colors.paper, ink: colors.ink, edge: colors.ink }

/** The ink a colourway prints its panel in. */
export const inkFor = (colourway: string | null | undefined): Ink => {
  const c = colourwayOf(colourway)
  return { panel: c.panel, ink: c.ink, edge: c.edge }
}

const InkContext = createContext<Ink>(BOARD_INK)
/** The ink of the panel a part sits on (text, rules and buttons read it). */
export const usePanelInk = () => useContext(InkContext)

const timing = { duration: BEAT, easing: ease.box, reduceMotion: motion.reduceMotion }

const RopeContext = createContext<boolean>(false)

/**
 * The flattened box: one outer keyline, square corners, its faces joined at
 * dashed creases (folds). With `rope`, one continuous braided rope line runs
 * down the box's left gutter through every face, in the chosen rope colour.
 */
export function Box({
  children,
  rope,
  style,
}: {
  children: ReactNode
  /** The rope colour of the chosen colourway; omit for a box with no rope line. */
  rope?: string | null
  style?: StyleProp<ViewStyle>
}) {
  const faces = Children.toArray(children).filter(Boolean)
  const [h, setH] = useState(0)
  const twists = rope ? Math.ceil(h / 7) : 0
  const ropeStyle = useAnimatedStyle(() => ({ backgroundColor: withTiming(rope ?? "transparent", timing) }))
  return (
    <RopeContext.Provider value={!!rope}>
      <View style={[styles.box, style]} onLayout={rope ? (e) => setH(e.nativeEvent.layout.height) : undefined}>
        {faces.map((face, i) => (
          <Fragment key={i}>
            {i > 0 ? <Fold /> : null}
            {face}
          </Fragment>
        ))}
        {rope ? (
          <View pointerEvents="none" style={styles.ropeGutter} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Animated.View style={[styles.ropeLine, ropeStyle]} />
            <View style={styles.ropeTwist}>
              {Array.from({ length: twists }, (_, i) => (
                <View key={i} style={styles.ropeBraid} />
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </RopeContext.Provider>
  )
}

/**
 * One face of the box. With `ink` changing (a new colourway), the fill and
 * every part printed on it re-ink together on the beat; Reduce Motion cuts.
 */
export function Face({
  children,
  ink = BOARD_INK,
  style,
  padded = true,
  accessibilityLabel,
  onLayout,
}: {
  children: ReactNode
  ink?: Ink
  style?: StyleProp<ViewStyle>
  padded?: boolean
  accessibilityLabel?: string
  onLayout?: (e: LayoutChangeEvent) => void
}) {
  const rope = useContext(RopeContext)
  const animated = useAnimatedStyle(() => ({ backgroundColor: withTiming(ink.panel, timing) }))
  return (
    <InkContext.Provider value={ink}>
      <Animated.View accessibilityLabel={accessibilityLabel} onLayout={onLayout} style={[animated, style]}>
        <View style={[padded && styles.pad, padded && rope && styles.padRope]}>{children}</View>
      </Animated.View>
    </InkContext.Provider>
  )
}

/** A single printed panel: a box with one face (bag, checkout, sheets, standalone panels). */
export function Panel({
  children,
  ink = BOARD_INK,
  style,
  padded = true,
  accessibilityLabel,
  onLayout,
}: {
  children: ReactNode
  ink?: Ink
  style?: StyleProp<ViewStyle>
  padded?: boolean
  accessibilityLabel?: string
  onLayout?: (e: LayoutChangeEvent) => void
}) {
  return (
    <Box style={style}>
      <Face ink={ink} padded={padded} accessibilityLabel={accessibilityLabel} onLayout={onLayout}>
        {children}
      </Face>
    </Box>
  )
}

/** A fold between two faces: a dashed crease across the box in the base ink. */
function Fold() {
  const [w, setW] = useState(0)
  const n = Math.max(0, Math.floor(w / 10))
  return (
    <View
      style={styles.fold}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {Array.from({ length: n }, (_, i) => (
        <View key={i} style={styles.foldDash} />
      ))}
    </View>
  )
}

/** Text printed in the panel's ink; the colour re-inks with the panel. */
export function InkText({
  variant = "body",
  muted = false,
  style,
  children,
  ...rest
}: {
  variant?: TextVariant
  muted?: boolean
  style?: StyleProp<TextStyle>
  children: ReactNode
  numberOfLines?: number
  accessibilityRole?: "header" | "text"
  accessibilityLabel?: string
}) {
  const ink = usePanelInk()
  const animated = useAnimatedStyle(() => ({ color: withTiming(ink.ink, timing) }))
  return (
    <Animated.Text {...rest} style={[type[variant], animated, muted && styles.muted, style]}>
      {children}
    </Animated.Text>
  )
}

/** A dieline crease: a dashed rule printed in the panel's ink. */
export function Crease({ style }: { style?: StyleProp<ViewStyle> }) {
  const ink = usePanelInk()
  const [w, setW] = useState(0)
  const n = Math.max(0, Math.floor(w / 9))
  return (
    <View
      style={[styles.crease, style]}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {Array.from({ length: n }, (_, i) => (
        <View key={i} style={[styles.dash, { backgroundColor: ink.ink }]} />
      ))}
    </View>
  )
}

/**
 * A die-cut window onto a photo: a rounded cut with its edge printed in the
 * panel's edge ink. The photo cross-fades on the beat when its source changes.
 */
export function Window({
  source,
  alt,
  aspectRatio = 4 / 3,
  style,
  children,
  contentFit = "contain",
}: {
  source: ImageSource | string | null | undefined
  alt: string
  aspectRatio?: number
  style?: StyleProp<ViewStyle>
  children?: ReactNode
  contentFit?: "contain" | "cover"
}) {
  const ink = usePanelInk()
  const reduce = useReducedMotion()
  const edge = useAnimatedStyle(() => ({ borderColor: withTiming(ink.edge, timing) }))
  return (
    <Animated.View style={[styles.window, { aspectRatio }, edge, style]}>
      {source ? (
        <Image
          source={source}
          accessibilityLabel={alt}
          accessible
          style={contentFit === "contain" ? styles.windowImageContain : styles.windowImageCover}
          contentFit={contentFit}
          transition={reduce ? 0 : { duration: BEAT, effect: "cross-dissolve" }}
        />
      ) : null}
      {children}
    </Animated.View>
  )
}

/** Numerals set in fixed, engineered slots (tabular extra-condensed figures). */
export function Digits({
  value,
  variant = "digits",
  style,
  label,
  inked = true,
  tone,
}: {
  value: string | number
  variant?: TextVariant
  style?: StyleProp<TextStyle>
  label?: string
  /** Print in the surrounding panel's ink (re-inks with it). */
  inked?: boolean
  tone?: string
}) {
  const ink = usePanelInk()
  const text = String(value)
  const animated = useAnimatedStyle(() => ({ color: withTiming(tone ?? ink.ink, timing) }))
  if (!inked || tone) {
    return (
      <Text accessibilityLabel={label ?? text} variant={variant} style={[{ color: tone ?? colors.ink }, style]}>
        {text}
      </Text>
    )
  }
  return (
    <Animated.Text accessibilityLabel={label ?? text} style={[type[variant], animated, style]}>
      {text}
    </Animated.Text>
  )
}

/** A printed tag (never a pill): keyline in the ink, or the sleeve-red edition stripe. */
export function Tag({ label, edition = false, style }: { label: string; edition?: boolean; style?: StyleProp<ViewStyle> }) {
  const ink = usePanelInk()
  return (
    <View style={[styles.tag, edition ? styles.tagEdition : { borderColor: ink.ink }, style]}>
      <Text variant="badge" style={{ color: edition ? colors.paper : ink.ink }}>
        {label}
      </Text>
    </View>
  )
}

/** Numbered units ranged on one keylined plate: shared 2pt rules, a short last row simply stops. */
export function Plate({ columns, children, style }: { columns: number; children: ReactNode[]; style?: StyleProp<ViewStyle> }) {
  const ink = usePanelInk()
  return (
    <View style={[styles.plate, { borderColor: ink.ink }, style]}>
      {children.map((child, i) => (
        <View key={i} style={[styles.unit, { width: `${100 / columns}%`, borderColor: ink.ink }]}>
          {child}
        </View>
      ))}
    </View>
  )
}

/**
 * The ink stripes: one printed band per colourway, crown colour with its rope
 * across it. A radio group; the chosen stripe carries a heavy ring in the
 * panel's ink. A selection tap gives a light haptic.
 */
export function InkStripes({
  colourways,
  selected,
  onSelect,
  soldOut = [],
}: {
  colourways: readonly string[]
  selected: string | null
  onSelect: (c: string) => void
  soldOut?: string[]
}) {
  const ink = usePanelInk()
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Color" style={styles.stripes}>
      {colourways.map((c) => {
        const w = colourwayOf(c)
        const on = c === selected
        const out = soldOut.includes(c)
        return (
          <Pressable
            key={c}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={`${c}, ${w.ropeName.toLowerCase()} rope${out ? ", sold out" : ""}`}
            onPress={() => {
              if (on) return
              if (Platform.OS !== "web") void Haptics.selectionAsync().catch(() => undefined)
              onSelect(c)
            }}
            style={[styles.stripeHit, { borderColor: on ? ink.ink : "transparent" }]}>
            <View style={[styles.stripe, { backgroundColor: w.crown, borderColor: `${ink.ink}73` }]}>
              <View style={[styles.stripeRope, { backgroundColor: w.rope }]} />
              {out ? <View style={[styles.strike, { backgroundColor: ink.ink }]} /> : null}
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}

/** A light tap that confirms a bag add on device. */
export function confirmHaptic() {
  if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined)
}

/** Fades an element in on the beat once mounted; already visible under Reduce Motion. */
export function useBeatIn(key: unknown) {
  const reduce = useReducedMotion()
  const o = useSharedValue(1)
  useEffect(() => {
    if (reduce) return
    o.value = 0
    o.value = withTiming(1, timing)
  }, [key, o, reduce])
  return useAnimatedStyle(() => ({ opacity: o.value }))
}

const styles = StyleSheet.create({
  box: { borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.paper, overflow: "hidden" },
  pad: { padding: 20, gap: 16 },
  padRope: { paddingLeft: 30 },
  fold: { flexDirection: "row", height: 2, gap: 4, overflow: "hidden", backgroundColor: "transparent", marginVertical: -1, zIndex: 2 },
  foldDash: { width: 6, height: 2, backgroundColor: colors.ink },
  ropeGutter: { position: "absolute", top: 0, bottom: 0, left: 12, width: 6, overflow: "hidden" },
  ropeLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: "rgba(20,33,61,0.4)",
    borderRightColor: "rgba(255,255,255,0.5)",
  },
  ropeTwist: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, gap: 4 },
  ropeBraid: { height: 3, backgroundColor: "rgba(0,0,0,0.18)", transform: [{ skewY: "-35deg" }] },
  muted: { opacity: 0.82 },
  crease: { flexDirection: "row", height: 2, overflow: "hidden", gap: 4 },
  dash: { width: 5, height: 1.5, opacity: 0.4 },
  window: { width: "100%", backgroundColor: colors.paper, borderRadius: radius.window, borderWidth: 2, overflow: "hidden" },
  windowImageContain: { position: "absolute", top: "6%", left: "6%", right: "6%", bottom: "6%" },
  windowImageCover: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  tag: { alignSelf: "flex-start", minHeight: 26, paddingHorizontal: 8, borderWidth: 1.5, justifyContent: "center" },
  tagEdition: { backgroundColor: colors.stripe, borderColor: colors.stripe },
  plate: { flexDirection: "row", flexWrap: "wrap", borderTopWidth: 2, borderLeftWidth: 2 },
  unit: { borderRightWidth: 2, borderBottomWidth: 2, backgroundColor: colors.paper },
  stripes: { flexDirection: "row", gap: 6 },
  stripeHit: { flex: 1, minHeight: 52, padding: 3, borderWidth: 2.5 },
  stripe: { flex: 1, minHeight: 42, borderWidth: 1.5, overflow: "hidden" },
  stripeRope: { position: "absolute", left: 0, right: 0, top: "58%", height: 5 },
  strike: { position: "absolute", left: -4, right: -4, top: "50%", height: 1.5, transform: [{ rotate: "-14deg" }] },
})
