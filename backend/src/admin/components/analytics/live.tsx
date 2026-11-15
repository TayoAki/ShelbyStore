import { Badge, Container, Heading, Input, Table, Text } from "@medusajs/ui"
import { useState } from "react"
import { useLiveEvents } from "../../lib/analytics"

export function LiveTab() {
  const [event, setEvent] = useState("")
  const { data, isLoading } = useLiveEvents(event.trim() || undefined)
  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Live events</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Latest 100 events, refreshed every 5 seconds.
          </Text>
        </div>
        <Input size="small" className="w-56" placeholder="Filter by event name" value={event} onChange={(e) => setEvent(e.target.value)} />
      </div>
      {isLoading ? (
        <Text size="small" className="px-6 pb-4">
          Loading…
        </Text>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Time</Table.HeaderCell>
              <Table.HeaderCell>Event</Table.HeaderCell>
              <Table.HeaderCell>Person</Table.HeaderCell>
              <Table.HeaderCell>Path</Table.HeaderCell>
              <Table.HeaderCell>Asset</Table.HeaderCell>
              <Table.HeaderCell>Device</Table.HeaderCell>
              <Table.HeaderCell>Properties</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(data?.events ?? []).map((e) => (
              <Table.Row key={e.id}>
                <Table.Cell>{new Date(e.occurred_at).toLocaleTimeString()}</Table.Cell>
                <Table.Cell>
                  <Badge size="2xsmall" color={e.event.startsWith("$") ? "grey" : e.event === "order_completed" ? "green" : "blue"}>
                    {e.event}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <code title={e.distinct_id}>{e.distinct_id.slice(0, 10)}</code>
                </Table.Cell>
                <Table.Cell className="max-w-[200px] truncate">{e.path ?? "—"}</Table.Cell>
                <Table.Cell>{e.asset ?? "—"}</Table.Cell>
                <Table.Cell>{e.device_type ?? e.platform}</Table.Cell>
                <Table.Cell className="max-w-[280px] truncate">
                  <code className="text-ui-fg-subtle">{e.properties ? JSON.stringify(e.properties) : ""}</code>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  )
}
