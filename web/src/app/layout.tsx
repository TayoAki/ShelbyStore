import type { Metadata, Viewport } from "next"
import { Sofia_Sans, Sofia_Sans_Extra_Condensed, Sofia_Sans_Semi_Condensed } from "next/font/google"
import { Suspense } from "react"
import { AnalyticsProvider } from "@/components/analytics-provider"
import { AnnouncementBar } from "@/components/announcement-bar"
import { BagContents, DRAWER_POLICY } from "@/components/cart/bag-contents"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { CartDrawerProvider } from "@/components/cart/drawer-context"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import "./globals.css"

// One superfamily, the way a box's print is set: Sofia Sans for running copy,
// Semi Condensed for printed labels and controls, Extra Condensed for model
// names and every numeral (The Ball Box direction contract).
const sofia = Sofia_Sans({ subsets: ["latin"], variable: "--font-sofia", display: "swap" })
const sofiaSemi = Sofia_Sans_Semi_Condensed({ subsets: ["latin"], variable: "--font-sofia-semi", display: "swap" })
const sofiaXc = Sofia_Sans_Extra_Condensed({ subsets: ["latin"], variable: "--font-sofia-xc", display: "swap" })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Shelby | One Rope Cap, Made Properly", template: "%s | Shelby" },
  description: "Shelby makes one rope cap: washed cotton, a mid crown that sits right, a rope worth looking at, and a new numbered color when the golf season turns.",
}

export const viewport: Viewport = {
  themeColor: "#14213D",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sofia.variable} ${sofiaSemi.variable} ${sofiaXc.variable}`}>
      <body className="flex min-h-dvh flex-col bg-paper font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[90] focus:rounded-[4px] focus:bg-ink focus:px-3 focus:py-2 focus:text-white"
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
