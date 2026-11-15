import { Text } from "@medusajs/ui"

/** Minimal CSS column chart (no chart library needed). */
export function ColumnChart({
  data,
  format = (v) => v.toLocaleString(),
  height = 140,
}: {
  data: { label: string; value: number }[]
  format?: (v: number) => string
  height?: number
}) {
  const max = Math.max(1, ...data.map((d) => d.value))
  if (!data.length) {
    return (
      <Text size="small" className="text-ui-fg-subtle">
        No data in this range yet.
      </Text>
    )
  }
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end gap-1" style={{ height }} role="img" aria-label="Daily chart">
        {data.map((d) => (
          <div
            key={d.label}
            className="group flex h-full max-w-[56px] flex-1 flex-col items-center justify-end gap-1"
            title={`${d.label}: ${format(d.value)}`}
          >
            <Text size="xsmall" className="text-ui-fg-subtle opacity-0 group-hover:opacity-100">
              {format(d.value)}
            </Text>
            <div
              className="bg-ui-fg-interactive min-h-[2px] w-full rounded-t-sm opacity-80 group-hover:opacity-100"
              style={{ height: `${(d.value / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <Text size="xsmall" className="text-ui-fg-subtle">
          {data[0].label}
        </Text>
        {data.length > 1 && (
          <Text size="xsmall" className="text-ui-fg-subtle">
            {data[data.length - 1].label}
          </Text>
        )}
      </div>
    </div>
  )
}

/** Horizontal bar with a label and value, used for funnel steps and tables. */
export function HBar({ value, max, label, right }: { value: number; max: number; label: string; right: string }) {
  const width = max > 0 ? Math.max(2, (value / max) * 100) : 0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between gap-4">
        <Text size="small" weight="plus">
          {label}
        </Text>
        <Text size="small" className="text-ui-fg-subtle">
          {right}
        </Text>
      </div>
      <div className="bg-ui-bg-subtle h-3 w-full overflow-hidden rounded-sm">
        <div className="bg-ui-fg-interactive h-full rounded-sm" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}
