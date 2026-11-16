import { useEffect, useState, type ReactNode } from "react"
import { RefreshControl, type StyleProp, type ViewStyle } from "react-native"
import Animated, {
  runOnJS,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type AnimatedRef,
} from "react-native-reanimated"

import { colors, dur, ease, motion } from "@/constants/theme"

/**
 * The page scroll container (APP_SPEC v8). Eastside has no scroll reveals, so
 * this is a plain Animated.ScrollView that reports its offset on the JS thread
 * (sticky buy bar, header state) and pins sticky headers.
 */
export function PageScrollView({
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
  const ownRef = useAnimatedRef<Animated.ScrollView>()
  const handler = useAnimatedScrollHandler({
    onScroll: (e) => {
      if (onScrollY) runOnJS(onScrollY)(e.contentOffset.y)
    },
  })
  return (
    <Animated.ScrollView
      ref={scrollRef ?? ownRef}
      onScroll={handler}
      scrollEventThrottle={16}
      style={[{ backgroundColor: colors.bg }, style]}
      stickyHeaderIndices={stickyHeaderIndices}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={contentContainerStyle}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.textLight} /> : undefined}>
      {children}
    </Animated.ScrollView>
  )
}

/** A value that runs 0 → 1 once on mount (sheets), honouring reduced motion. */
export function useMountProgress(duration: number = dur.sheetIn, delay = 0) {
  const reduce = useReducedMotion()
  const p = useSharedValue(reduce ? 1 : 0)
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration, easing: ease.css, reduceMotion: motion.reduceMotion }))
  }, [delay, duration, p])
  return p
}

/**
 * M1, the button press sweep (V8.4): a skewed overlay 120pt wider than the
 * button slides in from the left over 500ms `ease.sweep` on press in and fades
 * out over 250ms `ease.out` on press out. Under Reduce Motion there is no
 * overlay: the caller switches the background to the pressed colour instead.
 */
export function usePressSweep(width: number) {
  const reduce = useReducedMotion()
  const x = useSharedValue(-(width + 120))
  const opacity = useSharedValue(0)
  const pressIn = () => {
    if (reduce) return
    opacity.value = 1
    x.value = -(width + 120)
    x.value = withTiming(0, { duration: dur.sweep, easing: ease.sweep, reduceMotion: motion.reduceMotion })
  }
  const pressOut = () => {
    if (reduce) return
    opacity.value = withTiming(0, { duration: dur.colour, easing: ease.out, reduceMotion: motion.reduceMotion }, (done) => {
      if (done) x.value = -(width + 120)
    })
  }
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }, { skewX: "30deg" }],
  }))
  return { style, pressIn, pressOut, reduce, overlayWidth: width + 120 }
}

/**
 * M18, the sticky buy bar: shows once the main Add button has scrolled out of
 * view (its bottom edge is above the scroll offset), fading 0 → 1 over 300ms
 * `ease.out`; instant under Reduce Motion. `threshold` is the y of the button's
 * bottom edge in the scroll content; feed `onScrollY` from PageScrollView.
 */
export function useStickyBar(threshold: number | null) {
  const [visible, setVisible] = useState(false)
  const opacity = useSharedValue(0)
  const onScrollY = (y: number) => {
    const show = threshold != null && y > threshold
    if (show !== visible) {
      setVisible(show)
      opacity.value = withTiming(show ? 1 : 0, { duration: dur.sticky, easing: ease.out, reduceMotion: motion.reduceMotion })
    }
  }
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))
  return { visible, onScrollY, style }
}
