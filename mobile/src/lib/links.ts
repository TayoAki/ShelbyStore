import { Linking } from "react-native"

import { STOREFRONT_URL } from "./config"

/** Opens a storefront page (quiz, fit guide, stories, reasons) in the browser. */
export function openWeb(path: string) {
  Linking.openURL(`${STOREFRONT_URL}${path.startsWith("/") ? path : `/${path}`}`).catch(() => undefined)
}
