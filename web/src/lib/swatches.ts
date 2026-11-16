/**
 * Rope Cap colourways. `crown` and `rope` paint the ink chips; `panel` and
 * `ink` are the colours a box panel is printed in when that colourway is
 * chosen (The Ball Box: the colourway's ink floods the front panel). Every
 * panel is inked: Tour White prints on the box's navy base ink, so the white
 * cap sits in the window as a knock-out. `panelDark` sets knock-out type.
 * Design values, not measured from the photos.
 */
export type Colorway = { crown: string; rope: string; ropeName: string; light: boolean; panel: string; ink: string; edge: string; panelDark: boolean }

export const COLORWAYS: Record<string, Colorway> = {
  "Tour White": { crown: "#F4F2EE", rope: "#1F2A44", ropeName: "Navy", light: true, panel: "#14213D", ink: "#FFFFFF", edge: "#0A1226", panelDark: true },
  "Clubhouse Navy": { crown: "#26314A", rope: "#F4F2EE", ropeName: "White", light: false, panel: "#2C4373", ink: "#FFFFFF", edge: "#14213D", panelDark: true },
  Pine: { crown: "#1E3B2F", rope: "#EDE6D6", ropeName: "Cream", light: false, panel: "#1E3B2F", ink: "#F1ECE0", edge: "#10241B", panelDark: true },
  Fescue: { crown: "#C9C1AE", rope: "#1F2A44", ropeName: "Navy", light: true, panel: "#CFC3A6", ink: "#14213D", edge: "#14213D", panelDark: false },
  Azalea: { crown: "#F4F2EE", rope: "#D8648A", ropeName: "Azalea pink", light: true, panel: "#F5D3DE", ink: "#14213D", edge: "#14213D", panelDark: false },
  Cypress: { crown: "#2E4B4A", rope: "#CDBB98", ropeName: "Sand", light: false, panel: "#2E4B4A", ink: "#F1E8D2", edge: "#1A2D2C", panelDark: true },
  Haar: { crown: "#A7ABA8", rope: "#EDE6D6", ropeName: "Cream", light: true, panel: "#B9BDBA", ink: "#14213D", edge: "#14213D", panelDark: false },
}

const FALLBACK: Colorway = { crown: "#8c867c", rope: "#EDE6D6", ropeName: "", light: false, panel: "#FFFFFF", ink: "#14213D", edge: "#14213D", panelDark: false }

export const colorway = (name: string | null | undefined): Colorway => (name && COLORWAYS[name]) || FALLBACK

/** Plain CSS background for a colour chip (crown only), used where a band won't fit. */
export const swatchBackground = (name: string) => colorway(name).crown
