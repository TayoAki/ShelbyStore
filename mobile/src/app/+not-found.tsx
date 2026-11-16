import { router, Stack } from "expo-router"

import { Screen } from "@/components/screen"
import { EmptyState } from "@/components/state-views"

export default function NotFound() {
  return (
    <Screen>
      <Stack.Screen options={{ title: "NOT FOUND" }} />
      <EmptyState
        icon="compass-outline"
        title="This Page Doesn't Exist"
        body="The link may be old, or the drop may have moved."
        actionTitle="Go home"
        onAction={() => router.replace("/")}
      />
    </Screen>
  )
}
