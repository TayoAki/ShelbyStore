import { Redirect } from "expo-router"

/** /drops became The Card (APP_SPEC G.5): old deep links keep working. */
export default function DropsRedirect() {
  return <Redirect href="/card" />
}
