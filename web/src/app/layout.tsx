import type { Metadata, Viewport } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import { Suspense } from "react"
import { AnalyticsProvider } from "@/components/analytics-provider"
import { AnnouncementBar } from "@/components/announcement-bar"
import { BagContents, DRAWER_POLICY } from "@/components/cart/bag-contents"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { CartDrawerProvider } from "@/components/cart/drawer-context"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { Newsletter } from "@/components/newsletter"
import "./globals.css"

// Avenir LT Pro (paid) is substituted per the site-clone rule: Plus Jakarta Sans
// for the heading/subheading roles, Inter for body (SITE_SPEC §2.2).
const pjs = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--font-pjs", display: "swap" })
const inter = Inter({ subsets: ["latin"], weight: ["400"], variable: "--font-inter", display: "swap" })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"),
  title: { default: "Shelby | The Everyday Cap, Always In Stock", template: "%s | Shelby" },
  description: "The Everyday Cap, a low-profile washed-cotton cap that never runs out, plus small hat drops on a calendar.",
}

export const viewport: Viewport = {
  themeColor: "#000000",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${pjs.variable} ${inter.variable}`}>
      <body className="flex min-h-dvh flex-col bg-white font-system text-primary antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[70] focus:bg-black focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <CartDrawerProvider>
          <AnnouncementBar />
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Newsletter />
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
