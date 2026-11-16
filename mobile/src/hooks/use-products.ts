import { useQuery } from "@tanstack/react-query"

import {
  fetchCatalog,
  fetchCategories,
  fetchContentSeries,
  fetchProductByHandle,
  fetchProductsByIds,
  listable,
  type Category,
} from "@/lib/catalog"
import type { Product } from "@/lib/product"

import { useRegion } from "./use-region"

/** The whole published catalog (offers included; use `listable` for lists). */
export function useCatalog() {
  const region = useRegion()
  const regionId = region.data?.id
  const query = useQuery({
    queryKey: ["products", "catalog", regionId],
    queryFn: () => fetchCatalog(regionId!),
    enabled: !!regionId,
  })
  return { ...query, error: region.error ?? query.error, isLoading: region.isLoading || query.isLoading }
}

/** Products shoppers browse, ordered core first, then live-drop products, then the rest. */
export function useListableProducts(liveProductIds: Set<string> = new Set()) {
  const catalog = useCatalog()
  const rank = (p: Product) =>
    p.collection?.handle === "core" ? 0 : liveProductIds.has(p.id) ? 1 : 2
  const data = catalog.data ? [...listable(catalog.data)].sort((a, b) => rank(a) - rank(b)) : undefined
  return { ...catalog, data }
}

/** Categories with at least one listable product, in the store's order. */
export function useShapes() {
  const catalog = useCatalog()
  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories, staleTime: 5 * 60_000 })
  const products = catalog.data ? listable(catalog.data) : []
  const shapes: (Category & { products: Product[] })[] = (categories.data ?? [])
    .map((c) => ({
      ...c,
      products: products.filter((p) =>
        ((p as Product & { categories?: { id: string }[] | null }).categories ?? []).some((pc) => pc.id === c.id)
      ),
    }))
    .filter((c) => c.products.length > 0)
  return { data: shapes, isLoading: catalog.isLoading || categories.isLoading, error: catalog.error ?? categories.error }
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
  return {
    ...query,
    error: region.error ?? query.error,
    isLoading: region.isLoading || (enabled && ids.length > 0 && query.isLoading),
  }
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

export function useContentSeries() {
  return useQuery({ queryKey: ["content-series"], queryFn: fetchContentSeries, staleTime: 5 * 60_000 })
}
