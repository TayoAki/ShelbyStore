import type { Config } from "tailwindcss"

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#000000", secondary: "#ffffff", tertiary: "#e4e4e4", body: "#000000",
        "ink-tab": "#0e1311", muted: "#736b67", "muted-card": "#726b67", "muted-sub": "#77706c",
        tile: "#f5f5f5", band: "#f8f8f9", mega: "#ededed", addon: "#ececec",
        line: "#e4e4e4", "line-soft": "#eeeeee", "line-header": "#e5e7eb", "line-addon": "#dddddd",
        "line-offer": "#cccccc", instock: "#22c55e", error: "#c70000",
      },
      fontFamily: {
        heading: ["var(--font-pjs)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        campaign: ["Georgia", "Times New Roman", "serif"],
      },
      borderRadius: { button: "3px", tile: "4px", addon: "8px", offer: "6px", sort: "22px" },
      boxShadow: { sticky: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" },
      maxWidth: { site: "1280px", shop: "1220px", article: "672px" },
    },
  },
} satisfies Config
