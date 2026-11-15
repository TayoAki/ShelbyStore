import { CheckCircleSolid, XCircleSolid } from "@medusajs/icons"
import { Alert, Badge, Switch, Text } from "@medusajs/ui"
import { AdminRelease, useUpdateRelease } from "../../lib/releases"
import { Section } from "./section"

const MANUAL_FIELD: Record<string, keyof AdminRelease> = {
  mobile_pdp: "check_mobile_pdp",
  fulfillment: "check_fulfillment",
  channel_links: "check_channel_links",
  tracking: "check_tracking",
}

/** SOP 4 step 1: every check is critical. A failing release is held. */
export const GoLiveSection = ({ release }: { release: AdminRelease }) => {
  const update = useUpdateRelease(release.id)
  const locked = release.status === "live" || release.status === "reviewed"
  const { go_live } = release

  return (
    <Section
      title="Go / no-go"
      subtitle="Checked live at the release time. If any check fails, the release is held and the date moves."
      actions={
        <Badge color={go_live.ready ? "green" : "orange"}>
          {go_live.ready ? "Ready" : `${go_live.failures.length} open`}
        </Badge>
      }
    >
      <div className="flex flex-col gap-y-3">
        {release.status === "held" && release.hold_reason && (
          <Alert variant="warning">
            <Text size="small" weight="plus">
              Held at go-live
            </Text>
            <ul className="list-disc pl-4">
              {release.hold_reason.split("\n").map((line) => (
                <li key={line}>
                  <Text size="small">{line}</Text>
                </li>
              ))}
            </ul>
            <Text size="small">Fix these, move the date into the future, then schedule again.</Text>
          </Alert>
        )}
        {go_live.checks.map((check) => {
          const field = MANUAL_FIELD[check.key]
          return (
            <div key={check.key} className="flex items-center justify-between gap-x-4">
              <div className="flex items-start gap-x-2">
                {check.passed ? (
                  <CheckCircleSolid className="text-ui-tag-green-icon mt-0.5" />
                ) : (
                  <XCircleSolid className="text-ui-tag-red-icon mt-0.5" />
                )}
                <div>
                  <Text size="small" weight="plus">
                    {check.label}
                  </Text>
                  {check.detail && (
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {check.detail}
                    </Text>
                  )}
                </div>
              </div>
              {field && !locked ? (
                <Switch
                  checked={!!release[field]}
                  onCheckedChange={(v) => update.mutate({ [field]: v })}
                  disabled={update.isPending}
                />
              ) : (
                <Text size="xsmall" className="text-ui-fg-muted">
                  {check.source === "auto" ? "automatic" : ""}
                </Text>
              )}
            </div>
          )
        })}
      </div>
    </Section>
  )
}
