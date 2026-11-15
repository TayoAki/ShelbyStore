import { useQuery } from "@tanstack/react-query"

import { fetchCoreProducts, fetchProductByHandle, fetchProductsByIds } from "@/lib/catalog"

import { useRegion } from "./use-region"

export function useCoreProducts() {
  const region = useRegion()
  const regionId = region.data?.id
  const query = useQuery({
    queryKey: ["products", "core", regionId],
    queryFn: () => fetchCoreProducts(regionId!),
    enabled: !!regionId,
  })
  return { ...query, error: region.error ?? query.error, isLoading: region.isLoading || query.isLoading }
}

export function useProductsByIds(ids: string[], enabled = true) {
  const region = useRegion()
  const regionId = region.data?.id
  const key = [...ids].sort().join(",")
  const query = useQuery({
    queryKey: ["products", "ids", key, regionId],
    queryFn: () => fetchProductsByIds(ids, regionId!),
    enabled: enabled && !!regionId && ids.length > 0,
  })
  return { ...query, error: region.error ?? query.error, isLoading: region.isLoading || (enabled && ids.length > 0 && query.isLoading) }
}

export function useProduct(handle: string | undefined) {
  const region = useRegion()
  const regionId = region.data?.id
  const query = useQuery({
    queryKey: ["product", handle, regionId],
    queryFn: () => fetchProductByHandle(handle!, regionId!),
    enabled: !!handle && !!regionId,
  })
  return { ...query, error: region.error ?? query.error, isLoading: region.isLoading || query.isLoading }
}
