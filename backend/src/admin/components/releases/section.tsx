import { Container, Heading, Text } from "@medusajs/ui"
import { ReactNode } from "react"

export const Section = ({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}) => (
  <Container className="divide-y p-0">
    <div className="flex items-start justify-between gap-x-4 px-6 py-4">
      <div>
        <Heading level="h2">{title}</Heading>
        {subtitle && (
          <Text size="small" className="text-ui-fg-subtle">
            {subtitle}
          </Text>
        )}
      </div>
      {actions}
    </div>
    <div className="px-6 py-4">{children}</div>
  </Container>
)

export const Field = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <div className="flex flex-col gap-y-1.5">
    <Text size="small" weight="plus">
      {label}
    </Text>
    {children}
    {hint && (
      <Text size="xsmall" className="text-ui-fg-subtle">
        {hint}
      </Text>
    )}
  </div>
)

export const Stat = ({
  label,
  value,
  tone,
  hint,
}: {
  label: string
  value: ReactNode
  tone?: "good" | "bad" | "neutral"
  hint?: string
}) => (
  <div className="bg-ui-bg-subtle flex flex-col gap-y-1 rounded-lg p-4">
    <Text size="xsmall" className="text-ui-fg-subtle uppercase tracking-wide">
      {label}
    </Text>
    <Text
      size="xlarge"
      weight="plus"
      className={
        tone === "good" ? "text-ui-fg-interactive" : tone === "bad" ? "text-ui-fg-error" : undefined
      }
    >
      {value}
    </Text>
    {hint && (
      <Text size="xsmall" className="text-ui-fg-subtle">
        {hint}
      </Text>
    )}
  </div>
)
