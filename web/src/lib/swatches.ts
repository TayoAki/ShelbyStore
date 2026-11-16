/**
 * Rope Cap colourways (SITE_SPEC G.2.1): swatches render the crown with a band
 * of the rope colour (G.5.6). Design values, not measured from the photos.
 */
export type Colorway = { crown: string; rope: string; ropeName: string; light: boolean }

export const COLORWAYS: Record<string, Colorway> = {
  "Tour White": { crown: "#F4F2EE", rope: "#1F2A44", ropeName: "Navy", light: true },
  "Clubhouse Navy": { crown: "#26314A", rope: "#F4F2EE", ropeName: "White", light: false },
  Pine: { crown: "#1E3B2F", rope: "#EDE6D6", ropeName: "Cream", light: false },
  Fescue: { crown: "#C9C1AE", rope: "#1F2A44", ropeName: "Navy", light: true },
  Azalea: { crown: "#F4F2EE", rope: "#D8648A", ropeName: "Azalea pink", light: true },
  Cypress: { crown: "#2E4B4A", rope: "#CDBB98", ropeName: "Sand", light: false },
  Haar: { crown: "#A7ABA8", rope: "#EDE6D6", ropeName: "Cream", light: true },
}

const FALLBACK: Colorway = { crown: "#8c867c", rope: "#EDE6D6", ropeName: "", light: false }

export const colorway = (name: string | null | undefined): Colorway => (name && COLORWAYS[name]) || FALLBACK

/** Plain CSS background for a colour dot (crown only), used where a band won't fit. */
export const swatchBackground = (name: string) => colorway(name).crown
