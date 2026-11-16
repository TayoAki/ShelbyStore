import Image from "next/image"
import Link from "next/link"
import { formatMoney } from "@/lib/format"
import { holeDate, pad2, type Hole } from "@/lib/rope"
import { RopeRule } from "./rope-rule"
import { TeeSheetDisclosure } from "./tee-sheet-disclosure"

const STATUS_LABEL: Record<Hole["status"], string> = {
  live: "LIVE",
  upcoming: "UPCOMING",
  announced: "ANNOUNCED",
  sold_out: "SOLD OUT",
  ended: "ENDED",
}

/**
 * One hole on The Card (SITE_SPEC G.5.5): the v5 product-card box with the hole
 * number, status, image (or the hole number on golf tint for announced holes),
 * name, date, rope rule, edition line, price and a CTA by status. Sold-out and
 * ended holes stay visible (the archive is the card). Lift on hover (M37).
 */
export function HoleCard({ hole, price }: { hole: Hole; price: number | null }) {
  const { day, time } = holeDate(hole.date)
  const colorName = hole.core ? "Tour White" : hole.name
  const href = hole.productHandle ? `/products/${hole.productHandle}` : hole.handle ? `/card/${hole.handle}` : null
  const editionLine = hole.core
    ? "CORE · OPEN RUN"
    : hole.size
      ? hole.status === "live" && hole.left !== null
        ? `${hole.left} OF ${hole.size} LEFT`
        : `EDITION OF ${hole.size}`
      : null

  return (
    <article className="hole-card flex flex-col overflow-hidden rounded-2xl bg-white" data-track="card_hole">
      <div className="flex items-center justify-between p-4">
        <span className="label-score">HOLE {pad2(hole.hole)}</span>
        <span className="badge">{STATUS_LABEL[hole.status]}</span>
      </div>
      <div className="relative aspect-square overflow-hidden bg-white">
        {hole.image ? (
          <Image src={hole.image} alt={`${hole.name}, Hole ${hole.hole}`} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-contain" />
        ) : (
          <div className="flex size-full items-center justify-center bg-golf-tint">
            <span className="font-display text-[40px] leading-[48px] tabular-nums text-midnight">{pad2(hole.hole)}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="kicker text-black">{hole.name}</h3>
        <p className="label-score">
          {hole.status === "announced" ? `ANNOUNCED · ${day ?? ""}` : hole.core ? "LIVE NOW" : `${day ?? "DATE TBC"}${time ? ` · ${time.toUpperCase()}` : ""}`}
        </p>
        {!hole.core && hole.status !== "announced" && <RopeRule color={colorName} />}
        {hole.core && <RopeRule color="Tour White" />}
        {editionLine && <span className="badge-edition edition w-fit">{editionLine}</span>}
        {price !== null && <p className="text-xs leading-4 font-medium">{formatMoney(price)}</p>}
        {hole.moment && <p className="text-xs leading-4 text-light-charcoal">{hole.moment}</p>}
        <div className="mt-auto pt-2">
          {hole.status === "live" && href ? (
            <Link href={href} className="btn btn-secondary btn-small" data-track="card_hole">
              SHOP {hole.core ? "THE ROPE CAP" : hole.name.toUpperCase()}
            </Link>
          ) : hole.status === "upcoming" && hole.handle ? (
            <TeeSheetDisclosure releaseHandle={hole.handle} hole={hole.hole} name={hole.name} />
          ) : hole.status === "announced" ? (
            <p className="text-xs leading-4 text-light-charcoal">Announced. Details closer to the date.</p>
          ) : hole.status === "sold_out" || hole.status === "ended" ? (
            <span className="badge">SOLD OUT</span>
          ) : null}
        </div>
      </div>
    </article>
  )
}
