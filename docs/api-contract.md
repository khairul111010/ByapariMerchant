# Merchant mobile API — v1 (M1: auth, orders, devices, notifications · M2: catalogue, inventory · M3: selling tools · M4: storefront control, analytics, marketing · M5a: signup, forgot-password · M5b: settings, domains, staff, plan, invoice)

Base URL: `https://{subdomain}.{central-domain}/api/v1` (or a verified custom domain). The store is resolved from the **host**, exactly like the web admin — the app never sends a store id. Bearer-token auth (Laravel Sanctum). Always send `Accept: application/json`; the API answers JSON even without it.

A token works only on the store whose user it belongs to; on any other host it returns `401`.

## Errors
| Status | Meaning |
|---|---|
| 401 | Missing/expired/revoked token, or bad credentials |
| 403 | Permission denied (reserved for role-gated endpoints) |
| 404 | Not found — including a record that belongs to another store |
| 409 | Conflict (`insufficient_stock`, `already_booked`) |
| 422 | Validation: `{message, errors:{field:[...]}}`, or a business refusal with a `code` |
| 429 | Throttled (login: 5/min per email+IP, 20/min per IP, per store) |
| 503 | `{code:"store_suspended"}` — show the "store unavailable" screen |

Tokens expire after 90 days (`SANCTUM_TOKEN_EXPIRATION`, minutes).

## Opening an account (central domain)
A new merchant has no store yet, so these three live on the **central domain** (`https://{central-domain}/api/v1/...`), not on a shop host. The app needs this one configured address; everything after signup uses the store's own host.
- `GET /signup/options` → `{plans:[{key,label,blurb,price_yearly,price_monthly_quote,staff_accounts (null = unlimited),custom_domain_included,courier_drivers}], custom_domain_addon_price, categories:[{key,label,starting_theme}]}`. Show prices **per month, billed yearly** (`price_monthly_quote`).
- `GET /signup/subdomain-availability?subdomain=` → `{available, message}` (use for a live check; same rules signup applies)
- `POST /signup` `{plan, store_name, subdomain, category, owner_name, owner_email, owner_password, owner_password_confirmation, whatsapp_number?, device_name?}` → `201` `{token, user, store, limits, platform, unread_notifications}` — the same payload as login. **Save `store.api_base_url`** and use it for every later call.
- Throttled: 10 signups/hour per IP (`429`). A name lost to a race returns `422` on `subdomain`.
- The store starts **`pending`** on the chosen plan (no trial). The owner can set everything up straight away; the public storefront shows "coming soon" until the operator approves it after payment. Payment is confirmed **outside the app**: show the "not live yet" banner when `store.is_pending`, with a button opening `platform.support_whatsapp_url` (prefilled message). Never show payment details in-app.
- The same email can own stores on different subdomains (merchant accounts are per store).

## Auth
- `POST /auth/login` `{email, password, device_name?}` → `{token, user, store, limits, unread_notifications}`
- `POST /auth/forgot-password` `{email}` → always the same `200` message, whether or not the email has an account on this store (no account enumeration). If it does, a reset link is emailed; it opens the store's web reset page, which works in a phone browser — the merchant sets a new password there, then logs in in the app. Throttled (3/min per email+IP).
- `POST /auth/reset-password` `{token, email, password, password_confirmation}` → `200`, or `422 invalid_reset_token`. For when the app handles the emailed link itself (needs Android App Links); not required today. A successful reset **signs the account out of every phone** (all tokens revoked). Same throttle as above, which also stops token guessing.
- `POST /auth/logout` → revokes the current token
- `GET /me` → `{user, store, limits, platform, unread_notifications}` (`store.api_base_url`; `platform.support_whatsapp_url` for the pending banner) (`store.ai_configured` → show "Generate with AI" only when true; `store.reviews_enabled`) (call on launch; `store.is_pending` drives the "not live yet" banner)

`limits` comes from `PlanLimits`: render disabled/upgrade states from it, never from the plan name.

## Orders
- `GET /orders?status=&payment_method=&q=&from=&to=&per_page=&page=` → paginated list (`data`, `links`, `meta`)
  - `status`: pending|confirmed|shipped|delivered|cancelled; `q` matches order number, name, phone
