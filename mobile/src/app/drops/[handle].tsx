import { Redirect, useLocalSearchParams } from "expo-router"

/** /drops/[handle] → /card/[handle] for old deep links and pushes. */
export default function DropRedirect() {
  const { handle } = useLocalSearchParams<{ handle: string }>()
  return <Redirect href={{ pathname: "/card/[handle]", params: { handle: handle ?? "" } }} />
}
