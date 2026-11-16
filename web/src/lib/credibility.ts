/**
 * The home credibility strip (SITE_SPEC G.5.8). Empty until Shelby has true
 * items; every item needs a source (a URL or a dated note). No press logos,
 * quotes or counts are invented. The strip renders nothing while empty.
 */
export type CredibilityItem = { label: string; href?: string; source: string }

export const CREDIBILITY: CredibilityItem[] = []