- `GET /orders/{id}` → detail: items, payment, advance payments, courier (`booking`, `available_drivers`), `customer_risk` (`new|low|medium|high`)
- `PUT /orders/{id}/status` `{status}` — cancelling restocks; reopening a cancelled order re-takes stock and returns `409 insufficient_stock` if it has since sold
- `PUT /orders/{id}/payment/verify` | `/payment/reject` — manual bKash/Nagad review
- `POST /orders/{id}/advance-payments` `{method: manual_bkash|manual_nagad|cash, amount, reference_number?}` — amount cannot exceed the amount due
- `POST /orders/{id}/courier/book` `{driver}` — `422` codes: `order_pending`, `driver_unavailable`, `courier_failed`; `409 already_booked`
- `POST /orders/{id}/courier/refresh`
- `GET /orders/{id}/invoice` → invoice as data (`invoice_number`, `date`, `store{name,whatsapp_number,logo_url}`, `customer`, `payment`, `items`, `totals{subtotal,discount,coupon_code,delivery_charge,total,advance_paid,amount_due}`). **The app renders it to a PDF on the phone** (print / share to WhatsApp) — the server needs no PDF library. Available to staff.

Never returned: `public_token`, `customer_ip`, raw gateway/courier payloads.

## Devices (push registry)
- `POST /devices` `{token, platform: android|ios, device_name?, app_version?}` — idempotent; call on every launch and on FCM token rotation
- `DELETE /devices` `{token}` — call on logout

