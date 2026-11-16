/**
 * Sponsored-content label for advertorials (SITE_SPEC §12.3): article-meta
 * type in a 1px black box, full opacity. The essay's page-type guide asks for
 * explicit labelling; US endorsement rules expect paid brand content to read
 * as advertising.
 */
export function AdLabel({ text = "Advertisement | From Shelby" }: { text?: string }) {
  return <p className="inline-flex border border-black px-[6px] py-[2px] article-meta text-black">{text}</p>
}
