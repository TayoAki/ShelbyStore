import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import ReleaseModule from "../modules/release"

/** Releases are many-to-many with products: a drop holds several products,
 *  and a product can return in a later release. */
export default defineLink(
  { linkable: ReleaseModule.linkable.release, isList: true },
  { linkable: ProductModule.linkable.product, isList: true }
)
