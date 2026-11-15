import { useQuery } from "@tanstack/react-query"

import { fetchDefaultRegion } from "@/lib/catalog"

export function useRegion() {
  return useQuery({
    queryKey: ["region"],
    queryFn: fetchDefaultRegion,
    staleTime: Infinity,
  })
}