### Push payload (FCM)
App identity: Android package / application ID **`com.byapari.merchant`** (registered in the Firebase project `byapari`; `google-services.json` lives in the app repo's `android/app/`). Use the same string for the iOS bundle ID when that is added.

Sent when a new order is placed, to every device registered for the store. Delivery is best-effort: if push is down the order is unaffected, so the app should still refresh `/orders` and `/notifications` on foreground.

```
notification: { title: "New order ORD-000123", body: "৳1,560 · Cash on delivery" }
data:         { type: "new_order", order_id: "42", order_number: "ORD-000123" }
android:      high priority, channel_id "orders"   ← the app must create this channel
```
The text is English and deliberately contains **no customer name, phone or address** (lock screens are public and the text passes through Google). Use `data.order_id` to deep-link to `GET /orders/{id}`. The body for manual bKash/Nagad orders reads "bKash — verify payment". A dead token (uninstall / rotation) is deleted server-side when FCM reports it, so re-register on every launch.

## Notifications
- `GET /notifications` → `{unread, data:[{id,type,data,read_at,created_at}], meta}`
- `POST /notifications/{id}/read` → `{unread}`
- `POST /notifications/read-all` → `{unread:0}`

## Categories
- `GET /categories` → flat list (`parent_id` builds the tree; only 2 levels allowed), with `products_count`, `image`
- `POST /categories` `{name, parent_id?, description?, is_active?, image?}` (multipart if `image`)
- `POST /categories/{id}` — update (POST, not PUT, so a multipart image body parses). `{name, ..., image?, remove_image?}`
- `PUT /categories/reorder` `{ids:[...]}` — full new order
- `DELETE /categories/{id}`

## Products
- `GET /products?status=&category_id=&featured=&low_stock=&q=&per_page=` — compact rows (`thumb`, `default_variant`); `q` matches name or SKU
- `GET /products/{id}` — full: description, SEO fields, `images`, `variants` (each with `images`, `price_tiers`), `storefront_url`
- `POST /products` `{name, status: draft|active|archived, sku, price, stock_quantity, category_id?, description?, compare_at_price?, weight_grams?, brand?, meta_title?, meta_description?, track_inventory?, is_featured?}` → creates the product and its default variant
- `PUT /products/{id}` `{name, status, category_id?, description?, brand?, meta_*?, track_inventory?, is_featured?}`
- `DELETE /products/{id}`
- `POST /products/describe` `{name, category_id?}` → `{description}` — merchant's own AI key; `422` if none configured (the app should show the button only when `/me` says AI is configured — **not yet exposed**, see below). English only.

`description` is rich text. The server sanitises on save (allowlist: p, br, strong/b, em/i, u, h2, h3, ul/ol/li, blockquote, links with http(s)/mailto/tel). The app's editor must only produce that subset.

## Images
Upload as multipart field `image` (jpeg/png/webp, ≤5 MB). **Resize/compress on the device first** (≤1600 px, ~q82); the server also optimises.
- `POST /products/{id}/images` → `{data:{id,thumb,card,zoom}}`
- `PUT /products/{id}/images/order` `{ids:[...]}` — must list every image exactly once (`422 bad_order`); the first image is the main one
- `DELETE /products/{id}/images/{mediaId}`
- `POST /products/{id}/variants/{variantId}/images`, `DELETE .../images/{mediaId}`

## Variants & stock
- `POST /products/{id}/variants` `{sku, price, stock_quantity, name?, attributes?, compare_at_price?, low_stock_threshold?, weight_grams?, is_default?}`
- `PUT /products/{id}/variants/{vid}` — same fields plus `stock_quantity_was` (the count the screen showed) and `stock_note`. Stock is only written if the merchant changed it; if sales moved it meanwhile → `409 stock_changed` with the real `stock_quantity` (show it and ask to retry). A price-only save never touches stock.
- `DELETE /products/{id}/variants/{vid}` — `422 last_variant` for a product's only variant
- `POST /products/{id}/variants/{vid}/stock` `{mode: delta|set, quantity, expected?, note?}` — quick adjust. `delta` is atomic (negative removes; `409 insufficient_stock` if it would go below zero). `set` is a stock-take; send `expected` to get `409 stock_changed` if the count moved.
- `GET /products/{id}/variants/{vid}/stock-history` — append-only ledger, newest first (`delta`, `balance_after`, `reason_label`, `order`, `user`)
- `GET /variants/lookup?sku=` — barcode/QR scan: exact SKU → `{variant, product}`; `404 sku_not_found`. There is no separate barcode column: **the SKU is the scannable value**.
- `GET /inventory/low-stock` — tracked, active variants at/under their threshold (default 5), fewest first

## Wholesale price tiers
- `GET|POST /products/{id}/variants/{vid}/price-tiers` `{min_quantity (≥2), price (< regular price)}`; `DELETE .../price-tiers/{tierId}`

## CSV import
- `POST /product-imports` multipart `file` (csv/txt ≤10 MB) → `202`, queued
- `GET /product-imports/{id}` — poll until `status` is completed/failed; `errors` has row-level problems
- `GET /product-imports` — last 20

## Coupons
- `GET /coupons` (paginated), `GET /coupons/{id}`, `POST /coupons`, `PUT /coupons/{id}`, `DELETE /coupons/{id}`
- Body: `{code, type: percentage|fixed|free_delivery, value (required unless free_delivery; ≤100 for percentage), min_order_amount?, max_uses?, starts_at?, expires_at?, is_active?}`. Codes are upper-cased and unique per store. `used_count` is read-only.

## Delivery zones
- `GET /delivery-zones` → the two zones every store has: `inside_dhaka`, `outside_dhaka`
- `PUT /delivery-zones/{zone}` `{base_charge, base_weight_grams, per_kg_charge, estimated_delivery_note?}` (all but the note required). Zones can't be added or removed. **Owner only** (`403` for staff); `GET` is open to staff.

## POS (counter sale)
- `GET /pos/products?q=` → up to 20 active-product variants matching name/SKU, with `price`, `stock_quantity`, `price_tiers`, `thumb`. A barcode scan is just `q=<sku>`.
- `POST /pos/sales` `{items:[{variant_id, quantity}], customer_name?, customer_phone?}` → `201` full order (`payment_method: "pos"`, `status: "delivered"`, `payment_status: "paid"`). Wholesale tier prices apply per line. `409 insufficient_stock` (`variant_id`, `stock_quantity`) rolls the whole sale back.
- Same rules as the web POS: cash sale, no discount, no delivery charge, no payment-method choice. Card/bKash at the counter, discounts and partial payment would need a schema change (`orders.payment_method` is an enum) — not built.

## Landing pages
- `GET /landing-pages`, `GET /landing-pages/{id}` (full: headline, copy, `images`, `testimonials`, public `url`)
- `POST /landing-pages` multipart `{product_id, title, headline, slug?, subheadline?, description?, why_choose_us? (one bullet per line), is_active?, images[]?}`
- `POST /landing-pages/{id}` — update (POST so multipart parses); `is_active` is only changed when sent
- `DELETE /landing-pages/{id}`
- `POST /landing-pages/{id}/images` (field `image`), `DELETE /landing-pages/{id}/images/{mediaId}`
- `POST /landing-pages/{id}/testimonials` `{author_name, quote}`, `DELETE /landing-pages/{id}/testimonials/{tid}`

## Abandoned carts
- `GET /abandoned-carts` — checkouts idle for 60+ min with `phone`, `name`, `address`, `items`, `total`. List only: call/WhatsApp from the app. No automated outreach exists.
- `DELETE /abandoned-carts/{id}`

## Reviews (moderation only)
- `GET /reviews?status=pending|approved|rejected` → `{reviews_enabled, counts, data, meta}`
- `PUT /reviews/{id}` `{status: approved|rejected}` — `rejected` on an approved review unpublishes it
- `DELETE /reviews/{id}`
- No create/edit endpoint, by design: reviews are only ever buyers' own words.

## Customers
Built from orders, one row per phone (COD creates no account). Phone-based risk, never IP.
- `GET /customers?q=&sort=recent|orders|spent&per_page=` → `{phone, name, orders_count, delivered_count, cancelled_count, total_spent, last_order_at, risk_level}`
- `GET /customers/{phone}` → summary, `last_address`, `has_account`, full `risk`, last 20 orders

## Permissions
Staff can use everything above except what the web puts behind the owner-only Settings area: **delivery-zone edits, storefront appearance/logo, marketing settings** (and, in M5, store settings, domains and staff). Those return `403` for a staff token. `/me` returns `user.is_owner` so the app can hide them.

## Dashboard
- `GET /dashboard?range=7|30|90` or `?from=YYYY-MM-DD&to=YYYY-MM-DD` (custom, max 366 days; both dates required together)
- Returns `revenue` (non-cancelled), `orders_count`, `average_order_value`, `*_delta_percent` vs the previous period (`null` if the previous period was zero), `conversion_rate` and the funnel (`funnel`, `funnel_rates`), `orders_by_status` (every status, zero-filled), `daily` (days that had orders — fill gaps with zero in the chart), `top_products` (real units sold, never invented), `recent_orders`, `pending_payments`, `low_stock`, and first-steps `checklist` (keys: `add_product`, `payment_method`, `whatsapp`, `logo`).
- Same maths as the web dashboard: conversion = non-POS orders ÷ product views.

## Banners (homepage slider)
- `GET /banners` → ordered list with `image` (1200px WebP)
- `POST /banners` multipart `{image (required), title?, link_url?, position?, is_active?}` — `link_url` must be http(s)/mailto/tel (`SafeLinkUrl`)
- `POST /banners/{id}` — update (POST so multipart parses); only keys sent change, so `{is_active:false}` alone just hides it. Send `image` to replace it.
- `PUT /banners/reorder` `{ids:[...]}` — full new order
- `DELETE /banners/{id}`

## Home sections
- `GET /home-sections` → `{data, limits:{max_visible:6, max_picks:24}, sources:[{key,label}], featured_products_count}`. While there are no custom sections the storefront shows the built-in "Featured products" row.
- `POST /home-sections` / `PUT /home-sections/{id}` `{title, title_bn?, subtitle?, source: manual|featured|category|newest|best_sellers|on_sale, category_id (required for category), product_limit (4–12), is_active?}`
- `GET /home-sections/{id}` (adds `picks`), `GET /home-sections/{id}/preview` (what the storefront shows right now), `DELETE`
- `POST /home-sections/{id}/move` `{direction: up|down}` → returns the refreshed list
- Manual picks: `POST /home-sections/{id}/products` `{product_id}` (idempotent, max 24), `DELETE /home-sections/{id}/products/{pickId}`, `POST /home-sections/{id}/products/{pickId}/move` `{direction}` — each returns the section with its picks. Find products to add with `GET /products?q=`.
- Only 6 sections render on the storefront; empty ones are skipped.

## Theme customizer (owner only)
- `GET /storefront/themes` → catalogue with `label`, `blurb`, `family`, `is_current`, `is_category_default`, `preview` palette (`header`, `headerText`, `accent`, `tiles`)
- `GET /storefront/appearance` → `{theme (null = category default), effective_theme, theme_accent_color, show_category_tiles, show_theme_highlight_section, logo_url}`
- `PUT /storefront/appearance` — partial; only keys sent change; `theme: null` / `theme_accent_color: null` reset to the defaults. `theme_accent_color` is `#RRGGBB`.
- `POST /storefront/logo` multipart `logo` (jpeg/png/webp/svg ≤2 MB), `DELETE /storefront/logo`

## Marketing settings (owner only)
- `GET /marketing`, `PUT /marketing` — partial. Fields: `facebook_pixel_id`, `facebook_conversions_api_token` (**write-only**: responses only say `facebook_conversions_api_configured`), `ga4_measurement_id`, `gtm_container_id`, `tiktok_pixel_id`, `meta_title` (≤70), `meta_description` (≤300), `google_site_verification` (a pasted `<meta …>` tag is reduced to its token).
- A blank token leaves the stored one alone. To remove it send `{"clear": ["facebook_conversions_api_token"]}`.

## Store settings & integrations (owner only)
All partial: only keys sent change. **Secrets are write-only** — responses say whether one is set (`*_set`, `configured`), never its value, and they are stored encrypted. A blank secret leaves the stored one alone; `{"clear": ["<secret field>"]}` removes it (each group only accepts its own secret fields, else `422`).

- `GET|PUT /settings` → `{name, subdomain, category, whatsapp_number, reviews_enabled, show_platform_credit}`. Writable: `whatsapp_number` (`01XXXXXXXXX`, spaces/dashes are stripped), `reviews_enabled`, `show_platform_credit`. Hiding the "Powered by" credit is free on every plan.
- `GET|PUT /settings/payments` → `{sslcommerz_store_id, sslcommerz_store_password_set, sslcommerz_configured, bkash_number, nagad_number, available_payment_methods}`. `available_payment_methods` is what a buyer can pick at checkout right now (`cod` always; `sslcommerz` needs id **and** password; `manual_bkash` / `manual_nagad` need their number).
- `GET|PUT /settings/couriers` → one entry per driver: `{driver, label, plan_allows, configured, fields:{…non-secret values}, secrets_set:{…}}`.
  - Steadfast: `steadfast_api_key`, `steadfast_secret_key`. Pathao: `pathao_client_id`, `pathao_client_secret`, `pathao_username`, `pathao_password`, `pathao_store_id`, `pathao_city_id`, `pathao_zone_id`, `pathao_area_id`. RedX: `redx_access_token`, `redx_pickup_store_id`, `redx_default_area_id`, `redx_default_area_name`.
  - **Plan gate:** Starter allows Steadfast only. Saving Pathao/RedX fields on a plan without them returns `403 {code:"driver_not_in_plan", driver}` and saves nothing. Show those drivers **disabled with an upgrade prompt, not hidden** (`plan_allows:false`); upgrading unlocks them with no re-onboarding. `configured` + `plan_allows` is what makes a driver appear in an order's `courier.available_drivers`.
- `GET|PUT /settings/ai` `{ai_provider: anthropic|openai, ai_api_key}` → `{ai_provider, ai_api_key_set, configured}`. `configured` is also `/me`'s `store.ai_configured` and turns on the "Generate with AI" button. The platform never pays for or proxies AI usage.
- Facebook Conversions API token lives under `/marketing`.

## Custom domains (owner only)
Ownership is proven **only** by the TXT record — a CNAME never counts (a deleted store's subdomain can be re-registered, so a leftover CNAME must not hand the domain to the next signup).
- `GET /domains` → `{custom_domain_enabled, addon_price_yearly, addon_expires_at, data:[…]}`
- `POST /domains` `{domain}` (lower-cased; reserved/central-domain names and duplicates → `422`). On a plan without custom domains: `403 {code:"custom_domain_not_in_plan", addon_price_yearly}` — Growth/Business include one; Starter needs the ৳500/year add-on, which the operator enables (there is no self-serve purchase).
- Each domain: `{id, domain, status: pending_verification|verified, verified_at, is_primary, ssl_status, dns}` where `dns` is what to show the merchant:
  - `dns.verification` = `{type:"TXT", host, full_name, value}` — **show `host`, not `full_name`**: providers append the zone, so typing the full name creates `_bypari-verify.shop.example.com.example.com`. Offer `full_name` only as a fallback for providers that want it.
  - `dns.routing` = `{type:"CNAME"|"A", host, value, value_hint}` (a root domain gets an `A` record to the server IP; if `value` is null show `value_hint`).
  - `dns.notes` (e.g. Cloudflare "DNS only"). Give every field a copy button.
- `POST /domains/{id}/verify` → `{verified, message, misplaced_record, data}` — always `200`. When `verified` is false, show `message` verbatim: it says whether the record is missing yet (DNS can take minutes) or was created on the wrong name (`misplaced_record`) and what Host to type instead. A misplaced record is diagnosed, never accepted.
- `PUT /domains/{id}/primary` (verified only, else `422 not_verified`), `DELETE /domains/{id}`. HTTPS is issued automatically once traffic arrives.

## Staff accounts (owner only)
- `GET /staff` → `{max_staff_accounts (null = unlimited), can_add_staff_account, data:[{id,name,email,role,created_at}]}`
- `POST /staff` `{name, email, password, password_confirmation, role: owner|staff}`. Over the plan's seat cap → `403 {code:"staff_limit_reached", max_staff_accounts}` — show an upgrade prompt, not a form error. The cap is enforced where the user row is created, so no path bypasses it.
- `PUT /staff/{id}` `{name, email, role, password?, password_confirmation?}`. Setting a password **signs that person out of every phone**.
- `DELETE /staff/{id}` — signs their phone out immediately. `422` for removing yourself, or for demoting/removing the **last owner** (a store always keeps one).
- An email only has to be unique **within the store**; the same address can be staff in another store, and a clash never reveals that it exists elsewhere.
- Downgrading a plan never strips existing seats — the cap only blocks adding more.

## Plan & billing (owner only, read-only)
- `GET /plan` → `{plan:{key,label,price_yearly,price_monthly_quote,status,is_pending,trial_ends_at}, renewal:{expires_at,overdue,days_left}, usage:{staff_accounts:{used,max}, courier_drivers:{enabled,configured}, products:"unlimited", orders:"unlimited"}, custom_domain:{…}, plans:[… is_current, is_upgrade, contact_whatsapp_url], renew_whatsapp_url}`
- There is **no self-serve billing and no payment details in the app.** Upgrading or renewing = opening the prefilled `contact_whatsapp_url` / `renew_whatsapp_url`; the operator confirms payment outside the app and changes the plan. Quote prices per month, billed yearly. Products and orders are unlimited on every plan — never show a cap.
- `renewal.expires_at` is null for a new `pending` store until the operator approves it.

## Not built yet
In-app password reset via Android App Links, per-event push toggles, other push event types (payment, low stock, reviews), billing history (not exposed on the web either).

## Gaps
Things the app needs that the contract above doesn't pin down. The backend owner should confirm or add them.
- **`limits` shape** (login, signup, `/me`): the contract says it "comes from `PlanLimits`" but lists no keys. The app validates it as an open object and reads nothing from it until the keys are documented. Needed for `usePlanLimits()`.
- **`user` and `store` fields**: only `is_owner`, `api_base_url`, `is_pending`, `ai_configured`, `reviews_enabled` are named. The app also assumes `user.{id,name,email}` and optional `store.{name,subdomain}`. Please confirm.
- **`GET /products/describe` vs `/me`**: the Products section says AI-configured is "not yet exposed" in `/me`, but `/me` and `/settings/ai` document `store.ai_configured`. The app relies on `store.ai_configured`.
- **`409 stock_changed`** is documented under Variants & stock but missing from the Errors table at the top.
- **Image upload retries aren't idempotent.** `POST /products/{id}/images` (and the other image uploads) create a record each time and take no idempotency key. If the connection drops after the server saved the file but before the app got the reply, a retry adds a duplicate photo. The app re-reads the product after every upload attempt so the merchant sees it and can delete the extra one. An idempotency key (or a client-supplied upload id) would make retries safe.
- **Category save replies on the live server lack `position` and `products_count`.** `docs/samples-catalogue.md` says create/update now return the category with `products_count` (same shape as a list row), but the deployed server (found 2026-11-05 on a real create) returns it without `position` and `products_count`. The app treats both as optional on save replies and re-reads the list. Either deploy the newer backend or keep the contract as "optional".
