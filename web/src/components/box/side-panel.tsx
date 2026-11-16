import { POLICY } from "@/lib/policy"
import { crownCm } from "@/lib/rope"
import type { Product } from "@/lib/types"

const ORDER = ["Crown", "Panels", "Rope", "Brim", "Closure", "Fabric", "Sweatband", "Care"]

/** Parse "11–11.5" into [11, 11.5]; a single value repeats. */
function range(cm: string | null): [number, number] | null {
  if (!cm) return null
  const nums = cm.split(/[–-]/).map((x) => Number.parseFloat(x.trim())).filter((n) => Number.isFinite(n))
  if (!nums.length) return null
  return [nums[0], nums[nums.length - 1]]
}

/**
 * The box's side panel: the crown drawn to true size beside a high-crown rope
 * cap's published 12 cm, then the printed spec block. On scroll the box turns
 * from its front to this panel (the page's one authored scroll moment).
 */
export function SidePanel({ product, id = "spec", headingLevel = "h2" }: { product: Product; id?: string; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel
  const cm = range(crownCm(product))
  const details = ((product.metadata as { details?: Record<string, string> } | null)?.details ?? {}) as Record<string, string>
  const rows = ORDER.filter((k) => details[k]).map((k) => [k, details[k]] as const)
  const top = cm ? cm[1] : null
  const low = cm ? cm[0] : null

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="panel panel-turn">
      <span className="panel-inner" aria-hidden />
      <div className="relative grid grid-cols-[minmax(0,1fr)] gap-10 p-[var(--panel-pad)] lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16">
        {top !== null && low !== null && (
          <figure className="flex flex-col gap-4">
            <svg
              role="img"
              aria-label={`The Rope Cap's crown, ${crownCm(product)} cm, drawn beside a 12 cm high crown`}
              width="7.2cm"
              height="13.4cm"
              viewBox="0 0 72 134"
              className="max-w-full overflow-visible text-ink"
            >
              {/* ruler: a tick every centimetre, a longer tick every five */}
              <line x1="6" y1="4" x2="6" y2="130" stroke="currentColor" strokeWidth="0.6" />
              {Array.from({ length: 13 }, (_, i) => (
                <g key={i}>
                  <line x1="6" x2={i % 5 === 0 ? 1 : 3} y1={130 - i * 10} y2={130 - i * 10} stroke="currentColor" strokeWidth="0.6" />
                  {i % 2 === 0 && (
                    <text x="9" y={130 - i * 10 + 1.4} fontSize="3.6" fill="currentColor" fontFamily="var(--font-label)" fontWeight="700">
                      {i}
                    </text>
                  )}
                </g>
              ))}
              {/* the high crown, outlined */}
              <rect x="20" y={130 - 120} width="20" height="120" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 1.6" />
              {/* Shelby's crown: solid to the low end of the range, lighter to the high end */}
              <rect x="46" y={130 - low * 10} width="20" height={low * 10} fill="currentColor" />
              {top > low && <rect x="46" y={130 - top * 10} width="20" height={(top - low) * 10} fill="currentColor" fillOpacity="0.45" />}
              <line x1="16" x2="70" y1={130 - 120} y2={130 - 120} stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 1" />
              <line x1="16" x2="70" y1="130" y2="130" stroke="currentColor" strokeWidth="0.8" />
            </svg>
            <figcaption className="grid max-w-[18rem] grid-cols-2 gap-3 text-[0.875rem] leading-5">
              <span>
                <span className="label block">High crown</span>12 cm, published spec
              </span>
              <span>
                <span className="label block">The Rope Cap</span>
                {crownCm(product)} cm
              </span>
            </figcaption>
            <p className="text-[0.8125rem] text-ink-2">Drawn to scale. Exact at standard screen density.</p>
          </figure>
        )}

        <div className="flex flex-col gap-6">
          <H id={`${id}-title`} className="panel-title max-w-[14ch]">
            The crown sits lower.
          </H>
          <p className="max-w-[60ch] text-[1.125rem] leading-[1.6]">
            The rope caps that sell best are built high, and their buyers say the height takes getting used to. The Rope Cap is cut to a mid crown, about {crownCm(product) ?? "11–11.5"} cm, so it sits on your head the first time you put it on.
          </p>
        </div>

        {/* The spec, printed as a plate of units across the panel's foot. */}
        <dl className="plate grid-cols-1 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
          {[...rows, ["Fit", `One size, ${POLICY.oneSize}`] as const].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 p-4">
              <dt className="label">{k}</dt>
              <dd className="text-[1rem] leading-6">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
