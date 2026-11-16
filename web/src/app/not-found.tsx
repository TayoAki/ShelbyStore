import { ButtonLink } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container-article flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="font-heading text-[26px] uppercase leading-[39px]">Page Not Found</h1>
      <p className="font-body text-[15px]">That page doesn&apos;t exist, or the drop has moved.</p>
      <ButtonLink href="/shop" variant="light">
        Shop all hats
      </ButtonLink>
    </div>
  )
}
