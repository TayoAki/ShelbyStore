# Shelby mobile app

Expo (React Native + TypeScript + expo-router) storefront for Shelby. It talks to the Medusa backend in `../backend`.

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

Checks: `npm run typecheck`, `npm run export:web`.

## Screens

| Route | Purpose |
|---|---|
| `(tabs)/index` | Home. Shows the live drop hero, the core product with per-size availability, and upcoming drops with countdowns and Notify me. |
| `(tabs)/drops` | Lists live, upcoming and past drops. |
| `(tabs)/shop` | Shows the core collection plus products from live drops. |
| `(tabs)/cart` | The bag: line items, quantity and subtotal. |
| `(tabs)/account` | Email/password sign-in and registration, plus order history. |
| `drops/[handle]` | Drop page with story, promise, "what to look for" and products. An upcoming drop shows a teaser instead. |
| `products/[handle]` | Product page: image carousel, promise, color and size pickers with stock, fit notes. |
| `checkout` | Contact and address, then delivery, then payment. Payment uses Medusa's test provider. |
| `order/[id]` | Order confirmation. |

## Backend contract

The app uses the standard Medusa v2 Store API, plus these custom routes:

- `GET /store/releases[?phase=live|upcoming|past]` returns `{ releases }`
- `GET /store/releases/:handle` returns `{ release }`
- `POST /store/releases/:id/reminders` takes `{ email?, push_token? }`

Products read optional `metadata.promise` and `metadata.fit_notes`. Core products come from the collection with handle `core`.

## Attribution (channel response)

Open any route with `?asset=<key>` (for example `shelby://drops/linen-camp?asset=tiktok-tryon`) and the app stores `{ release_id, asset }` for 7 days. That data goes into the cart `metadata`, and Medusa copies cart metadata onto the order.

Adding a product from a live drop also sets `release_id` on the cart and on the line item's metadata. Attribution is cleared once an order is placed.

## Push notifications

"Notify me" always sends the email address. It also sends an Expo push token when the build has an EAS `projectId` (`extra.eas.projectId`), runs on a real device, and has notification permission.

Tapping a notification whose data is `{ release_handle }` opens that drop.

## Payments

Checkout only uses `pp_system_default`, which records the order without charging anyone. Before a real launch, add a card provider (for example Stripe via `@stripe/stripe-react-native`) in the backend and the app.
