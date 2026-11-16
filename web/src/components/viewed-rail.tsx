"use client"

import type { CatalogItem } from "@/lib/catalog-items"
import { Rail } from "./rail"
import { MiniCard, useViewed, viewedItems } from "./recently-viewed"

/** The PDP's recently-viewed rail (E.6.3), when there is history other than this product. */
export function ViewedRail({ catalog, exclude }: { catalog: CatalogItem[]; exclude?: string }) {
  const items = viewedItems(catalog, useViewed().filter((h) => h !== exclude)).slice(0, 8)
  if (!items.length) return null
  return (
    <section aria-labelledby="viewed-rail" className="pb-12">
      <h2 id="viewed-rail" className="heading-recs wrap">
        Recently viewed
      </h2>
      <Rail label="Recently viewed" className="mt-6" itemClass="[grid-auto-columns:164px] md:[grid-auto-columns:278px]">
        {items.map((i) => (
          <li key={i.key}>
            <MiniCard item={i} track="recently_viewed" />
          </li>
        ))}
      </Rail>
    </section>
  )
}
