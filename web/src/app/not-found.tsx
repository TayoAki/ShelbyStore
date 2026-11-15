import { Container } from "@/components/container"
import { ButtonLink } from "@/components/ui/button"

export default function NotFound() {
  return (
    <Container className="flex flex-col items-start gap-4 py-24">
      <h1 className="font-display text-section">Not here</h1>
      <p className="text-ink-muted">That page doesn&apos;t exist, or the drop has moved.</p>
      <ButtonLink href="/">Back to the shop</ButtonLink>
    </Container>
  )
}
