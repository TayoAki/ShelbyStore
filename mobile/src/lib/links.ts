import { Linking, Platform, type ImageStyle } from "react-native"

import { STOREFRONT_URL } from "./config"

/** Opens a storefront page (quiz, fit guide, stories, reasons) in the browser. */
export function openWeb(path: string) {
  Linking.openURL(`${STOREFRONT_URL}${path.startsWith("/") ? path : `/${path}`}`).catch(() => undefined)
}

/**
 * Photos are shot on white. On web builds, multiply blends the white into the
 * tile colour (Melin's cut-out look); native draws them on a white square.
 */
export const cutout: ImageStyle = Platform.OS === "web" ? ({ mixBlendMode: "multiply" } as ImageStyle) : {}
