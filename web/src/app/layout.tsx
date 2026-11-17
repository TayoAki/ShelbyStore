import type { Metadata, Viewport } from "next"
import { Monomakh, Montserrat, Roboto } from "next/font/google"
import { Suspense } from "react"
import { AnalyticsProvider } from "@/components/analytics-provider"
import { AnnouncementBar } from "@/components/announcement-bar"
import { BagContents } from "@/components/cart/bag-contents"
import { CartDrawer, CartHead } from "@/components/cart/cart-drawer"
import { CartDrawerProvider } from "@/components/cart/drawer-context"
import { Footer, Prefooter } from "@/components/footer"
import { Header } from "@/components/header"
import "./globals.css"

// SITE_SPEC v8 E.2.3: Monomakh for section titles and the wordmark, Montserrat
// for product and page titles, Roboto for everything else.
const display = Monomakh({ weight: "400", subsets: ["latin"], variable: "--font-monomakh", display: "swap", adjustFontFallback: false })
const heading = Montserrat({ weight: ["500", "600", "700"], subsets: ["latin"], variable: "--font-montserrat", display: "swap" })
const body = Roboto({ weight: ["400", "500", "700"], style: ["normal", "italic"], subsets: ["latin"], variable: "--font-roboto", display: "swap" })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Shelby | Sunwashed Rope Cap", template: "%s | Shelby" },
  description: "The Shelby Sunwashed Rope Cap in washed sage with cream birdie behavior embroidery.",
}

export const viewport: Viewport = {
  themeColor: "#000000",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${heading.variable} ${body.variable}`}>
      <body className="flex min-h-dvh flex-col bg-bg font-body text-text antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[7000] focus:rounded-sm focus:bg-ink focus:px-3 focus:py-2 focus:text-on-ink">
          Skip to content
        </a>
        <CartDrawerProvider>
          <AnnouncementBar />
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Prefooter />
          <Footer />
          <CartDrawer>
            <Suspense
              fallback={
                <div className="flex min-h-0 flex-1 flex-col" aria-busy>
                  <CartHead count={null} />
                </div>
              }
            >
              <BagContents mode="drawer" />
            </Suspense>
          </CartDrawer>
        </CartDrawerProvider>
        <AnalyticsProvider />
      </body>
    </html>
  )
}
