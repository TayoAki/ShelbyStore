/**
 * The credibility strip's items (mirrors web/src/lib/credibility.ts). Empty in
 * v6: the strip stays hidden until it holds true, sourced items (G.1.5).
 */
export type CredibilityItem = { label: string; href?: string; source: string }

export const CREDIBILITY: CredibilityItem[] = []
