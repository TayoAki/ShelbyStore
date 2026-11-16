import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Carousel } from "@/components/carousel"
import { Scale } from "@/components/fit-scale"
import { ButtonLink } from "@/components/ui/button"
import { getRegion, listProducts } from "@/lib/data/catalog"
import { colorThumbs, detailsOf, fitProfileOf, imagesFor, isOneSize, meta, oneSizeRange, shapeOf } from "@/lib/product"
import { POLICY } from "@/lib/policy"
import type { Product } from "@/lib/types"

export const metadata: Metadata = {
  title: "Fit guide",
  description: "How Shelby hats fit: one size adjustable from 21.5 to 23.75 in, sized styles in S/M and L/XL, crown height and structure for every style.",
}

const SIZE_TABLE = [
  { size: "One Size (adjustable)", inches: "21.5–23.75", cm: "55–60", fitted: "6⅞–7½" },
  { size: "S/M", inches: "21.5–22.5", cm: "55–57", fitted: "6⅞–7⅛" },
  { size: "L/XL", inches: "22.75–23.75", cm: "58–60", fitted: "7¼–7½" },
]

const STEPS = [
  "Wrap a soft tape measure around your head, just above the ears and about a finger's width above your eyebrows.",
  "Keep it level and snug, not tight. Read the number where the tape meets.",
  "Between two sizes? Size up. For one-size hats, any reading in the range fits.",
]

