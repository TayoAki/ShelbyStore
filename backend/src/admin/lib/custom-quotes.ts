import { toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { sdk } from "./sdk"

export type QuoteStatus = "new" | "quoted" | "won" | "lost"

export type CustomQuote = {
  id: string
  name: string
  email: string
  organisation: string
  quantity: number
  colors: Record<string, number>
  needed_by: string | null
  artwork_url: string | null
  notes: string | null
  rights_confirmed: boolean
  status: QuoteStatus
  source: Record<string, unknown> | null
  created_at: string
}

export const QUOTE_STATUS_COLOR: Record<QuoteStatus, "blue" | "orange" | "green" | "grey"> = {
  new: "blue",
  quoted: "orange",
  won: "green",
  lost: "grey",
}

export const useCustomQuotes = (status?: QuoteStatus | "") =>
  useQuery({
    queryKey: ["custom-quotes", status ?? ""],
    queryFn: () =>
      sdk.client.fetch<{ custom_quotes: CustomQuote[]; count: number }>("/admin/custom-quotes", {
        query: status ? { status } : {},
      }),
  })

export const useUpdateQuoteStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuoteStatus }) =>
      sdk.client.fetch<{ custom_quote: CustomQuote }>(`/admin/custom-quotes/${id}`, { method: "POST", body: { status } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custom-quotes"] })
      toast.success("Status updated")
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
