import Image from "next/image"

/**
 * One numbered reason in a listicle (SITE_SPEC §12.2): a numbered heading, a
 * short body, and the image that shows the reason. Images alternate sides on
 * desktop and sit above the text on mobile.
 */
export function ReasonBlock({
  n,
  title,
  image,
  media,
  flip = false,
  children,
}: {
  n: number
  title: string
  image: { src: string; alt: string } | null
  /** Custom media instead of one image (e.g. a colour grid). */
  media?: React.ReactNode
  flip?: boolean
  children: React.ReactNode
}) {
  return (
    <article id={`reason-${n}`} className="grid scroll-mt-28 gap-6 border-t border-line py-10 lg:grid-cols-2 lg:items-center lg:gap-14 lg:py-16">
      {media ? (
        <div className={flip ? "lg:order-2" : ""}>{media}</div>
      ) : (
        image && (
          <div className={`relative aspect-[4/5] overflow-hidden bg-paper ${flip ? "lg:order-2" : ""}`}>
            <Image src={image.src} alt={image.alt} fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
          </div>
        )
      )}
      <div className="flex flex-col gap-4">
        <p className="font-mono text-[13px] text-accent-ink">{String(n).padStart(2, "0")}</p>
        <h2 className="font-display text-[30px] leading-[0.95] lg:text-[44px]">{title}</h2>
        <div className="flex flex-col gap-4 text-[16px] leading-relaxed text-ink-muted lg:text-[17px]">{children}</div>
      </div>
    </article>
  )
}
