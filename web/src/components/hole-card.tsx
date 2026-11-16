import Image from "next/image"
import Link from "next/link"
import { formatMoney } from "@/lib/format"
import { pad2, type Hole } from "@/lib/rope"
import { Countdown } from "./countdown"
import { TeeSheetDisclosure } from "./tee-sheet-disclosure"

/** "5 Apr 2027" in the store's time zone. */
export function shortDate(iso: string | null) {
  if (!iso) return null
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Los_Angeles" }).format(new Date(iso))
}

/** The meta line under a hole's title (E.5.12): "Announced · 13 Sep 2027", "Opens 5 Apr 2027", "Released". */
export function holeMeta(hole: Hole) {
  const d = shortDate(hole.date)
  if (hole.core) return "Core · open run"
  switch (hole.status) {
    case "announced":
      return d ? `Announced · ${d}` : "Announced · date to come"
    case "upcoming":
      return d ? `Opens ${d}` : "Date to come"
    case "live": {
      const parts = [hole.size ? `Edition of ${hole.size}` : null, hole.left !== null ? `${hole.left} left` : null, d ? `Released ${d}` : "Released"]
      return parts.filter(Boolean).join(" · ")
    }
    case "sold_out":
      return hole.size ? `Edition of ${hole.size} · Sold out` : "Sold out"
    case "ended":
      return "Released"
  }
}

/**
 * One hole as an Eastside product card (SITE_SPEC v8 E.5.12): the edition
 * photo on the 5:6 #F6F6F6 tile, or for a hole with no product yet its number
 * in Monomakh 96px. Title "No. 05 Away Match", the meta line, the price only
 * when a product exists, and the action its status allows.
 */
export function HoleCard({
  hole,
  price,
  linkTrack = "card_hole",
  badge,
  countdown = false,
  action = true,
  tile: ratio = "5/6",
}: {
  hole: Hole
  price: number | null
  linkTrack?: string
  badge?: string
  countdown?: boolean
  action?: boolean
  /** 5:6 product tile (rails, grids) or 4:3 (the /card blog grid). */
  tile?: "5/6" | "4/3"
}) {
  const aspect = ratio === "4/3" ? "aspect-[4/3]" : "aspect-[5/6]"
  const href = hole.productHandle ? `/products/${hole.productHandle}` : hole.handle ? `/card/${hole.handle}` : null
  const title = `No. ${pad2(hole.hole)} ${hole.name}`
  const tag = badge ?? (hole.status === "live" && !hole.core ? `No. ${pad2(hole.hole)} · Out now` : null)
  const tile = (
    <>
      {hole.image ? (
        <Image src={hole.image} alt={title} fill sizes="(min-width: 750px) 349px, 164px" className="tile-photo object-contain" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center font-display text-[96px] leading-none text-text" aria-hidden>
          {pad2(hole.hole)}
        </span>
      )}
      {(tag || hole.status === "sold_out") && (
        <span className="absolute top-[5px] left-[5px] z-[3]">
          {hole.status === "sold_out" ? <span className="badge badge-dark">Sold out</span> : <span className="badge">{tag}</span>}
        </span>
      )}
    </>
  )

  return (
    <article className="card flex h-full flex-col" data-track="card_hole">
      <div className="tile">
        {href ? (
          <Link href={href} className={`relative block ${aspect}`} aria-label={title} data-track={linkTrack}>
            {tile}
          </Link>
        ) : (
          <div className={`relative ${aspect}`}>{tile}</div>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 pt-2 pb-0.5">
        <h3 className="title-card">
          {href ? (
            <Link href={href} data-track={linkTrack}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        <p className="meta mt-[5px]">{holeMeta(hole)}</p>
        {countdown && hole.status === "upcoming" && hole.date && (
          <div className="mt-1">
            <Countdown iso={hole.date} />
          </div>
        )}
        {price !== null && hole.productHandle && <p className="price-card mt-[5px]">{formatMoney(price)}</p>}
        {hole.moment && <p className="meta mt-2">{hole.moment}</p>}
        {action && (
          <div className="mt-auto pt-3">
            {hole.status === "live" && href ? (
              <Link href={href} className="link text-[14.4px]" data-track={linkTrack}>
                {hole.core ? "Shop" : `Shop ${hole.name}`}
              </Link>
            ) : hole.status === "upcoming" && hole.handle ? (
              <TeeSheetDisclosure releaseHandle={hole.handle} hole={hole.hole} name={hole.name} />
            ) : hole.status === "announced" ? (
              <p className="meta">Details closer to the date.</p>
            ) : href ? (
              <Link href={href} className="link text-[14.4px]" data-track={linkTrack}>
                See hole
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </article>
  )
}
