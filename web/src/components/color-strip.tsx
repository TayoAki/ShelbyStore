import Image from "next/image"
import Link from "next/link"

export type StripItem = { label: string; href: string; image: string; track: string }

/**
 * Eastside's mobile `subcategories` strip (SITE_SPEC v8 E.6.1 §1): a #EEE9E3
 * band with a sideways row of 79px tiles (a 79×79 photo on #F6F6F6 and a
 * 12.25px uppercase label 7px under it). Mobile only.
 */
export function ColorStrip({ items }: { items: StripItem[] }) {
  return (
    <nav aria-label="Shop by color" className="bg-sand pt-[19.2px] pb-[9px] md:hidden">
      <ul className="rail px-[14px] [grid-auto-columns:79px]">
        {items.map((t) => (
          <li key={t.label}>
            <Link href={t.href} data-track={t.track} className="flex flex-col items-center">
              <span className="tile relative block size-[79px]">
                <Image src={t.image} alt="" fill sizes="79px" className="tile-photo object-contain" />
              </span>
              <span className="mt-[7px] text-center text-[12.25px] leading-[15.93px] uppercase">{t.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
