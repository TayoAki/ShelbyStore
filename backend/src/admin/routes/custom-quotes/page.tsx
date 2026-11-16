import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Envelope } from "@medusajs/icons"
import { Container, Drawer, Heading, Select, StatusBadge, Table, Text } from "@medusajs/ui"
import { useState } from "react"
import {
  type CustomQuote,
  type QuoteStatus,
  QUOTE_STATUS_COLOR,
  useCustomQuotes,
  useUpdateQuoteStatus,
} from "../../lib/custom-quotes"

const STATUSES: QuoteStatus[] = ["new", "quoted", "won", "lost"]
const date = (s: string | null) => (s ? new Date(s).toLocaleDateString() : "—")

/** Custom club and outing requests from the storefront's /custom page. */
const CustomQuotesPage = () => {
  const [filter, setFilter] = useState<QuoteStatus | "">("")
  const [open, setOpen] = useState<CustomQuote | null>(null)
  const { data, isLoading } = useCustomQuotes(filter)
  const update = useUpdateQuoteStatus()
  const quotes = data?.custom_quotes ?? []

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Custom quotes</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Club and outing requests: 24 caps minimum, in twelves per color, $40 a cap plus a quoted set-up.
          </Text>
        </div>
        <div className="w-40">
          <Select value={filter || "all"} onValueChange={(v) => setFilter(v === "all" ? "" : (v as QuoteStatus))}>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All statuses</Select.Item>
              {STATUSES.map((s) => (
                <Select.Item key={s} value={s}>
                  {s}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      </Container>

      <Container className="p-0">
        {isLoading ? (
          <Text size="small" className="px-6 py-4">
            Loading…
          </Text>
        ) : !quotes.length ? (
          <Text size="small" className="text-ui-fg-subtle px-6 py-8 text-center">
            No requests yet. They arrive from the storefront's Custom page.
          </Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Received</Table.HeaderCell>
                <Table.HeaderCell>Club or organisation</Table.HeaderCell>
                <Table.HeaderCell>Caps</Table.HeaderCell>
                <Table.HeaderCell>Needed by</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {quotes.map((q) => (
                <Table.Row key={q.id} className="cursor-pointer" onClick={() => setOpen(q)}>
                  <Table.Cell>{date(q.created_at)}</Table.Cell>
                  <Table.Cell>
                    {q.organisation}
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {q.name} · {q.email}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>{q.quantity}</Table.Cell>
                  <Table.Cell>{date(q.needed_by)}</Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Select
                      size="small"
                      value={q.status}
                      onValueChange={(v) => update.mutate({ id: q.id, status: v as QuoteStatus })}
                    >
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        {STATUSES.map((s) => (
                          <Select.Item key={s} value={s}>
                            {s}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>

      <Drawer open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>{open?.organisation}</Drawer.Title>
          </Drawer.Header>
          {open && (
            <Drawer.Body className="flex flex-col gap-y-4">
              <StatusBadge color={QUOTE_STATUS_COLOR[open.status]}>{open.status}</StatusBadge>
              <Field label="Contact" value={`${open.name} · ${open.email}`} />
              <Field label="Caps" value={String(open.quantity)} />
              <Field
                label="Colors"
                value={Object.entries(open.colors ?? {})
                  .map(([c, n]) => `${n} × ${c}`)
                  .join(", ")}
              />
              <Field label="Needed by" value={date(open.needed_by)} />
              <Field label="Artwork" value={open.artwork_url ?? "—"} href={open.artwork_url ?? undefined} />
              <Field label="Notes" value={open.notes ?? "—"} />
              <Field label="Rights to the artwork confirmed" value={open.rights_confirmed ? "Yes" : "No"} />
              <Field label="Received" value={new Date(open.created_at).toLocaleString()} />
            </Drawer.Body>
          )}
        </Drawer.Content>
      </Drawer>
    </div>
  )
}

const Field = ({ label, value, href }: { label: string; value: string; href?: string }) => (
  <div>
    <Text size="xsmall" className="text-ui-fg-subtle">
      {label}
    </Text>
    {href ? (
      <a href={href} target="_blank" rel="noreferrer" className="text-ui-fg-interactive txt-small break-all">
        {value}
      </a>
    ) : (
      <Text size="small" className="whitespace-pre-wrap">
        {value}
      </Text>
    )}
  </div>
)

export const config = defineRouteConfig({
  label: "Custom quotes",
  icon: Envelope,
})

export default CustomQuotesPage
