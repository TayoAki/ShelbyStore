import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartBar } from "@medusajs/icons"
import { Container, Heading, Tabs, Text } from "@medusajs/ui"
import { ExperimentsTab } from "../../components/analytics/experiments"
import { FunnelsTab } from "../../components/analytics/funnels"
import { LiveTab } from "../../components/analytics/live"
import { OverviewTab } from "../../components/analytics/overview"

const AnalyticsPage = () => (
  <div className="flex flex-col gap-y-3">
    <Container className="px-6 py-4">
      <Heading level="h1">Analytics</Heading>
      <Text size="small" className="text-ui-fg-subtle">
        Shelby&apos;s own product analytics: every event stays in our database. Funnels, experiments and tracked links in one place.
      </Text>
    </Container>
    <Tabs defaultValue="overview">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="funnels">Funnels</Tabs.Trigger>
        <Tabs.Trigger value="experiments">Experiments</Tabs.Trigger>
        <Tabs.Trigger value="live">Live events</Tabs.Trigger>
      </Tabs.List>
      <div className="mt-3">
        <Tabs.Content value="overview">
          <OverviewTab />
        </Tabs.Content>
        <Tabs.Content value="funnels">
          <FunnelsTab />
        </Tabs.Content>
        <Tabs.Content value="experiments">
          <ExperimentsTab />
        </Tabs.Content>
        <Tabs.Content value="live">
          <LiveTab />
        </Tabs.Content>
      </div>
    </Tabs>
  </div>
)

export const config = defineRouteConfig({
  label: "Analytics",
  icon: ChartBar,
})

export default AnalyticsPage
