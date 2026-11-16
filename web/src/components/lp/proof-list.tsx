import Link from "next/link"

export type Proof = { label: string; body: React.ReactNode; href?: string; linkText?: string; track?: string }

/**
 * Proof points from real sources only: live data, product facts, policy, or
 * the content-series record (SITE_SPEC §12.0). Empty items are dropped, so a
 * missing source removes its line instead of being filled.
 */
export function ProofList({ items }: { items: (Proof | null | false | undefined | "")[] }) {
  const proofs = items.filter((p): p is Proof => !!p && !!p.body)
  if (!proofs.length) return null
  return (
    <dl className="flex flex-col border-t border-tertiary">
      {proofs.map((p) => (
        <div key={p.label} className="grid gap-1 border-b border-tertiary py-[14px] lg:grid-cols-[180px_1fr] lg:gap-6">
          <dt className="font-heading text-[14px] uppercase tracking-[1.3px]">{p.label}</dt>
          <dd className="flex flex-col gap-1 font-body text-[15px] leading-[22.5px]">
            <span>{p.body}</span>
            {p.href && (
              <Link href={p.href} className="btn btn--micro self-start" data-track={p.track}>
                <span>{p.linkText ?? "See the details"}</span>
              </Link>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
