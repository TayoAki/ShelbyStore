import { Image } from "expo-image"
import { useState } from "react"
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native"

import { colors, MAX_CONTENT_WIDTH, spacing } from "@/constants/theme"

export function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const { width: windowWidth } = useWindowDimensions()
  const width = Math.min(windowWidth, MAX_CONTENT_WIDTH)
  const [index, setIndex] = useState(0)
  const height = width * (4 / 3)

  if (!images.length) return <View style={[styles.placeholder, { width, height }]} />

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        onScroll={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        scrollEventThrottle={64}>
        {images.map((url, i) => (
          <Image
            key={`${url}-${i}`}
            source={url}
            style={{ width, height, backgroundColor: colors.surfaceAlt }}
            contentFit="cover"
            transition={200}
            accessibilityLabel={`${alt}, image ${i + 1} of ${images.length}`}
          />
        ))}
      </ScrollView>
      {images.length > 1 ? (
        <View style={styles.dots}>
          {images.map((url, i) => (
            <View key={`${url}-dot-${i}`} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  placeholder: { backgroundColor: colors.surfaceAlt },
  dots: {
    position: "absolute",
    bottom: spacing.md,
    alignSelf: "center",
    flexDirection: "row",
    gap: spacing.xs + 2,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(20,20,20,0.25)" },
  dotActive: { backgroundColor: colors.text, width: 18 },
})
