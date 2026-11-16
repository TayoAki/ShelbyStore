import { POLICY } from "@/lib/policy"
import { ropeName } from "@/lib/rope"
import type { Product } from "@/lib/types"

const ROWS: { label: string; key: string }[] = [
  { label: "CROWN", key: "Crown" },
  { label: "PANELS", key: "Panels" },
  { label: "ROPE", key: "Rope" },
  { label: "BRIM", key: "Brim" },
  { label: "CLOSURE", key: "Closure" },
  { label: "FABRIC", key: "Fabric" },
  { label: "SWEATBAND", key: "Sweatband" },
  { label: "FIT", key: "__fit" },
  { label: "ORIGIN", key: "Origin" },
  { label: "EDITION", key: "__edition" },
]

/**
 * The scorecard spec table (SITE_SPEC G.5.2): rows numbered like holes, a row
 * whose value is missing is dropped and the numbering closes up. `rows`
 * overrides the product rows (the custom page's facts table).
 */
export function Scorecard({
  product,
  color,
  edition,
  title,
  rows,
}: {
  product?: Product | null
  color?: string | null
  edition?: { size: number | null; left: number | null } | null
  title: string
  rows?: { label: string; value: string }[]
}) {
  const details = (product?.metadata as { details?: Record<string, string> } | null)?.details ?? {}
  const values =
    rows ??
    ROWS.map(({ label, key }) => {
      let value: string | null = null
      if (key === "__fit") value = `One size · ${POLICY.oneSize.replace("fits ", "")}`
      else if (key === "__edition")
        value = edition?.size ? `Edition of ${edition.size}${edition.left !== null && edition.left !== undefined ? ` · ${edition.left} left` : ""}` : null
      else if (key === "Rope") {
        const rope = ropeName(product, color)
        value = details.Rope ? `${details.Rope}${rope ? ` · ${rope}` : ""}` : null
      } else value = details[key] ?? null
      return { label, value: value ?? "" }
    }).filter((r) => r.value)

  return (
    <table className="scorecard text-black" data-reveal-child="">
      <caption className="sr-only">{title} specs</caption>
      <thead>
        <tr>
          <th scope="col" className="label-score w-[44px]">
            NO.
          </th>
          <th scope="col" className="label-score w-[104px] md:w-[140px]">
            SPEC
          </th>
          <th scope="col" className="kicker !text-white">
            {title}
          </th>
        </tr>
      </thead>
      <tbody>
        {values.map((r, i) => (
          <tr key={r.label} data-reveal-child="" style={{ ["--i" as string]: i, ["--stagger" as string]: "0.05s" }}>
            <td className="label-score !text-light-charcoal tabular-nums">{String(i + 1).padStart(2, "0")}</td>
            <th scope="row" className="label-score">
              {r.label}
            </th>
            <td className={`text-sm leading-5 text-black ${r.label === "EDITION" ? "edition" : ""}`}>{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
