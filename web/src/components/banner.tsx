import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

/**
 * Allbirds' collection banner (v5 §6.3 item 1): rounded photo with the banner
 * veil, breadcrumb at the top, H1 + description at the bottom left.
 */
export function Banner({ image, crumbs, title, description, extra, titleClass = "" }: { image: string; crumbs: { label: string; href?: string }[]; title: string; description?: ReactNode; extra?: ReactNode; titleClass?: string }) {
  return (
    <section data-hero="" className="relative m-2.5 aspect-square overflow-hidden rounded-2xl text-white md:aspect-[3/1] lg:aspect-[4/1]">
      <Image src={image} alt="" fill preload sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,.35),rgba(0,0,0,0))]" aria-hidden />
      <div className="absolute inset-0 flex flex-col">
        <nav aria-label="Breadcrumb" className="px-2.5 pt-15 text-xs leading-4 lg:pt-16">
          {crumbs.map((c, i) => (
            <span key={c.label}>
              {i > 0 && " / "}
              {c.href ? (
                <Link href={c.href} className="hover:underline">
                  {c.label}
                </Link>
              ) : (
                c.label
              )}
            </span>
          ))}
        </nav>
        <div className="flex flex-1 flex-col items-start justify-end p-6 md:-mt-6">
          <h1 className={`mb-2 font-display text-xl leading-6 md:text-2xl md:leading-8 ${titleClass}`}>{title}</h1>
          {description && <div className="text-sm leading-5 text-natural-white md:max-w-1/2">{description}</div>}
          {extra}
        </div>
      </div>
    </section>
  )
}
