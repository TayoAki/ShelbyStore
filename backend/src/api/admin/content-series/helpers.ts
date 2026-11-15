import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { loadSeriesDetail } from "../../../lib/content-data"

export const toSlug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const DATE_FIELDS = ["published_at", "metrics_recorded_at"]

/** ISO strings → Date for module input. */
export function withDates<T extends Record<string, any>>(body: T): T {
  const out: Record<string, any> = { ...body }
  for (const f of DATE_FIELDS) {
    if (typeof out[f] === "string") out[f] = new Date(out[f])
  }
  return out as T
}

export async function getSeriesDetail(container: MedusaContainer, id: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const detail = await loadSeriesDetail(query, id)
  if (!detail) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Content series ${id} not found`)
  }
  return detail
}
