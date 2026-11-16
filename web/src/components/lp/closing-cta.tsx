import { ButtonLink } from "../ui/button"
import { Container } from "../container"

type Cta = { href: string; label: string; track: string }

/** The closing action: one restated decision and one button (SITE_SPEC §12.0). */
export function ClosingCta({ title, body, cta, secondary }: { title: string; body?: string; cta: Cta; secondary?: Cta }) {
  return (
    <section className="bg-ink py-12 text-page lg:py-20">
      <Container className="flex flex-col items-start gap-5">
        <h2 className="max-w-3xl font-display text-section">{title}</h2>
        {body && <p className="max-w-xl text-[16px] leading-relaxed text-ink-inverse-muted">{body}</p>}
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <ButtonLink href={cta.href} variant="inverse" track={cta.track} block>
            {cta.label}
          </ButtonLink>
          {secondary && (
            <ButtonLink href={secondary.href} variant="ghost" track={secondary.track} className="text-page hover:text-ink-inverse-muted">
              {secondary.label}
            </ButtonLink>
          )}
        </div>
      </Container>
    </section>
  )
}
