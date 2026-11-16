/**
 * Rope Cap colourways. `crown` and `rope` paint the ink chips; `panel` and
 * `ink` are the colours a box panel is printed in when that colourway is
 * chosen (The Ball Box: the colourway's ink floods the front panel).
 * Design values, not measured from the photos.
 */
export type Colorway = { crown: string; rope: string; ropeName: string; light: boolean; panel: string; ink: string; edge: string }

export const COLORWAYS: Record<string, Colorway> = {
  "Tour White": { crown: "#F4F2EE", rope: "#1F2A44", ropeName: "Navy", light: true, panel: "#FFFFFF", ink: "#14213D", edge: "#14213D" },
  "Clubhouse Navy": { crown: "#26314A", rope: "#F4F2EE", ropeName: "White", light: false, panel: "#1B2A4A", ink: "#FFFFFF", edge: "#0B1427" },
  Pine: { crown: "#1E3B2F", rope: "#EDE6D6", ropeName: "Cream", light: false, panel: "#1E3B2F", ink: "#F1ECE0", edge: "#10241B" },
  Fescue: { crown: "#C9C1AE", rope: "#1F2A44", ropeName: "Navy", light: true, panel: "#CFC3A6", ink: "#14213D", edge: "#14213D" },
  Azalea: { crown: "#F4F2EE", rope: "#D8648A", ropeName: "Azalea pink", light: true, panel: "#F5D3DE", ink: "#14213D", edge: "#14213D" },
  Cypress: { crown: "#2E4B4A", rope: "#CDBB98", ropeName: "Sand", light: false, panel: "#2E4B4A", ink: "#F1E8D2", edge: "#1A2D2C" },
  Haar: { crown: "#A7ABA8", rope: "#EDE6D6", ropeName: "Cream", light: true, panel: "#B9BDBA", ink: "#14213D", edge: "#14213D" },
}

const FALLBACK: Colorway = { crown: "#8c867c", rope: "#EDE6D6", ropeName: "", light: false, panel: "#FFFFFF", ink: "#14213D", edge: "#14213D" }

export const colorway = (name: string | null | undefined): Colorway => (name && COLORWAYS[name]) || FALLBACK

/** Plain CSS background for a colour chip (crown only), used where a band won't fit. */
export const swatchBackground = (name: string) => colorway(name).crown
