import { CREDIBILITY } from "@/lib/credibility"

/** G.5.8: renders nothing until credibility.ts holds a sourced item. */
export function CredibilityStrip() {
  if (!CREDIBILITY.length) return null
  return (
    <section aria-label="As seen" className="mx-2.5 my-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-2xl bg-white px-5 py-6">
      <span className="label-score">AS SEEN</span>
      {CREDIBILITY.map((c) =>
        c.href ? (
          <a key={c.label} href={c.href} className="label-score hover:underline" rel="noreferrer" target="_blank">
            {c.label}
          </a>
        ) : (
          <span key={c.label} className="label-score">
            {c.label}
          </span>
        )
      )}
    </section>
  )
}
