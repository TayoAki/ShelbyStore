import type { Metadata, Viewport } from "next"
import { IBM_Plex_Mono, Inter, Libre_Caslon_Text, Plus_Jakarta_Sans } from "next/font/google"
import { Suspense } from "react"
import { AnalyticsProvider } from "@/components/analytics-provider"
import { AnnouncementBar } from "@/components/announcement-bar"
import { BagContents, DRAWER_POLICY } from "@/components/cart/bag-contents"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { CartDrawerProvider } from "@/components/cart/drawer-context"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import "./globals.css"

// Allbirds' proprietary families are substituted per the site-clone rule
// (SITE_SPEC §2.2): Plus Jakarta Sans for headings, Inter for body, IBM Plex
// Mono for mono roles. The serif role is Libre Caslon Text (G.2.3).
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-inter", display: "swap" })
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-jakarta", display: "swap" })
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" })
const caslon = Libre_Caslon_Text({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], variable: "--font-caslon", display: "swap" })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Shelby | One Rope Cap, Made Properly", template: "%s | Shelby" },
  description: "Shelby makes one rope cap: washed cotton, a mid crown that sits right, a rope worth looking at, and a new numbered color when the golf season turns.",
}

export const viewport: Viewport = {
  themeColor: "#212121",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} ${plexMono.variable} ${caslon.variable}`}>
      <body className="flex min-h-dvh flex-col bg-natural-white-60 font-sans text-black antialiased">
        <noscript>
          <style>{"[data-reveal],[data-reveal-child]{opacity:1!important}"}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[90] focus:rounded-full focus:bg-black focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <CartDrawerProvider>
          <AnnouncementBar />
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer policy={DRAWER_POLICY}>
            <Suspense fallback={<div className="flex-1" aria-busy />}>
              <BagContents mode="drawer" />
            </Suspense>
          </CartDrawer>
        </CartDrawerProvider>
        <AnalyticsProvider />
      </body>
    </html>
  )
}
