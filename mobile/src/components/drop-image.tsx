import { Image } from "expo-image"
import { View } from "react-native"

import { colors } from "@/constants/theme"
import { imageUrl } from "@/lib/product"
import type { StoreRelease } from "@/lib/types"

/**
 * A release image: lifestyle photos fill the frame (cover); product shots on
 * white sit centred on white (contain) so the hat is never cropped.
 */
export function DropImage({ release, width, height }: { release: StoreRelease; width: number; height: number }) {
  const src = imageUrl(release.hero_image ?? release.products[0]?.thumbnail ?? null)
  const lifestyle = !!src && /lifestyle|story/.test(src)
  return (
    <View style={{ width, height, backgroundColor: colors.secondary, overflow: "hidden" }}>
      {src ? (
        <Image
          source={src}
          style={{ width, height }}
          contentFit={lifestyle ? "cover" : "contain"}
          transition={200}
          accessibilityLabel={release.title}
        />
      ) : null}
    </View>
  )
}
