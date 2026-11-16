import { Image } from "expo-image"
import { useEffect, useRef, useState } from "react"
import { FlatList, StyleSheet, View } from "react-native"

import { colors } from "@/constants/theme"

import { ImageBadge } from "./badge"
import { Dashes } from "./dashes"

/**
 * PDP gallery (APP_SPEC §5.4 item 1): full-width paging squares, white,
 * `contain`, dashes 12pt under. `resetKey` (the colour) jumps back to image 1.
 */
export function Gallery({
  images,
  pageWidth,
  imageSize,
  alt,
  badge,
  resetKey,
}: {
  images: string[]
  pageWidth: number
  imageSize: number
  alt: string
  badge?: string | null
  resetKey?: string | null
}) {
  const [index, setIndex] = useState(0)
  const [shownKey, setShownKey] = useState(resetKey)
  const list = useRef<FlatList<string>>(null)
  // A new colour starts its gallery from the first photo.
  if (resetKey !== shownKey) {
    setShownKey(resetKey)
    setIndex(0)
  }
  useEffect(() => {
    list.current?.scrollToOffset({ offset: 0, animated: false })
  }, [resetKey])

  return (
    <View>
      <FlatList
        ref={list}
        data={images.length ? images : [""]}
        keyExtractor={(u, i) => `${u}-${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / pageWidth))}
        renderItem={({ item, index: i }) => (
          <View style={[styles.page, { width: pageWidth, height: imageSize }]}>
            {item ? (
              <Image
                source={item}
                style={{ width: imageSize, height: imageSize }}
                contentFit="contain"
                transition={150}
                accessibilityLabel={`${alt}, image ${i + 1} of ${images.length}`}
              />
            ) : null}
          </View>
        )}
      />
      {badge ? <ImageBadge label={badge} /> : null}
      <Dashes count={images.length} index={index} style={styles.dashes} />
    </View>
  )
}

/** The two-pack gallery: the two chosen colours' lead photos side by side. */
export function PairGallery({ first, second, width }: { first: string | null; second: string | null; width: number }) {
  const size = (width - 59) / 2
  return (
    <View style={styles.pair}>
      {[first, second].map((src, i) => (
        <View key={i} style={[styles.pairCell, { width: size, height: size }]}>
          {src ? <Image source={src} style={{ width: size, height: size }} contentFit="contain" transition={150} /> : null}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  page: { alignItems: "center", justifyContent: "center", backgroundColor: colors.secondary },
  dashes: { marginTop: 12 },
  pair: { flexDirection: "row", justifyContent: "center", gap: 16, paddingTop: 8 },
  pairCell: { backgroundColor: colors.secondary },
})
