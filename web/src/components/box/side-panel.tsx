import { POLICY } from "@/lib/policy"
import { crownCm } from "@/lib/rope"
import type { Product } from "@/lib/types"
import { CrownProfiles } from "./crown-profiles"
import { SelectedBoxRope } from "./selected-rope"

const ORDER = ["Crown", "Panels", "Rope", "Brim", "Closure", "Fabric", "Sweatband", "Care"]

/** Parse "11–11.5" into [11, 11.5]; a single value repeats. */
function range(cm: string | null): [number, number] | null {
  if (!cm) return null
  const nums = cm.split(/[–-]/).map((x) => Number.parseFloat(x.trim())).filter((n) => Number.isFinite(n))
  if (!nums.length) return null
  return [nums[0], nums[nums.length - 1]]
}

/**
 * The box's side panel: two cap profiles drawn to one scale on a shared ruler
 * baseline (the Rope Cap in the chosen ink against a 12 cm high crown), then
 * the printed spec plate. On scroll the box turns from its front to this panel
 * (the page's one authored scroll moment).
 */
export function SidePanel({
  product,
  id = "spec",
  headingLevel = "h2",
  fallbackColor = "Tour White",
  rope = false,
}: {
  product: Product
  id?: string
  headingLevel?: "h2" | "h3"
  fallbackColor?: string
  /** Rail the box's rope down this panel's left edge on a phone (home and product page). */
  rope?: boolean
}) {
  const H = headingLevel
  const cm = range(crownCm(product))
  const details = ((product.metadata as { details?: Record<string, string> } | null)?.details ?? {}) as Record<string, string>
  const rows = ORDER.filter((k) => details[k]).map((k) => [k, details[k]] as const)

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="panel panel-turn">
      {rope && <SelectedBoxRope fallback={fallbackColor} run="rail" />}
      <div className={`relative flex flex-col gap-8 p-[var(--panel-pad)] ${rope ? "pl-[calc(var(--panel-pad)+14px)] lg:pl-[var(--panel-pad)]" : ""}`}>
        <div className="flex flex-col gap-4">
          <H id={`${id}-title`} className="panel-title max-w-[14ch]">
            The crown sits lower.
          </H>
          <p className="max-w-[60ch] text-[1.125rem] leading-[1.6]">
            The rope caps that sell best are built high, and their buyers say the height takes getting used to. The Rope Cap is cut to a mid crown, about {crownCm(product) ?? "11–11.5"} cm, so it sits on your head the first time you put it on.
          </p>
        </div>

        {cm && (
          <figure className="flex flex-col gap-3">
            <CrownProfiles low={cm[0]} top={cm[1]} fallbackColor={fallbackColor} />
            <figcaption className="max-w-[46ch] text-[0.9375rem] leading-6 text-ink-2">
              Both crowns drawn to one scale against the ruler, in centimetres. The high crown is the published 12 cm of the best-selling rope caps.
            </figcaption>
          </figure>
        )}

        {/* The spec, printed as a keylined plate of units at the panel's foot. */}
        <dl className="plate grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
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
