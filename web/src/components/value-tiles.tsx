import Link from "next/link"
import { Reveal } from "./motion/reveal"

/** Allbirds' value tiles before every footer (§6.0.9), true facts only (G.6.1). */
export function ValueTiles() {
  const tiles = [
    {
      eyebrow: "ONE SIZE, ADJUSTABLE",
      body: "The strap fits 21.5–23.75 in (55–60 cm). The crown sits mid, about 11–11.5 cm.",
      link: { label: "Fit guide", href: "/fit-guide", track: "fit_guide" },
    },
    { eyebrow: "ALWAYS IN STOCK", body: "Four core colors that never run out. We show the live count for each.", link: null },
    { eyebrow: "FREE SHIPPING ON $85+", body: "Any two caps ship free. Under $85, standard shipping is $6. 30-day returns.", link: null },
  ]
  return (
    <Reveal aria-label="Why Shelby" className="grid grid-cols-1 gap-2.5 p-2.5 md:min-h-60 md:grid-cols-3">
      {tiles.map((t, i) => (
        <div key={t.eyebrow} data-reveal-child="" style={{ ["--i" as string]: i, ["--stagger" as string]: "0.05s" }} className="flex flex-col justify-center gap-5 rounded-2xl bg-white px-5 pt-10 pb-8 md:justify-start md:p-8">
          <p className="eyebrow">{t.eyebrow}</p>
          <p className="text-sm leading-[21px]">
            {t.body}{" "}
            {t.link && (
              <Link href={t.link.href} data-track={t.link.track} className="link">
                {t.link.label}
              </Link>
            )}
          </p>
        </div>
      ))}
    </Reveal>
  )
}
