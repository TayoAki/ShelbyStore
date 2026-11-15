import { router, Stack } from "expo-router"

import { Screen } from "@/components/screen"
import { EmptyState } from "@/components/state-views"

export default function NotFound() {
  return (
    <Screen>
      <Stack.Screen options={{ title: "Not found" }} />
      <EmptyState
        title="This page doesn't exist"
        body="The link may be old, or the drop may have moved."
        actionTitle="Go home"
        onAction={() => router.replace("/")}
      />
    </Screen>
  )
}
