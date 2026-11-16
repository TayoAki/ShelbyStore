/**
 * Swatch fills for colour names (the same table as web/src/lib/swatches.ts).
 * Two-tone names written "Crown / Mesh" render as two half circles.
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

/** Fills light enough to need a 1pt #E4E4E4 inner ring on white. */
const LIGHT = new Set(["bone", "cream", "stone", "sand", "white"])

const key = (name: string) => name.trim().toLowerCase()

export function swatchColor(name: string): string {
  return SWATCH_HEX[key(name)] ?? FALLBACK
}

/** One fill, or two for "A / B" names. */
export function swatchParts(name: string): string[] {
  const parts = name
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean)
  return (parts.length >= 2 ? parts.slice(0, 2) : [name]).map(swatchColor)
}

export function isLightSwatch(name: string): boolean {
  const first = name.split("/")[0] ?? name
  return LIGHT.has(key(first))
}

/** Shop By Color tile backgrounds (web §6.1.5). */
export const COLOR_TILE: Record<string, { background: string; label: string }> = {
  "washed black": { background: "#2A2A2A", label: "#FFFFFF" },
  navy: { background: "#26314A", label: "#FFFFFF" },
  bone: { background: "#E4DDCC", label: "#000000" },
  olive: { background: "#5E6440", label: "#FFFFFF" },
}

export function colorTile(name: string): { background: string; label: string } {
  return COLOR_TILE[key(name)] ?? { background: swatchColor(name), label: isLightSwatch(name) ? "#000000" : "#FFFFFF" }
}
