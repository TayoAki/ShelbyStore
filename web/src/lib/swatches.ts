/**
 * Dot colours for colour names on product cards (SITE_SPEC §6.2, §7). The PDP
 * uses image swatches instead, so these only need to be close. Two-tone names
 * written "Crown / Mesh" render as a split dot. Unknown names fall back to a
 * neutral grey.
 */
const SWATCH_HEX: Record<string, string> = {
  black: "#1e1f21",
  "washed black": "#2c2c2e",
  navy: "#26314a",
  bone: "#e4ddcc",
  cream: "#ede6d6",
  olive: "#5e6440",
  charcoal: "#4a4a4c",
  rust: "#a9441f",
  stone: "#c9c1ae",
  tobacco: "#8a5a2e",
  forest: "#24462f",
  sand: "#cdbb98",
  brown: "#5a3a26",
  white: "#f4f2ee",
}

const FALLBACK = "#8c867c"

const hex = (name: string) => SWATCH_HEX[name.trim().toLowerCase()] ?? FALLBACK

/** CSS background for a colour dot: solid, or a diagonal split for "A / B". */
export function swatchBackground(name: string): string {
  const parts = name.split("/").map((p) => p.trim()).filter(Boolean)
  if (parts.length >= 2) return `linear-gradient(135deg, ${hex(parts[0])} 50%, ${hex(parts[1])} 50%)`
  return hex(name)
}
