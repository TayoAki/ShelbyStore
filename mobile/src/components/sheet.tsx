import Ionicons from "@expo/vector-icons/Ionicons"
import { useEffect, useState } from "react"
import { Modal, Pressable, StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native"
import Animated, { runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { colors, dur, ease, layout, motion, shadow } from "@/constants/theme"

import { Text } from "./text"

/** Keeps a modal mounted while its close animation runs ("adjust state on prop change"). */
function useMounted(visible: boolean) {
  const [prev, setPrev] = useState(visible)
  const [closing, setClosing] = useState(false)
  if (visible !== prev) {
    setPrev(visible)
    setClosing(!visible)
  }
  return { mounted: visible || closing, done: () => setClosing(false) }
}

/** The 64pt head: a caps title and a 24pt close ✕ that turns 90° on press (M14). */
export function SheetHead({ title, onClose }: { title?: string; onClose: () => void }) {
  const reduce = useReducedMotion()
  const r = useSharedValue(0)
  const icon = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }))
  return (
    <View style={styles.head}>
      <Text variant="labelCaps" style={styles.flex}>
        {title ?? ""}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        hitSlop={5}
        onPress={onClose}
        onPressIn={() => {
          if (!reduce) r.value = withTiming(90, { duration: dur.rotate, easing: ease.out, reduceMotion: motion.reduceMotion })
        }}
        onPressOut={() => {
          r.value = withTiming(0, { duration: dur.rotate, easing: ease.out, reduceMotion: motion.reduceMotion })
        }}
        style={styles.close}>
        <Animated.View style={icon}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Animated.View>
      </Pressable>
    </View>
  )
}

/**
 * Eastside's flyout as a bottom sheet (APP_SPEC v8 V8.3, M13): white, square,
 * a 1pt #F0F0F0 top edge and a soft upward shadow. It slides up over 250ms
 * ease-in-out while the #000 .4 underlay fades in over 300ms after 100ms.
 * Reduce Motion: opacity only, 200ms.
 */
export function BottomSheet({
  visible,
  onClose,
  children,
  title,
  style,
}: {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
  /** Shows the 64pt head with a close button. */
  title?: string
  style?: StyleProp<ViewStyle>
}) {
  const reduce = useReducedMotion()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const { mounted, done } = useMounted(visible)
  const overlay = useSharedValue(0)
  const y = useSharedValue(height)
  const fade = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      overlay.set(withDelay(reduce ? 0 : dur.underlayDelay, withTiming(1, { duration: reduce ? dur.reducedFade : dur.underlay, easing: ease.css, reduceMotion: motion.reduceMotion })))
      if (reduce) {
        y.set(0)
        fade.set(withTiming(1, { duration: dur.reducedFade }))
      } else {
        fade.set(1)
        y.set(height)
        y.set(withTiming(0, { duration: dur.bagSheet, easing: ease.inOut, reduceMotion: motion.reduceMotion }))
      }
    } else {
      overlay.set(withTiming(0, { duration: reduce ? dur.reducedFade : dur.underlay, easing: ease.css, reduceMotion: motion.reduceMotion }))
      const finish = (ok?: boolean) => {
        "worklet"
        if (ok) runOnJS(done)()
      }
      if (reduce) fade.set(withTiming(0, { duration: dur.reducedFade }, finish))
      else y.set(withTiming(height, { duration: dur.bagSheet, easing: ease.inOut, reduceMotion: motion.reduceMotion }, finish))
    }
  }, [done, fade, height, overlay, reduce, visible, y])

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }))
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }], opacity: fade.value }))

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, styles.underlay, overlayStyle]}>
        <Pressable accessibilityLabel="Close" style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <View style={styles.anchor} pointerEvents="box-none">
        <Animated.View style={[styles.sheet, { paddingBottom: 20 + insets.bottom }, sheetStyle, style]}>
          {title !== undefined ? <SheetHead title={title} onClose={onClose} /> : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  )
}

