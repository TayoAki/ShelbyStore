import AsyncStorage from "@react-native-async-storage/async-storage"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

const KEY = "shelby.reminded_releases"
const QUERY_KEY = ["reminded-releases"]

async function readIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

/** Remembers which drops this device asked to be notified about, so every card shows "On the list". */
export function useReminderList() {
  const queryClient = useQueryClient()
  const { data: ids = [] } = useQuery({ queryKey: QUERY_KEY, queryFn: readIds, staleTime: Infinity })

  const add = useCallback(
    async (releaseId: string) => {
      const next = Array.from(new Set([...(await readIds()), releaseId]))
      await AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined)
      queryClient.setQueryData(QUERY_KEY, next)
    },
    [queryClient]
  )

  return { ids, add, has: (releaseId: string) => ids.includes(releaseId) }
}
