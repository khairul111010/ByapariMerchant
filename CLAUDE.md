# Project: Bypari Merchant App (React Native, bare workflow)

## What this is
The merchant's whole business in their pocket. Bypari is a multi-tenant e-commerce SaaS for Bangladeshi small businesses (flat ৳4,200/year, no commission, unlimited products and orders). Its merchants are mostly Facebook-page sellers on **mid-range Android phones over slow data**, and **most have no desktop or laptop** — so this app is their *only* admin panel. It must give full control: if a merchant can do it on the web admin, they can do it here. Everything in Bangla and English.

This repo is **only the mobile client**. The Laravel backend lives in a separate repo and is **already built for this app** (milestones M1–M5). Read `docs/api-contract.md` before writing any networking code. Never invent endpoints; if one is missing, write it down under "Gaps" in that file and tell the user — don't mock around it silently.

Application ID: `com.byapari.merchant` (Firebase project `byapari`). Do not change it.

## Hard technical constraints
- **React Native CLI (bare workflow), TypeScript strict, New Architecture + Hermes. NO Expo** (no Expo modules, no EAS). Native access must be unrestricted; write Kotlin/Swift modules when a library doesn't exist.
- **Android first.** Target Android 8+, ~2–3 GB RAM, 3G/4G. iOS must build; Android is what gets tested.
- Navigation: React Navigation. Server state: TanStack Query (with persistence). Client state: Zustand. Forms: react-hook-form + zod. Lists: FlashList. Images: react-native-fast-image (or equivalent). Charts: keep light (`react-native-svg` + small custom components); no heavy chart libs.
- Storage: `react-native-keychain` for the auth token and any secret; MMKV for non-sensitive cache and the offline queue. **Never** AsyncStorage for secrets, never log tokens or secrets.
- i18n: i18next, **Bangla + English**, switchable in-app, Bangla default on `bn-BD` devices. Use a Bangla font that renders on old Android. Format ৳ amounts, Asia/Dhaka dates and Bangla digits. **No hard-coded UI strings.**
- Performance: cold start < 3 s on a low-end Android; skeletons not spinners; paginated lists; compress every image before upload; release APK small (ABI splits, no heavy unused libs).
- Accessibility: large touch targets, readable contrast, font scaling, TalkBack labels.

Suggested libraries (confirm each in the plan; flag anything needing custom native code):
`@react-native-firebase/app` + `messaging`, `@notifee/react-native` (channels, heads-up, action buttons), `react-native-vision-camera` (+ code scanner), `react-native-image-picker`, `react-native-image-resizer`, `react-native-keychain`, `react-native-mmkv`, `react-native-biometrics`, `@react-native-community/netinfo`, `@shopify/flash-list`, `react-native-fast-image`, `react-native-share`, `react-native-html-to-pdf` / `react-native-print`, a Bluetooth ESC/POS printer library (58/80 mm), `react-native-inappbrowser-reborn`, `react-native-document-picker`, `react-native-svg`, `i18next` + `react-i18next`, Sentry or Crashlytics (PII scrubbed).

## Product rules (inherited from the platform — never violate)
1. **No feature gating.** Every plan has the same features; plans differ only by *usage limits* (staff seats, courier drivers, custom-domain add-on). The server decides. Read limits from `/me` and `/plan`; render disabled/upgrade states from the server's response and error codes (`staff_limit_reached`, `custom_domain_not_in_plan`, `driver_not_in_plan`). **Never** write `if (plan === 'starter')` in UI code. One `usePlanLimits()` hook only.
2. **No fabricated urgency or fake trust signals** anywhere. No fake countdowns or "X left". Reviews can only be approved/rejected/unpublished/deleted — there is no way to write one.
3. **Products and orders are unlimited on every plan.** Never display or invent a cap.
4. **COD is the default**; manual bKash/Nagad payment verification is first-class.
5. **No payment details in the app.** Plan upgrades/renewals = open the prefilled WhatsApp link the server returns; the operator confirms payment outside the app.
6. **Secrets are write-only.** Gateway/courier/AI/CAPI keys are never returned by the API — only `*_set` / `configured` booleans. Show "configured ✓" with Replace and Clear; never echo or prefill a secret. A blank secret field means "unchanged".
7. **Tenant isolation is the server's job.** The app never sends or trusts a store id. The token identifies user and store; a token only works on its own store's host. Logout wipes the keychain, every cache and the offline queue. Never share cache between logins.
8. Merchant-supplied links (banners) must be http(s)/mailto/tel — validate client-side as a courtesy; the server is authoritative.
9. Rich text (product description): the server sanitises to an allowlist — `p, br, strong/b, em/i, u, h2, h3, ul/ol/li, blockquote`, links (http/https/mailto/tel) with only `href`. The editor must only produce that subset.

