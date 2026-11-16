import Image from "next/image"
import Link from "next/link"
import { formatMoney } from "@/lib/format"
import { holeDate, pad2, type Hole } from "@/lib/rope"
import { Digits } from "./digits"
import { TeeSheetDisclosure } from "./tee-sheet-disclosure"

const STATUS_LABEL: Record<Hole["status"], string> = {
  live: "Live",
  upcoming: "Upcoming",
  announced: "Announced",
  sold_out: "Sold out",
  ended: "Ended",
}

/**
 * One hole as a numbered unit on the card's keylined plate: the hole number in
 * digit slots, its status tag, a die-cut window onto the cap (or the number
 * alone for announced holes), name, date, edition line and the action its
 * status allows. Sold-out and ended holes stay on the plate.
 */
export function HoleCard({ hole, price }: { hole: Hole; price: number | null }) {
  const { day, time } = holeDate(hole.date)
  const href = hole.productHandle ? `/products/${hole.productHandle}` : hole.handle ? `/card/${hole.handle}` : null
  const editionLine = hole.core
    ? "Core · open run"
    : hole.size
      ? hole.status === "live" && hole.left !== null
        ? `${hole.left} of ${hole.size} left`
        : `Edition of ${hole.size}`
      : null

  return (
    <article className="flex flex-col gap-4 bg-paper p-5" data-track="card_hole">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[3.25rem] leading-none" aria-label={`Hole ${hole.hole}`}>
          <Digits value={pad2(hole.hole)} />
        </span>
        <span className={hole.status === "live" && !hole.core ? "badge-edition" : "badge"}>{STATUS_LABEL[hole.status]}</span>
      </div>
      {hole.image ? (
        <div className="window aspect-[4/3]">
          <Image src={hole.image} alt={`${hole.name}, Hole ${hole.hole}`} fill sizes="(min-width: 768px) 30vw, 90vw" className="object-contain p-[6%]" />
          <span className="window-shade" aria-hidden />
        </div>
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center rounded-[var(--radius-window)] border-2 border-dashed border-crease">
          <span className="label">Color to be announced</span>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1.5">
        <h3 className="panel-title !text-[2rem]">{hole.name}</h3>
        <p className="label">
          {hole.status === "announced" ? `Announced · ${day ?? ""}` : hole.core ? "Live now" : `${day ?? "Date to come"}${time ? ` · ${time}` : ""}`}
        </p>
        {editionLine && <p className="text-[0.9375rem]">{editionLine}</p>}
        {price !== null && <p className="text-[1.5rem] leading-none"><Digits value={formatMoney(price)} /></p>}
        {hole.moment && <p className="text-[0.9375rem] text-ink-2">{hole.moment}</p>}
        <div className="mt-auto pt-3">
          {hole.status === "live" && href ? (
            <Link href={href} className="btn btn-secondary btn-small" data-track="card_hole">
              Shop {hole.core ? "the Rope Cap" : hole.name}
            </Link>
          ) : hole.status === "upcoming" && hole.handle ? (
            <TeeSheetDisclosure releaseHandle={hole.handle} hole={hole.hole} name={hole.name} />
          ) : hole.status === "announced" ? (
            <p className="text-[0.9375rem] text-ink-2">Details closer to the date.</p>
          ) : null}
        </div>
      </div>
    </article>
  )
}