/** Melin's fit-guide page (SITE_SPEC §6.5), built from published products and their fit profiles. */
export default async function FitGuidePage() {
  const region = await getRegion()
  const products = region ? await listProducts(region.id) : []
  const styles = products.filter((p) => fitProfileOf(p) || shapeOf(p)?.handle === "beanies")

  return (
    <>
      <section className="bg-primary text-white">
        <div className="max-w-[640px] px-5 py-10 lg:ml-[240px] lg:px-0">
          <h1 className="font-heading text-[34px] uppercase leading-[51px]">Find Your Fit</h1>
          <p className="font-body text-[16px] leading-6 lg:text-[18px] lg:leading-[27px]">
            Most Shelby hats are one size: the strap or snap fits 21.5–23.75 in (55–60 cm). Sized styles come in S/M and L/XL.
          </p>
          <ButtonLink href="/quiz" variant="highlight" className="mt-4" track="fit_guide_quiz">
            Take the quiz
          </ButtonLink>
        </div>
      </section>

      <section className="bg-white py-[38px]">
        <div className="px-4 lg:px-[67px]">
          <Carousel item="w-[311px]" gap="gap-[21px]" label="Styles">
            {styles.map((p) => (
              <div key={p.id} className="flex h-[294px] flex-col items-center bg-tile px-5 pt-[22px] text-center">
                <span className="relative block h-[101px] w-[129px]">
                  <Image src={lead(p)} alt="" fill sizes="129px" className="cutout object-contain" />
                </span>
                <h2 className="mt-4 font-heading text-[22px] uppercase leading-[33px]">{p.title.replace(/^The /, "")}</h2>
                <p className="mt-[6px] line-clamp-3 max-w-[269px] font-body text-[15px] leading-[22.5px]">{firstSentence(meta(p, "fit_notes"))}</p>
                <Link href={`#${p.handle}`} className="btn btn--link mt-3">
                  <span>Learn more</span>
                </Link>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {styles.map((p) => (
        <StyleModule key={p.id} product={p} />
      ))}

      <section className="bg-tile py-[50.512px]">
        <div className="mx-auto grid max-w-[960px] gap-10 px-4 lg:grid-cols-2 lg:px-0">
          <div>
            <h2 className="mb-5 type-section uppercase">How To Measure</h2>
            <ol className="flex flex-col gap-4">
              {STEPS.map((s, i) => (
                <li key={s} className="flex gap-4">
                  <span className="font-heading text-[14px]">{i + 1}</span>
                  <span className="font-body text-[15px] leading-[22.5px]">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="mb-5 type-section uppercase">Sizes</h2>
            <table className="w-full border-collapse">
              <caption className="sr-only">Hat sizes by head circumference</caption>
              <thead>
                <tr>
                  {["Size", "Inches", "Cm", "Fitted"].map((h) => (
                    <th key={h} scope="col" className="border-b border-tertiary py-[10px] pr-3 text-left font-heading text-[12px] uppercase tracking-[1.3px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIZE_TABLE.map((r) => (
                  <tr key={r.size}>
                    <td className="border-b border-tertiary py-[10px] pr-3 font-body text-[14px]">{r.size}</td>
                    <td className="border-b border-tertiary py-[10px] pr-3 font-body text-[14px]">{r.inches}</td>
                    <td className="border-b border-tertiary py-[10px] pr-3 font-body text-[14px]">{r.cm}</td>
                    <td className="border-b border-tertiary py-[10px] font-body text-[14px]">{r.fitted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}

function StyleModule({ product }: { product: Product }) {
  const profile = fitProfileOf(product)
  const photos = imagesFor(product, colorThumbs(product)[0]?.color)
  const d = Object.fromEntries(detailsOf(product))
  const oneSize = isOneSize(product)
  const name = product.title.replace(/^The /, "")
  const circumference = oneSize
    ? [["One Size", oneSizeRange(product, POLICY.oneSize).replace(/^fits /, "")]]
    : [
        ["S/M", "55–57 cm / 21.5–22.5 in"],
        ["L/XL", "58–60 cm / 22.75–23.75 in"],
      ]
  const cards: { title: string; image: string | undefined; rows: string[][]; scale?: React.ReactNode }[] = [
    ...(profile
      ? [
          {
            title: "Crown Height",
            image: photos[2] ?? photos[0],
            rows: [
              ["Profile", profile.crown],
              ["Structure", profile.structure],
            ],
            scale: <Scale title="Crown Height" steps={["Low", "Mid", "Tall"]} value={profile.crown} />,
          },
        ]
      : []),
    { title: "Circumference", image: photos[0], rows: circumference },
    {
      title: d.Brim ? "Brim" : "Knit",
      image: photos[1] ?? photos[0],
      rows: [d.Brim ? ["Brim", d.Brim] : ["Knit", d.Knit ?? "Rib knit"], ...(d.Closure ? [["Closure", d.Closure]] : [])],
    },
  ]
  return (
    <section id={product.handle} className="scroll-mt-[100px] border-t border-tertiary bg-white pb-14 pt-7">
      <div className="mx-auto max-w-[960px] px-4 lg:px-0">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <span className="relative order-first block aspect-[486/430] w-full lg:order-last lg:w-[486px]">
            <Image src={photos[2] ?? photos[0] ?? "/hats/everyday-cap-black-3.jpg"} alt={product.title} fill sizes="(min-width:1024px) 486px, 100vw" className="object-contain" />
          </span>
          <div className="lg:w-[440px]">
            <h2 className="font-heading text-[26px] uppercase leading-[33.8px]">{name}</h2>
            {product.description && <p className="mt-3 type-body">{product.description}</p>}
            {meta(product, "fit_notes") && <p className="mt-3 font-body text-[14px] text-muted">{meta(product, "fit_notes")}</p>}
            <ButtonLink href={`/products/${product.handle}`} variant="light" className="mt-6" track="fit_guide_shop">
              Shop the {name}
            </ButtonLink>
          </div>
        </div>
        <div className="scrollbar-none mt-10 flex gap-4 overflow-x-auto lg:justify-center lg:gap-[98px] lg:overflow-visible">
          {cards.map((c) => (
            <div key={c.title} className="w-[235px] shrink-0">
              <span className="relative block h-[159px] w-[235px] bg-tile">
                {c.image && <Image src={c.image} alt="" fill sizes="235px" className="cutout object-contain" />}
              </span>
              <h3 className="mt-3 font-heading text-[18px] uppercase leading-[27px]">{c.title}</h3>
              {c.rows.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 border-b border-tertiary py-[6px]">
                  <span className="font-heading text-[14px] uppercase leading-[21px]">{label}</span>
                  <span className="text-right font-body text-[14px] leading-[21px]">{value}</span>
                </div>
              ))}
              {c.scale && <div className="mt-3">{c.scale}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const lead = (p: Product) => imagesFor(p, colorThumbs(p)[0]?.color)[0] ?? "/hats/everyday-cap-black-1.jpg"
const firstSentence = (s: string | null) => (s ? (s.match(/^.*?[.!?](\s|$)/)?.[0] ?? s).trim() : "")