## How the API works (details in `docs/api-contract.md`)
- **Two kinds of host.** Signup (`/signup/*`) is on the **central domain**: `https://{CENTRAL_DOMAIN}/api/v1`. Everything else is on the **store's own host**: `https://{subdomain}.{CENTRAL_DOMAIN}/api/v1`. After login/signup, save `store.api_base_url` and use it as the base URL. The login screen asks for the shop address (subdomain); there is no lookup-by-email by design.
- Always send `Accept: application/json`. Auth: `Authorization: Bearer <token>`. Tokens last 90 days; any `401` on an authenticated call → clear everything and go to login.
- Money values are **strings** (`"1560.00"`) — never parse them to floats for display maths; format them. Dates are ISO-8601 UTC; display in Asia/Dhaka.
- Errors: `401` re-auth · `403` permission (staff hitting an owner-only screen) or a plan gate (`code`) · `404` not found (also another store's record) · `409` conflict (`insufficient_stock`, `stock_changed`, `already_booked`) · `422` `{message, errors:{field:[…]}}` or a business refusal with `code` · `429` throttled · `503 store_suspended` → "store unavailable" screen. Centralise this mapping in one place.
- **Pagination:** orders/products use Laravel resource shape `{data, links, meta}`; most other lists use `{data, meta:{current_page,last_page,total}}` or an unpaginated `{data}`. Read the contract per endpoint.
- **Partial updates:** `/settings*`, `storefront/appearance`, `marketing` and banner updates only change the keys you send. `null` resets/clears where the contract says so. Exceptions that need their required fields every time: landing pages (`product_id`, `title`, `headline`), products/categories/coupons/home sections (the same fields as create). **Multipart updates use `POST`** (categories, banners, landing pages) because PHP can't parse a multipart `PUT`.
- **Images:** multipart field `image` (`logo` for the logo), jpeg/png/webp ≤ 5 MB (logo ≤ 2 MB). **Resize on the device first** (long edge ≤ 1600 px, ~q82, strip EXIF/GPS, honour orientation), show progress, make retries safe.
- **Stock:** use `POST …/stock` with `mode: delta` for quick ± (atomic, safe with two phones). For stock-takes use `mode: set` with `expected` and handle `409 stock_changed` by showing the real count and asking to retry. A price-only variant save must send `stock_quantity_was` so it never overwrites sales.
- **Roles:** `user.is_owner` from `/me`. Staff get `403` on owner-only areas (settings, marketing, storefront appearance, delivery-zone edits, domains, staff, plan). Hide those screens for staff; still handle a `403` gracefully.
- **Store status:** `store.is_pending` → show the "not live yet" banner with a button opening `platform.support_whatsapp_url`. Merchants can set everything up while pending.
- **No barcode field:** a barcode/QR scan is just an exact **SKU** lookup (`GET /variants/lookup?sku=`, or `GET /pos/products?q=`).
- **Invoices:** `GET /orders/{id}/invoice` returns data; **render the PDF on the phone** and share/print it.

## Push notifications (the main reason to install)
- FCM via `@react-native-firebase/messaging` + Notifee. On every launch (and token rotation) call `POST /devices {token, platform, device_name, app_version}`; on logout call `DELETE /devices {token}`.
- **Create the Android channel `orders`** (high importance, sound) before the first push.
- Payload: `notification{title:"New order ORD-000123", body:"৳1,560 · Cash on delivery"}`, `data{type:"new_order", order_id, order_number}`. It deliberately has **no customer name/phone/address**. Tapping opens `GET /orders/{order_id}`. Handle foreground, background and killed states.
- Push is best-effort. Also refresh orders + `/notifications` on foreground and on a short interval while the app is open.
- Later (not built server-side yet): per-event toggles, quiet hours, pushes for payments/low stock/reviews.

## Screens → endpoints
| Area | Screens | Endpoints |
|---|---|---|
| Onboarding | Language, shop-address login, signup (plans → shop details → owner), forgot-password | `signup/options`, `signup/subdomain-availability` (live check), `signup`, `auth/login`, `auth/forgot-password` (reset happens via the emailed link in the phone browser), `auth/logout`, `me` |
| Orders | List + filters + search, detail, status change, payment verify/reject, advance payment, courier book/refresh, invoice, call/WhatsApp, risk badge | `orders*`, `orders/{id}/invoice` |
| Catalogue | Products list/filter, product editor, variants, images (reorder), price tiers, categories (reorder, image), CSV import, AI description | `products*`, `categories*`, `product-imports*`, `products/describe` |
| Inventory | Low stock, quick adjust, stock history, barcode scan | `inventory/low-stock`, `…/variants/{id}/stock`, `…/stock-history`, `variants/lookup` |
| Selling | Coupons, delivery zones, POS (+ scan), landing pages, abandoned carts, reviews, customers | `coupons*`, `delivery-zones*`, `pos/*`, `landing-pages*`, `abandoned-carts*`, `reviews*`, `customers*` |
| Storefront | Banners, home sections (+ picks, preview), theme + accent + toggles + logo | `banners*`, `home-sections*`, `storefront/*` |
| Insights | Dashboard (7/30/90 days or custom), funnel, top products | `dashboard` |
| Settings (owner) | Store options, payments, couriers (plan-gated), AI key, marketing/pixels, domains (DNS steps with copy buttons), staff, plan | `settings*`, `marketing`, `domains*`, `staff*`, `plan` |

## Known limits of the backend (build around these, don't fight them)
- **POS is cash-only**, no discount, no delivery charge, no partial payment (parity with the web POS). Card/bKash at the counter, discounts and partial payment need a backend schema change — surface it as a request, don't fake it client-side.
- Thermal-printer receipts are **entirely client-side** (the server doesn't print). Render Bangla text to a bitmap if the printer has no Bangla glyphs.
- In-app password reset via deep link isn't wired (needs Android App Links); use the emailed link in the browser. `POST auth/reset-password` exists for when it is.
- Abandoned carts are list-only: tap-to-call / WhatsApp from the app; there is no automated outreach.
- Customers are derived from orders (one row per phone). Risk is phone-based, never IP-based.
- Pages (About/Privacy/Terms) are fixed on the web too — no editor.
- No email verification at signup (same as the web).

## Architecture expectations
- Feature folders (`features/orders`, `features/products`, …), a shared `ui/` kit, **one** typed API client with zod-validated responses and the central error mapper above. Types derive from `docs/api-contract.md`.
- Offline: cached reads; a persisted mutation queue for safe idempotent writes (order status, notes, `delta` stock) with clear queued/synced/failed states. Don't queue writes that can conflict (`set` stock-takes, deletes) — require a connection and say so.
- Theming: light, high-contrast, works on small screens (375 px first).
- Telemetry: crash reporting only; scrub PII (phones, addresses) from everything.
- Tests: unit tests for the API client, error mapper and offline queue; component tests for key forms; Maestro E2E for **login → receive push → confirm order → book courier** and **signup → add product → POS sale**. CI: lint, typecheck, test, signed release build.

## How to work
1. **Don't write app code first.** Produce a plan: folder structure, library choices with reasons (flag native code), the screen map, the push design, the offline design, and milestones. Wait for the user's confirmation.
2. Build milestone by milestone, testing on a real low-end Android or an emulator profile before calling anything done:
   - **A** Foundation: project, theme, i18n, API client + error mapper, auth (login, signup, forgot-password, biometric unlock), `/me`, role-aware navigation, pending banner.
   - **B** Orders + push: list, detail, status, payments, courier, invoice, FCM + Notifee channel, deep links.
   - **C** Catalogue + inventory: products, variants, images (on-device resize), categories, stock, scan, CSV import.
   - **D** Selling: POS (+ printer), coupons, zones, landing pages, carts, reviews, customers.
   - **E** Storefront + insights: banners, home sections, themes, dashboard.
   - **F** Owner settings: store/payments/couriers/AI/marketing, domains, staff, plan; polish, performance, release.
3. Ask the user before adding any paid SDK, changing the auth model, or anything that implies a backend change. Backend changes are made in the Laravel repo, not here.
4. After each milestone, tick it in this file so progress survives across sessions.

## Explicitly out of scope
Multi-currency, multi-store per login, an in-app payment flow, a buyer-facing shopping app (the web storefront is already an installable PWA), anything with fake countdowns or fake stock numbers.
