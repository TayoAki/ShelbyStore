import Image from "next/image"
import Link from "next/link"
import { lead } from "@/components/header"
import { Rail } from "@/components/rail"
import { ButtonLink } from "@/components/ui/button"
import { CORE_COLORS } from "@/lib/rope"

/** 404 (SITE_SPEC v8 E.6.15): a centred column, two buttons and the four colours as a rail. */
export default function NotFound() {
  return (
    <>
      <div className="wrap mx-auto flex max-w-[640px] flex-col items-center pt-24 pb-12 text-center">
        <h1 className="display-xl">Out of bounds.</h1>
        <p className="mt-4 text-[14.4px]">That page isn&apos;t here.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/products/rope-cap">Shop the Rope Cap</ButtonLink>
          <ButtonLink href="/" variant="outline">
            Go Home
          </ButtonLink>
        </div>
      </div>
      <Rail label="The four colors" className="pb-16" itemClass="[grid-auto-columns:164px] md:[grid-auto-columns:278px]">
        {CORE_COLORS.map((c) => (
          <li key={c}>
            <Link href={`/products/rope-cap?color=${encodeURIComponent(c)}`} className="card block">
              <span className="tile relative block aspect-[5/6]">
                <Image src={lead(c)} alt="" fill sizes="(min-width: 750px) 278px, 164px" className="tile-photo object-contain" />
              </span>
              <span className="card-title mt-2 block px-2">{c} Rope Cap</span>
            </Link>
          </li>
        ))}
      </Rail>
    </>
  )
}
