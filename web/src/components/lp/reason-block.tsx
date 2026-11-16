import { CheckCircle } from "@phosphor-icons/react/dist/ssr"
import Image from "next/image"

/**
 * One numbered reason in a listicle (SITE_SPEC §12.2), in Melin's article
 * style: an article H2 ("1. …"), the image at column width (contain on white,
 * or cover for lifestyle), the paragraphs, and "the fact" line.
 */
export function ReasonBlock({
  n,
  title,
  image,
  media,
  fact,
  children,
}: {
  n: number
  title: string
  image: { src: string; alt: string } | null
  media?: React.ReactNode
  fact?: string | null
  children: React.ReactNode
}) {
  const lifestyle = image ? !/\/hats\/[a-z-]+-\d\.jpg$/.test(image.src) : false
  return (
    <section id={`reason-${n}`} className="scroll-mt-[130px]">
      <h2 className="article-h2">
        {n}. {title}
      </h2>
      {media ??
        (image && (
          <div className={`relative mb-4 aspect-square max-h-[448px] w-full ${lifestyle ? "" : "bg-white"}`}>
            <Image src={image.src} alt={image.alt} fill sizes="(min-width:1024px) 672px, 100vw" className={lifestyle ? "object-cover" : "object-contain"} />
          </div>
        ))}
      <div className="[&_p]:article-p">{children}</div>
      {fact && (
        <p className="flex items-start gap-2 font-body text-[13px] text-muted">
          <CheckCircle size={14} weight="fill" className="mt-[2px] shrink-0 text-black" aria-hidden />
          {fact}
        </p>
      )}
    </section>
  )
}
