# Landing-page learnings → Shelby decisions

The source is the user-supplied outline of Jeffrey Park / Daydreamers Studio's *Build Shopify
DTC Ecommerce Pages with Replo + AI*. Treat it as practitioner guidance, not measured results:
the outline itself notes that the performance claims in its sources weren't independently verified.

| Lesson from the outline | What Shelby does | Where |
|---|---|---|
| 1. Start from a specific customer, problem and offer, using real customer language | The content series stores the audience, the audience's question and the stance. The story page opens on that problem. | `backend` content module, `/stories/[handle]` |
| 2. Match the page type to awareness and intent | Cold episode traffic lands on a story page. Warm visitors go to the product page. Drops get campaign pages. | `landing_path` → `/stories/wash-test` |
| 3. Keep the ad and the page continuous | The continuity banner, plus "You just watched: <episode>" on the story page | `ContinuityBanner`, story hero |
| 4. Make the offer clear and reduce risk | The story page has an inline buy box with live stock, plus shipping and returns lines under the CTA. No fake scarcity or invented bundles. | `BuyBox`, `policy.ts` |
| 5. Write modular copy (hook → problem → solution → proof → offer → close), with no generated proof | The story page modules come only from the series record | SITE_SPEC §10.2 |
| 6. Give every visual a job | The proof section lists the episodes as evidence. The product image sits beside the offer. | story page |
| 7. Use responsive, reusable structure | Shared tokens, a 4:5 media ratio and section components, at mobile and desktop widths | SITE_SPEC §2 |
| 8. Make the purchase actions work | The buy box adds the right variant, and Stripe checkout was verified with a test card | `stripe-payment.tsx` |
| 9. Measure, then test one hypothesis against a control | `data-track` CTA clicks, time on page and scroll depth, funnels, and the `story-headline` experiment with a minimum sample | Admin → Analytics |
| 10. Keep an evidence-disciplined record | Each experiment record stores its hypothesis, audience, change, results, decision and notes | experiments module |
