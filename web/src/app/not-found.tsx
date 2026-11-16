import { ButtonLink } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="panel mx-auto mt-6 flex max-w-[960px] flex-col items-start gap-5 px-[var(--panel-pad)] py-16">
      <h1 className="model">Page not found</h1>
      <p className="text-[1.125rem] leading-[1.6] text-ink-2">That page doesn&apos;t exist, or the hole has moved.</p>
      <ButtonLink href="/products/rope-cap">SHOP THE ROPE CAP</ButtonLink>
    </div>
  )
}