/**
 * The search panel (APP_SPEC v8 V8.5 §11, M12 from the top): slides down over
 * 600ms `ease` with the underlay fading in after 100ms. Reduce Motion: a 200ms fade.
 */
export function TopSheet({ visible, onClose, children, title }: { visible: boolean; onClose: () => void; children: React.ReactNode; title?: string }) {
  const reduce = useReducedMotion()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const { mounted, done } = useMounted(visible)
  const p = useSharedValue(0)
  const overlay = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      overlay.set(withDelay(reduce ? 0 : dur.underlayDelay, withTiming(1, { duration: reduce ? dur.reducedFade : dur.underlay })))
      p.set(withTiming(1, { duration: reduce ? dur.reducedFade : dur.menu, easing: ease.css, reduceMotion: motion.reduceMotion }))
    } else {
      overlay.set(withTiming(0, { duration: reduce ? dur.reducedFade : dur.underlay }))
      p.set(
        withTiming(0, { duration: reduce ? dur.reducedFade : dur.menu, easing: ease.css, reduceMotion: motion.reduceMotion }, (ok) => {
          if (ok) runOnJS(done)()
        })
      )
    }
  }, [done, overlay, p, reduce, visible])

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }))
  const sheetStyle = useAnimatedStyle(() =>
    reduce ? { opacity: p.value } : { transform: [{ translateY: (p.value - 1) * height }] }
  )

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, styles.underlay, overlayStyle]}>
        <Pressable accessibilityLabel="Close search" style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.top, { paddingTop: insets.top }, sheetStyle]}>
        <SheetHead title={title ?? "Search"} onClose={onClose} />
        {children}
      </Animated.View>
    </Modal>
  )
}

/**
 * The left drawer (APP_SPEC v8 V8.5 §2, M12): the shop's filters. Slides in
 * from the left over 600ms `ease`; the underlay fades in after 100ms. Reduce
 * Motion: a 200ms fade.
 */
export function SideSheet({ visible, onClose, children, title }: { visible: boolean; onClose: () => void; children: React.ReactNode; title?: string }) {
  const reduce = useReducedMotion()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const panel = Math.min(width * 0.86, 360)
  const { mounted, done } = useMounted(visible)
  const p = useSharedValue(0)
  const overlay = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      overlay.set(withDelay(reduce ? 0 : dur.underlayDelay, withTiming(1, { duration: reduce ? dur.reducedFade : dur.underlay })))
      p.set(withTiming(1, { duration: reduce ? dur.reducedFade : dur.menu, easing: ease.css, reduceMotion: motion.reduceMotion }))
    } else {
      overlay.set(withTiming(0, { duration: reduce ? dur.reducedFade : dur.underlay }))
      p.set(
        withTiming(0, { duration: reduce ? dur.reducedFade : dur.menu, easing: ease.css, reduceMotion: motion.reduceMotion }, (ok) => {
          if (ok) runOnJS(done)()
        })
      )
    }
  }, [done, overlay, p, reduce, visible])

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }))
  const panelStyle = useAnimatedStyle(() => (reduce ? { opacity: p.value } : { transform: [{ translateX: (p.value - 1) * panel }] }))

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, styles.underlay, overlayStyle]}>
        <Pressable accessibilityLabel="Close filters" style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.side, { width: panel, paddingTop: insets.top, paddingBottom: insets.bottom + 16 }, panelStyle]}>
        <SheetHead title={title} onClose={onClose} />
        {children}
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  underlay: { backgroundColor: colors.underlay },
  anchor: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: layout.edge,
    gap: 16,
    maxHeight: "88%",
    ...shadow.sheet,
  },
  head: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  flex: { flex: 1 },
  close: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginRight: -10 },
  top: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: colors.white,
    paddingHorizontal: layout.edge,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  side: { position: "absolute", left: 0, top: 0, bottom: 0, backgroundColor: colors.white, paddingHorizontal: layout.edge, gap: 8 },
})
