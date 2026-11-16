import { ButtonLink } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-2.5 flex flex-col items-center gap-4 rounded-3xl bg-white px-5 py-24 text-center">
      <h1 className="font-display text-2xl leading-8 md:text-[30px] md:leading-9">Page not found</h1>
      <p className="text-sm leading-5 text-light-charcoal">That page doesn&apos;t exist, or the hole has moved.</p>
      <ButtonLink href="/products/rope-cap">SHOP THE ROPE CAP</ButtonLink>
    </div>
  )
}
