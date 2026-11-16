import AsyncStorage from "@react-native-async-storage/async-storage"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

const KEY = "shelby.viewed"
const QUERY_KEY = ["recently-viewed"]
const MAX = 12

async function readHandles(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? parsed.filter((h): h is string => typeof h === "string") : []
  } catch {
    return []
  }
}

/** The last 12 product handles viewed on this device, newest first (APP_SPEC §5.8). */
export function useRecentlyViewed() {
  const queryClient = useQueryClient()
  const { data: handles = [] } = useQuery({ queryKey: QUERY_KEY, queryFn: readHandles, staleTime: Infinity })

  const record = useCallback(
    async (handle: string) => {
      const next = [handle, ...(await readHandles()).filter((h) => h !== handle)].slice(0, MAX)
      await AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined)
      queryClient.setQueryData(QUERY_KEY, next)
    },
    [queryClient]
  )

  return { handles, record }
}
