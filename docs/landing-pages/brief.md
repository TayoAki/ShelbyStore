# Shelby landing-page brief

The essay's process starts with a grounded brief: a specific customer, problem and offer, built
from the course's 26-question onboarding form and from review mining (essay Body 1). This is that
brief for Shelby, filled in from what the store and our research actually contain.

Following the essay's caution (Body 1 D), every entry is one of three kinds:

- **Observed**: a fact we can point to (product data, store policy, research with a source).
- **Inferred**: our reading of motivations. It's a hypothesis to test, not a finding.
- **Unknown**: needs real customer data. Shelby has no real customers, reviews or ad results yet,
  so most of the customer section is unknown. That is the honest state; nothing here is filled in to
  look complete.

Last updated 2026-11-16.

## 1. Product and differentiation

| | Entry | Kind | Source |
|---|---|---|---|
| What we sell | Hats: the Everyday Cap (core, $38, four colours), plus a trucker, beanie, performance cap, corduroy cap (live drop), bucket hat and waxed field cap (scheduled drops) | Observed | Medusa catalog |
| The focused offer | The Everyday Cap Two-Pack: any two colours for $68, $8 under two singles | Observed (demo price, to confirm) | `backend/src/scripts/seed-landing.ts` |
| Differentiation | Garment-washed cotton twill; low, unstructured crown; pre-curved brim; strap adjusts 21.5–23.75 in (55–60 cm) | Observed | `metadata.details`, `fit_notes`, `fit_profile` |
| Proof we can show | Live stock per colour on the page; the crush-test content series (stance and filmed episodes) | Observed (the series metrics are demo data, flagged in the admin) | storefront, content module |
| Guarantee | 30-day returns. No longer guarantee, no fit promise | Observed | `web/src/lib/policy.ts` |
| Mechanism claim we may make | "Nothing stiff inside to crease": true of an unstructured crown | Observed (product construction) | product details |
| Mechanism claim we may not make yet | "Survives 100 folds": the crush-test stance is demo content until we run and film the test | Unknown | content series record |

## 2. Customer: frustrations and desired outcomes

| | Entry | Kind | Source |
|---|---|---|---|
| Frustrations with caps | Crowns that crease, brims that flatten ("duck bill"), uneven fading, not knowing your size | Inferred | Hat teardowns (both stores lead with fit tools); the content series' audience question; general product knowledge |
| Desired outcome | A cap that looks worn-in, not worn-out; fits without guessing | Inferred | same |
| Customer's own words | "my caps always go flat on top", "duck bill" | **Demo**: episode `audience_language` in the seeded series, not real comments | content module |
| Objections | Fit ("will one size fit me?"); price vs fast-fashion caps; returns | Inferred | Teardowns: Melin's fit quiz and Perfect Fit Promise, Goorin's fit guide |
| Real reviews | None | Unknown | no orders yet |

What to collect first: comments on the first real TikTok episodes, post-purchase "how does it fit?"
answers, and return reasons. Store each as observed language in the series' `audience_language` and
here, separate from what we infer.

## 3. Channels and traffic

| | Entry | Kind | Source |
|---|---|---|---|
| Discovery channels planned | TikTok / short video (content series), retargeting, email, organic search | Inferred plan | analytics + content module |
| Channel performance | None yet | Unknown | — |
| Tracked links | `?asset=<episode>` on any page; UTMs captured | Observed | `src/proxy.ts`, continuity banner |

## 4. Offer format and economics

| | Entry | Kind | Source |
|---|---|---|---|
| Offer formats live | Single (PDP), bundle (two-pack), launch (drop pages) | Observed | storefront |
| Not offered | Subscriptions (hats aren't a replenishment product), discounts, free gifts, bonuses | Observed decision | SITE_SPEC §11–12 |
| Average order value | None yet | Unknown | — |
| Conversion rate | None yet | Unknown | analytics funnels will report it |
| Unit economics | Demo unit costs: cap $7.50, two-pack $15, fulfilment $5.50/order | Observed (demo inputs) | variant `metadata.unit_cost`, release settings |

## 5. Competitors

| | Entry | Kind | Source |
|---|---|---|---|
| Closest references | Melin (premium sized caps, $79–99), Goorin Bros (one-size truckers ~$40–45, heritage hats) | Observed | `docs/research/teardowns/melin.md`, `goorin.md` |
| What they do well | Shape-first navigation, fit guides and quizzes, drop rituals | Observed | teardowns |
| What they do badly | No product or price on the home first screen, no collection headings, heavy scripts | Observed | teardowns |

## 6. Goals and previous results

| | Entry | Kind |
|---|---|---|
| Goal | Orders of the Everyday Cap from short-video traffic; repeat orders | Inferred from the content series goal |
| Previous results | None: pre-launch | Unknown |

## 7. Unanswered questions (collect before scaling spend)

1. Which frustration do real buyers name first: fit, shape loss or fading?
2. What share of visitors are between sizes, and does the quiz reduce fit returns?
3. Does the two-pack raise order value without lowering margin per order?
4. Which landing page converts cold traffic best: story, listicle or advertorial?
5. Is "Shelby" clear to use as a hat brand name (trademark search)?
