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
    <dl className="flex flex-col border-t border-line">
      {proofs.map((p) => (
        <div key={p.label} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
          <dt className="text-eyebrow pt-0.5 text-ink-muted">{p.label}</dt>
          <dd className="flex flex-col gap-1 text-[15px] leading-relaxed">
            <span>{p.body}</span>
            {p.href && (
              <Link href={p.href} className="w-fit text-[13px] underline underline-offset-4 hover:text-ink-muted" data-track={p.track}>
                {p.linkText ?? "See the details"}
              </Link>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
