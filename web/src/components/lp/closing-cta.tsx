import { ButtonLink } from "../ui/button"

type Cta = { href: string; label: string; track: string }

/**
 * The closing action (SITE_SPEC §12.0, §12.1.4): a centred heading and one
 * btn--primary btn--atc, with an optional micro link under it.
 */
export function ClosingCta({ title, body, cta, secondary }: { title: string; body?: string; cta: Cta; secondary?: Cta }) {
  return (
    <section className="flex flex-col items-center px-4 py-[50.512px] text-center">
      <h2 className="type-section">{title}</h2>
      {body && <p className="mt-3 max-w-[480px] type-body">{body}</p>}
      <ButtonLink href={cta.href} size="atc" className="mt-6 w-full max-w-[370px]" track={cta.track}>
        {cta.label}
      </ButtonLink>
      {secondary && (
        <ButtonLink href={secondary.href} variant="micro" className="mt-4" track={secondary.track}>
          {secondary.label}
        </ButtonLink>
      )}
    </section>
  )
}
