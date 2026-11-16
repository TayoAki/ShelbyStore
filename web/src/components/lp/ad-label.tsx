/**
 * Sponsored-content label for advertorials (SITE_SPEC §12.3): the essay's
 * page-type guide asks for explicit labelling, and US endorsement rules expect
 * paid brand content to read as advertising.
 */
export function AdLabel({ text = "Advertisement · From Shelby" }: { text?: string }) {
  return (
    <p className="inline-flex items-center border border-ink-faint px-2 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
      {text}
    </p>
  )
}
