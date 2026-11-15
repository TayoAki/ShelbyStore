import { Badge, Button, Input, Table, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { AdminRelease, useUpdateRelease } from "../../lib/releases"
import { sdk } from "../../lib/sdk"
import { Section } from "./section"

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"]
const sizeRank = (title: string) => {
  const size = title.split(" / ")[0]
  const i = SIZE_ORDER.indexOf(size)
  return i === -1 ? 99 : i
}

export const ProductsSection = ({ release }: { release: AdminRelease }) => {
  const update = useUpdateRelease(release.id)
  const [q, setQ] = useState("")
  const ids = release.products.map((p) => p.id)
  const locked = release.status === "live" || release.status === "reviewed"

  const search = useQuery({
    queryKey: ["release-product-search", q],
    queryFn: () => sdk.admin.product.list({ q, limit: 8, fields: "id,title,status,thumbnail" }),
    enabled: q.trim().length > 1,
  })

  const setProducts = (product_ids: string[]) => update.mutate({ product_ids })

  return (
    <Section
      title="Products and stock"
      subtitle="Stock by size is checked again at go-live. Variant unit cost comes from variant metadata (unit_cost)."
    >
      <div className="flex flex-col gap-y-4">
        {release.products.map((p) => (
          <div key={p.id} className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-3">
                {p.thumbnail && <img src={p.thumbnail} alt="" className="h-10 w-10 rounded object-cover" />}
                <div>
                  <Text size="small" weight="plus">
                    {p.title}
                  </Text>
                  <Badge size="2xsmall" color={p.status === "published" ? "green" : "grey"}>
                    {p.status}
                  </Badge>
                </div>
              </div>
              {!locked && (
                <Button
                  size="small"
                  variant="transparent"
                  onClick={() => setProducts(ids.filter((id) => id !== p.id))}
                >
                  Remove
                </Button>
              )}
            </div>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Variant</Table.HeaderCell>
                  <Table.HeaderCell>Available</Table.HeaderCell>
                  <Table.HeaderCell>Unit cost</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {[...p.variants]
                  .sort((a, b) => sizeRank(a.title) - sizeRank(b.title) || a.title.localeCompare(b.title))
                  .map((v) => (
                    <Table.Row key={v.id}>
                      <Table.Cell>{v.title}</Table.Cell>
                      <Table.Cell>
                        {v.available === null ? (
                          "Not tracked"
                        ) : v.available <= 0 ? (
                          <Badge size="2xsmall" color="red">
                            Out of stock
                          </Badge>
                        ) : (
                          v.available
                        )}
                      </Table.Cell>
                      <Table.Cell>{v.unit_cost ?? <Text size="small" className="text-ui-fg-error">missing</Text>}</Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table>
          </div>
        ))}

        {!release.products.length && (
          <Text size="small" className="text-ui-fg-subtle">
            No products yet. Products stay unpublished until the release goes live.
          </Text>
        )}

        {!locked && (
          <div className="flex flex-col gap-y-2">
            <Input
              placeholder="Search products to add…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              size="small"
            />
            {search.data?.products
              .filter((p) => !ids.includes(p.id))
              .map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <Text size="small">
                    {p.title}{" "}
                    <Badge size="2xsmall" color="grey">
                      {p.status}
                    </Badge>
                  </Text>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => {
                      setProducts([...ids, p.id])
                      setQ("")
                    }}
                  >
                    Add
                  </Button>
                </div>
              ))}
          </div>
        )}
      </div>
    </Section>
  )
}
