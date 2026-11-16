import { useEffect, useState } from "react"
import { Modal, Pressable, StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native"
import Animated, { runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { colors, ease, layout, motion } from "@/constants/theme"

/**
 * A bottom sheet printed as a box's bottom flap (APP_SPEC v7 §4): square
 * corners, a 2pt keyline along its top edge, no shadow. Overlay and sheet move
 * on one beat (420ms, the box ease); Reduce Motion: opacity only, instant.
 */
export function BottomSheet({
  visible,
  onClose,
  children,
  style,
}: {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}) {
  const reduce = useReducedMotion()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  // Stay mounted while the close animation runs ("adjust state on prop change").
  const [prevVisible, setPrevVisible] = useState(visible)
  const [closing, setClosing] = useState(false)
  if (visible !== prevVisible) {
    setPrevVisible(visible)
    setClosing(!visible)
  }
  const mounted = visible || closing
  const overlay = useSharedValue(0)
  const y = useSharedValue(height)

  useEffect(() => {
    if (visible) {
      overlay.set(withTiming(1, { duration: reduce ? 0 : 420, easing: ease.box, reduceMotion: motion.reduceMotion }))
      y.set(reduce ? 0 : height)
      y.set(withTiming(0, { duration: reduce ? 0 : 420, easing: ease.box, reduceMotion: motion.reduceMotion }))
    } else {
      overlay.set(withTiming(0, { duration: reduce ? 0 : 300, easing: ease.boxInOut, reduceMotion: motion.reduceMotion }))
      y.set(
        withTiming(
          reduce ? 0 : height,
          { duration: reduce ? 0 : 300, easing: ease.boxInOut, reduceMotion: motion.reduceMotion },
          (done) => {
            if (done) runOnJS(setClosing)(false)
          }
        )
      )
    }
  }, [height, overlay, reduce, visible, y])

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }))
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }], opacity: reduce ? overlay.value : 1 }))

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}>
        <Pressable accessibilityLabel="Close" style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <View style={styles.anchor} pointerEvents="box-none">
        <Animated.View style={[styles.sheet, { paddingBottom: 20 + insets.bottom }, sheetStyle, style]}>{children}</Animated.View>
      </View>
    </Modal>
  )
}

/**
 * The search sheet under the header: unfolds from the top edge (scaleY 0 → 1
 * on the beat), the content printed in after it. Square, keylined, no shadow.
 */
export function TopSheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const reduce = useReducedMotion()
  const insets = useSafeAreaInsets()
  const [prevVisible, setPrevVisible] = useState(visible)
  const [closing, setClosing] = useState(false)
  if (visible !== prevVisible) {
    setPrevVisible(visible)
    setClosing(!visible)
  }
  const mounted = visible || closing
  const p = useSharedValue(0)
  const content = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      p.set(withTiming(1, { duration: reduce ? 0 : 420, easing: ease.box, reduceMotion: motion.reduceMotion }))
      content.set(withDelay(reduce ? 0 : 160, withTiming(1, { duration: reduce ? 0 : 200, easing: ease.box })))
    } else {
      content.set(withTiming(0, { duration: reduce ? 0 : 120 }))
      p.set(
        withTiming(0, { duration: reduce ? 0 : 240, easing: ease.boxInOut }, (done) => {
          if (done) runOnJS(setClosing)(false)
        })
      )
    }
  }, [content, p, reduce, visible])

  const overlayStyle = useAnimatedStyle(() => ({ opacity: p.value }))
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: reduce ? 1 : p.value }], opacity: reduce ? p.value : 1 }))
  const contentStyle = useAnimatedStyle(() => ({ opacity: content.value }))

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, styles.overlayMenu, overlayStyle]}>
        <Pressable accessibilityLabel="Close search" style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.top, { paddingTop: insets.top + layout.contentTop }, sheetStyle]}>
        <Animated.View style={contentStyle}>{children}</Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { backgroundColor: colors.overlay },
  overlayMenu: { backgroundColor: colors.overlayMenu },
  anchor: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.paper,
    borderTopWidth: 2,
    borderTopColor: colors.ink,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
    maxHeight: "88%",
  },
  top: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: colors.paper,
    borderBottomWidth: 2,
    borderBottomColor: colors.ink,
    paddingHorizontal: 20,
    paddingBottom: 20,
    transformOrigin: "top",
  },
})
