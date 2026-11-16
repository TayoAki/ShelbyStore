import { createContext, useContext, useEffect, useRef, type ReactNode } from "react"
import { RefreshControl, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native"
import Animated, {
  measure,
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type AnimatedRef,
  type SharedValue,
} from "react-native-reanimated"

import { colors, dur, ease, motion } from "@/constants/theme"

/**
 * Scroll-driven motion (APP_SPEC v5 §5.3). A <RevealScrollView> publishes the
 * scroll offset and viewport height; each <Reveal> fades in once its top
 * crosses `threshold` of the window (M1), with a reduced-motion bypass (§5.4).
 */
type RevealCtx = { scrollY: SharedValue<number>; viewportH: SharedValue<number> }
const RevealContext = createContext<RevealCtx | null>(null)

export const useRevealScroll = () => useContext(RevealContext)

export function RevealScrollView({
  children,
  contentContainerStyle,
  style,
  onScrollY,
  refreshing,
  onRefresh,
  scrollRef,
  stickyHeaderIndices,
}: {
  children: ReactNode
  contentContainerStyle?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
  /** JS-thread scroll offset (sticky bar, header state). */
  onScrollY?: (y: number) => void
  refreshing?: boolean
  onRefresh?: () => void
  scrollRef?: AnimatedRef<Animated.ScrollView>
  stickyHeaderIndices?: number[]
}) {
  const scrollY = useSharedValue(0)
  const viewportH = useSharedValue(800)
  const ownRef = useAnimatedRef<Animated.ScrollView>()
  const handler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y
      if (onScrollY) runOnJS(onScrollY)(e.contentOffset.y)
    },
  })
  return (
    <RevealContext.Provider value={{ scrollY, viewportH }}>
      <Animated.ScrollView
        ref={scrollRef ?? ownRef}
        onScroll={handler}
        scrollEventThrottle={16}
        style={style}
        stickyHeaderIndices={stickyHeaderIndices}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={contentContainerStyle}
        onLayout={(e) => {
          viewportH.value = e.nativeEvent.layout.height
        }}
        refreshControl={
          onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.muted} /> : undefined
        }>
        {children}
      </Animated.ScrollView>
    </RevealContext.Provider>
  )
}

/**
 * Fades its children in when its top crosses `threshold` × viewport height
 * (M1: 800ms sine.out). `onReveal` lets a section start its own motion
 * (ring, pill window, rope rule). Without a RevealScrollView it reveals on mount.
 */
export function Reveal({
  children,
  threshold = 0.85,
  delay = 0,
  style,
  onReveal,
  fade = true,
}: {
  children: ReactNode
  threshold?: number
  delay?: number
  style?: StyleProp<ViewStyle>
  onReveal?: () => void
  fade?: boolean
}) {
  const ctx = useRevealScroll()
  const reduce = useReducedMotion()
  const y = useSharedValue(-1)
  const shown = useSharedValue(reduce || !fade ? 1 : 0)
  const fired = useSharedValue(false)
  const onRevealRef = useRef(onReveal)
  useEffect(() => {
    onRevealRef.current = onReveal
  })

  const fire = () => onRevealRef.current?.()

  useAnimatedReaction(
    () => {
      if (fired.value || y.value < 0) return false
      if (!ctx) return true
      return ctx.scrollY.value + ctx.viewportH.value * threshold >= y.value
    },
    (go) => {
      if (!go || fired.value) return
      fired.value = true
      shown.value = withDelay(delay, withTiming(1, { duration: dur.section, easing: ease.sineOut, reduceMotion: motion.reduceMotion }))
      runOnJS(fire)()
    },
    [ctx, threshold, delay]
  )

  const animated = useAnimatedStyle(() => ({ opacity: shown.value }))

  return (
    <Animated.View
      style={[style, animated]}
      onLayout={(e: LayoutChangeEvent) => {
        // Position relative to the scroll content: walk up via pageY is not
        // available synchronously, so sections are direct children of the
        // scroll view and their layout y is the content offset.
        y.value = e.nativeEvent.layout.y
      }}>
      {children}
    </Animated.View>
  )
}

/** A value that runs 0 → 1 once on mount (M3 hero, sheets), honouring reduced motion. */
export function useMountProgress(duration = dur.section, delay = 0) {
  const reduce = useReducedMotion()
  const p = useSharedValue(reduce ? 1 : 0)
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration, easing: ease.sineOut, reduceMotion: motion.reduceMotion }))
  }, [delay, duration, p])
  return p
}

/**
 * Allbirds' ring path `M 100,10 a 90,90 0 1,0 0.01,0`: starts at the top and
 * runs counter-clockwise. θ = −π/2 − 2πp.
 */
export function circlePoint(p: number, cx: number, cy: number, r: number) {
  "worklet"
  const theta = -Math.PI / 2 - 2 * Math.PI * p
  return { x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) }
}

/**
 * A point at fraction p of a stadium's perimeter (radius w/2, straight sides
 * of h − w), from the top centre, clockwise. Phones draw the pill upright.
 */
export function stadiumPoint(p: number, w: number, h: number) {
  "worklet"
  const r = w / 2
  const straight = Math.max(0, h - w)
  const arc = Math.PI * r
  const total = 2 * arc + 2 * straight
  let d = (((p % 1) + 1) % 1) * total
  // top half-circle: from top centre clockwise to the right side's top
  if (d < arc / 2) {
    const a = -Math.PI / 2 + d / r
    return { x: r + r * Math.cos(a), y: r + r * Math.sin(a) }
  }
  d -= arc / 2
  if (d < straight) return { x: w, y: r + d }
  d -= straight
  if (d < arc) {
    const a = d / r
    return { x: r + r * Math.cos(a), y: r + straight + r * Math.sin(a) }
  }
  d -= arc
  if (d < straight) return { x: 0, y: r + straight - d }
  d -= straight
  const a = Math.PI + d / r
  return { x: r + r * Math.cos(a), y: r + r * Math.sin(a) }
}

/**
 * The page's one authored scroll moment (APP_SPEC v7 §5.3): the box turns
 * from its front face to its side face. As the wrapped face rises into the
 * lower third of the screen it rotates from 9° about its top edge to flat,
 * tied to the scroll position, so it plays backwards too. Reduce Motion: flat.
 */
export function TurnFace({ children }: { children: ReactNode }) {
  const ctx = useRevealScroll()
  const reduce = useReducedMotion()
  const ref = useAnimatedRef<Animated.View>()
  const style = useAnimatedStyle(() => {
    if (reduce || !ctx) return { transform: [] }
    // read the scroll offset so the style re-runs as the page moves
    const _y = ctx.scrollY.value
    const m = measure(ref)
    if (!m || _y < -10000) return { transform: [] }
    const vh = ctx.viewportH.value
    const p = Math.min(1, Math.max(0, (vh - m.pageY) / (vh * 0.4)))
    return { transform: [{ perspective: 1600 }, { rotateX: `${(1 - p) * 9}deg` }] }
  })
  return (
    <Animated.View ref={ref} style={[{ transformOrigin: "50% 0%" }, style]}>
      {children}
    </Animated.View>
  )
}
