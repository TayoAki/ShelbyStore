import { Container, Heading, Select, Table, Text } from "@medusajs/ui"
import { useState } from "react"
import { money, num, pct, useOverview } from "../../lib/analytics"
import { ColumnChart } from "./charts"

const Kpi = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="bg-ui-bg-subtle flex flex-col gap-1 rounded-lg p-4">
    <Text size="xsmall" className="text-ui-fg-subtle uppercase tracking-wide">
      {label}
    </Text>
    <Text size="xlarge" weight="plus">
      {value}
    </Text>
    {hint && (
      <Text size="xsmall" className="text-ui-fg-subtle">
        {hint}
      </Text>
    )}
  </div>
)

export function OverviewTab() {
  const [days, setDays] = useState(7)
  const { data, isLoading } = useOverview(days)
  const o = data?.overview

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Traffic and sales</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            First-party events from the storefront, the app and the backend.
          </Text>
        </div>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))} size="small">
          <Select.Trigger className="w-40">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="1">Last 24 hours</Select.Item>
            <Select.Item value="7">Last 7 days</Select.Item>
            <Select.Item value="30">Last 30 days</Select.Item>
            <Select.Item value="90">Last 90 days</Select.Item>
          </Select.Content>
        </Select>
      </Container>

      {isLoading || !o ? (
        <Container className="px-6 py-4">
          <Text size="small">Loading…</Text>
        </Container>
      ) : (
        <>
          <Container className="grid grid-cols-2 gap-3 px-6 py-4 md:grid-cols-4 xl:grid-cols-7">
            <Kpi label="Visitors" value={num(o.totals.visitors)} />
            <Kpi label="Sessions" value={num(o.totals.sessions)} />
            <Kpi label="Pageviews" value={num(o.totals.pageviews)} />
            <Kpi label="Bounce rate" value={pct(o.totals.bounce_rate)} hint="One view, no interaction" />
            <Kpi label="Orders" value={num(o.totals.orders)} />
            <Kpi label="Revenue" value={money(o.totals.revenue)} />
            <Kpi label="Orders / session" value={pct(o.totals.conversion_rate, 2)} />
          </Container>

          <Container className="px-6 py-4">
            <Text size="small" weight="plus" className="mb-3">
              Pageviews per day ({o.range.timezone})
            </Text>
            <ColumnChart data={o.daily.map((d) => ({ label: d.day, value: d.pageviews }))} />
          </Container>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <Container className="p-0">
              <div className="px-6 py-4">
                <Heading level="h2">Top pages</Heading>
                <Text size="small" className="text-ui-fg-subtle">
                  Time on page and scroll depth come from page-leave events.
                </Text>
              </div>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Path</Table.HeaderCell>
                    <Table.HeaderCell>Views</Table.HeaderCell>
                    <Table.HeaderCell>Visitors</Table.HeaderCell>
                    <Table.HeaderCell>Avg time</Table.HeaderCell>
                    <Table.HeaderCell>Avg scroll</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {o.top_paths.map((p) => (
                    <Table.Row key={p.path}>
                      <Table.Cell className="max-w-[240px] truncate">
                        <code>{p.path}</code>
                      </Table.Cell>
                      <Table.Cell>{num(p.views)}</Table.Cell>
                      <Table.Cell>{num(p.visitors)}</Table.Cell>
                      <Table.Cell>{p.avg_time_ms === null ? "—" : `${Math.round(p.avg_time_ms / 1000)}s`}</Table.Cell>
                      <Table.Cell>{p.avg_scroll_pct === null ? "—" : `${Math.round(p.avg_scroll_pct)}%`}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Container>

            <Container className="p-0">
              <div className="px-6 py-4">
                <Heading level="h2">Tracked links (?asset=)</Heading>
                <Text size="small" className="text-ui-fg-subtle">
                  Sessions, orders and revenue per creative asset or content episode.
                </Text>
              </div>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Asset</Table.HeaderCell>
                    <Table.HeaderCell>Sessions</Table.HeaderCell>
                    <Table.HeaderCell>Orders</Table.HeaderCell>
                    <Table.HeaderCell>Revenue</Table.HeaderCell>
                    <Table.HeaderCell>Orders / session</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {o.top_assets.map((a) => (
                    <Table.Row key={a.asset}>
                      <Table.Cell>
                        <code>{a.asset}</code>
                      </Table.Cell>
                      <Table.Cell>{num(a.sessions)}</Table.Cell>
                      <Table.Cell>{num(a.orders)}</Table.Cell>
                      <Table.Cell>{money(a.revenue)}</Table.Cell>
                      <Table.Cell>{pct(a.conversion_rate)}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Container>

            <Container className="px-6 py-4">
              <Text size="small" weight="plus" className="mb-2">
                Devices (sessions)
              </Text>
              {o.devices.map((d) => (
                <div key={d.device_type} className="flex justify-between py-1">
                  <Text size="small">{d.device_type}</Text>
                  <Text size="small">{num(d.sessions)}</Text>
                </div>
              ))}
            </Container>
            <Container className="px-6 py-4">
              <Text size="small" weight="plus" className="mb-2">
                Referrers (sessions)
              </Text>
              {o.referrers.length ? (
                o.referrers.map((r) => (
                  <div key={r.host} className="flex justify-between py-1">
                    <Text size="small">{r.host}</Text>
                    <Text size="small">{num(r.sessions)}</Text>
                  </div>
                ))
              ) : (
                <Text size="small" className="text-ui-fg-subtle">
                  No external referrers yet.
                </Text>
              )}
            </Container>
          </div>
        </>
      )}
    </div>
  )
}
