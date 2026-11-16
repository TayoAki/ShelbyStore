import { Image } from "expo-image"
import { useEffect, useRef } from "react"
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native"
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

import { colors, ease, motion, radius } from "@/constants/theme"

import { ScrollThumb } from "./scroll-thumb"

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<string>)

/**
 * The PDP gallery (APP_SPEC v5 §5.1): a full-width paging slider of square
 * white slides (radius 16, contain) with the scroll thumb under it. A colour
 * change fades the slider in (200ms sine.out) and resets to the first photo.
 */
export function Gallery({ images, title, colourKey }: { images: string[]; title: string; colourKey?: string | null }) {
  const { width } = useWindowDimensions()
  const slide = Math.min(width, 720) - 20
  const offset = useSharedValue(0)
  const fade = useSharedValue(1)
  const listRef = useRef<FlatList<string>>(null)

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false })
    fade.value = 0
    fade.value = withTiming(1, { duration: 200, easing: ease.sineOut, reduceMotion: motion.reduceMotion })
  }, [colourKey, fade])

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      offset.value = e.contentOffset.x
    },
  })
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }))

  return (
    <View style={styles.wrap}>
      <Animated.View style={fadeStyle}>
        <AnimatedFlatList
          ref={listRef as never}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(u, i) => `${u}-${i}`}
          onScroll={onScroll}
          scrollEventThrottle={16}
          snapToInterval={slide}
          decelerationRate="fast"
          style={{ width: slide }}
          renderItem={({ item, index }) => (
            <View style={[styles.slide, { width: slide, height: slide }]}>
              <Image
                source={item}
                style={styles.image}
                contentFit="contain"
                accessibilityLabel={`${title}, photo ${index + 1} of ${images.length}`}
                transition={150}
              />
            </View>
          )}
        />
      </Animated.View>
      <ScrollThumb count={images.length} offset={offset} pageWidth={slide} width={slide - 20} />
    </View>
  )
}

/** The Pair's gallery: the two chosen colourways' lead photos side by side. */
export function PairGallery({ left, right, title }: { left: string | null; right: string | null; title: string }) {
  const { width } = useWindowDimensions()
  const w = Math.min(width, 720) - 20
  return (
    <View style={[styles.pair, { width: w, height: w / 2 }]} accessibilityLabel={title}>
      {[left, right].map((src, i) => (
        <View key={i} style={styles.pairCell}>
          {src ? <Image source={src} style={styles.image} contentFit="contain" transition={150} /> : null}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 12 },
  slide: { backgroundColor: colors.white, borderRadius: radius.xxl, overflow: "hidden" },
  image: { width: "100%", height: "100%" },
  pair: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    overflow: "hidden",
  },
  pairCell: { flex: 1 },
})
