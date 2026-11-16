# Shelby mobile app

Expo (React Native + TypeScript + expo-router) storefront for Shelby, a hat brand. It talks to the Medusa backend in `../backend`.

The look follows `APP_SPEC.md` (v4): Melin's mobile style system translated to native — black on white, Plus Jakarta Sans for headings and Inter for body (loaded with `@expo-google-fonts`, splash held until they load), 39pt UPPERCASE buttons with a 3pt radius, square product photos on white.

The app follows the product-drop playbook. The core basic is always one tap away, with honest size availability. Drops are events: a live hero, a countdown and a "Notify me" button. Every cart records which release and which creative asset drove it.

## Run it

```bash
cp .env.example .env   # set the backend URL and publishable key
npm install
npx expo start         # press i / a / w for iOS, Android or web
```

| Variable | What it is |
|---|---|
| `EXPO_PUBLIC_MEDUSA_BACKEND_URL` | Medusa URL. Use your LAN IP on a device, `http://10.0.2.2:9000` on the Android emulator, or the Railway URL in production. |
| `EXPO_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Publishable API key from Medusa Admin → Settings → Publishable API Keys. |
| `EXPO_PUBLIC_STOREFRONT_URL` | The web storefront. Demo hat photos load from its `/hats` folder, and the quiz, fit guide, stories and reasons pages open there. |

Checks: `npm run typecheck`, `npm run export:web`.

## Screens

| Route | Purpose |
|---|---|
| `(tabs)/index` | Home: announcement bar, hero with the core cap's live price, Browse By Style, the drop banner, Find Your Fit (opens the web quiz), Shop By Color, In Stock Today (live counts), the Crush Test episodes, About, Stories and drop alerts. |
| `(tabs)/shop` | The full catalog: style pills per category, live search, Filter + Sort, two-column cards with quick add. |
| `(tabs)/drops` | Drops as a blog index: featured live/next drop with a real countdown, Live & Upcoming / Past tabs. |
| `(tabs)/cart` | The bag (Melin's cart drawer as a screen): lines, the two-pack offer, suggestions, summary. |
| `(tabs)/account` | Email/password sign-in and registration, plus order history. |
| `drops/[handle]` | Drop article: story, what to look for, then countdown + notify, products, or "ended". |
| `products/[handle]` | PDP: per-colour gallery, swatches, one-size or S/M · L/XL sizing with stock, Make It Two, perks, fit scales, details, You May Also Like, sticky buy bar. The two-pack renders here with two colour pickers. |
| `checkout` | Contact and address, then delivery, then payment. Payment uses Medusa's test provider. |
| `order/[id]` | Order confirmation. |

Every add to cart opens the Added sheet. The header's eye icon lists recently viewed hats (stored on the device).

## Hat catalog behaviours

- Each colour shows its own photos (Medusa variant images; `imagesFor` in `src/lib/product.ts`).
- One-size hats need no size pick; sized hats offer S/M and L/XL with live stock.
- `metadata.fit_profile` drives the crown-height and structure scales; `metadata.details` the spec list.
- Offer products (`metadata.offer`, the Everyday Cap Two-Pack) stay out of lists and are reached through Make It Two or deep links.
- Image URLs under `/hats/` are resolved against `EXPO_PUBLIC_STOREFRONT_URL`.

## Backend contract

The app uses the standard Medusa v2 Store API, plus these custom routes:

- `GET /store/releases[?phase=live|upcoming|past]` returns `{ releases }`
- `GET /store/releases/:handle` returns `{ release }`
- `POST /store/releases/:id/reminders` takes `{ email?, push_token? }`

Products read optional `metadata.promise`, `metadata.fit_notes`, `metadata.details`, `metadata.fit_profile`, `metadata.size_chart`, `metadata.offer` and `metadata.single_handle`. The core cap is in the collection with handle `core`. Categories (`/store/product-categories`) are the hat shapes, and `GET /store/content-series` feeds the Crush Test band.

## Attribution (channel response)

Open any route with `?asset=<key>` (for example `shelby://drops/linen-camp?asset=tiktok-tryon`) and the app stores `{ release_id, asset }` for 7 days. That data goes into the cart `metadata`, and Medusa copies cart metadata onto the order.

Adding a product from a live drop also sets `release_id` on the cart and on the line item's metadata. Attribution is cleared once an order is placed.

## Push notifications

"Notify me" always sends the email address. It also sends an Expo push token when the build has an EAS `projectId` (`extra.eas.projectId`), runs on a real device, and has notification permission.

Tapping a notification whose data is `{ release_handle }` opens that drop.

## Payments

Checkout only uses `pp_system_default`, which records the order without charging anyone. Before a real launch, add a card provider (for example Stripe via `@stripe/stripe-react-native`) in the backend and the app.
