# Progress and verification tracker

Last updated: 2026-11-05. CLAUDE.md holds the milestone ticks; this file holds the detail that must survive between sessions.

Legend: ✅ confirmed by the user on a real phone · 🧪 covered by automated tests only · ⬜ not verified · ❌ not built

## Milestones
| | State |
|---|---|
| A Foundation | Code complete. User reports it works. |
| B Orders + push | Done and ticked. |
| C Catalogue + inventory | Code complete (all screens built). Awaiting on-device verification of the ⬜ items below before ticking. |
| D Selling | Code complete except the thermal printer (skipped for now by the user). POS confirmed working by the user; customers, carts, reviews, coupons, delivery charges, landing pages and the calendar date picker are built but not yet verified on the phone. |
| E Storefront + insights | Code complete: dashboard, banners, home sections, appearance (theme/accent/toggles/logo, owner only). Dashboard and banners confirmed working by the user; home sections and appearance not yet verified. |
| F Owner settings + release | In progress. Schemas for all of F done. Built (unverified): shop details, payments, AI key, marketing (More → Shop settings, owner only). Left: couriers, staff, plan, domains (needs a clipboard library, native), then performance and the signed release build. |

## Verification checklist (device: Realme RMX3195, Android 13, ~3.8 GB RAM)
### A Foundation
- ✅ App launches, language screen, login and signup screens render (user: "everything working")
- ⬜ Biometric lock: enable in More, lock, reopen
- ⬜ Release-build Crashlytics report actually arrives (debug builds disable collection)
- ⬜ Signup against a fresh shop end to end
- ⬜ Unexplained dev warning on every cold start: `react-i18next NO_I18NEXT_INSTANCE`. Tried synchronous init (no effect, reverted). No visible effect so far. Revisit if raw keys like `orders.title` ever appear.

### B Orders + push
- ✅ A real new-order push arrives
- ⬜ Tapping the push opens that order when the app is in the background
- ⬜ Tapping the push opens that order when the app is killed
- ⬜ Offline queue: change an order status in airplane mode, reconnect, see it apply
- ⬜ Invoice PDF content: Bangla renders, totals and amount due are right
- ⬜ Payment verify/reject, advance payment, courier booking against a real order
- ⬜ Logout unregisters the device (`DELETE /devices`)

### C Catalogue + inventory
- ✅ Products tab, list, detail, stock buttons (user: "products tab working")
- ✅ Photo picking, resize, upload, make main, remove (user: "working everything")
- ⬜ A portrait photo uploads upright (EXIF orientation)
- ⬜ Barcode scan opens the right product; unknown SKU shows the message
- ⬜ Stock-take and the `stock_changed` conflict message (needs two phones or an order mid-edit)
- ⬜ Product create/edit with the rich-text description; formatting round-trips
- ⬜ Variant add, edit (price only leaves stock alone), delete (confirm; hidden on last variant)
- ⬜ Product delete, including a product that appears in past orders (server behaviour unknown)
- ⬜ Categories: add (with and without image), edit, make a category a child of another, hide one, delete, move up/down (reorder persists after reopening)
- ⬜ CSV import: choose a file, see progress, final counts, and row errors from the server; products appear in the list afterwards
- ⬜ AI description: button appears only when the shop has an AI key; text is added below existing text and stays within the allowed formatting

### D Selling
- ✅ POS counter sale works on the phone (user: "It works"): search/scan, cart, cash sale, receipt
- ⬜ POS details not individually confirmed: wholesale tier price at 5+, stock cap, the `insufficient_stock` recovery, invoice share from the receipt
- ⬜ Customers: list, search, sort, detail (risk, orders, call/WhatsApp)
- ⬜ Abandoned carts: list, call/WhatsApp, remove
- ⬜ Reviews: pending/approved/rejected tabs, approve, reject, unpublish, delete; the "reviews switched off" note
- ⬜ Coupons: create each type (percentage, fixed, free delivery), edit, delete; duplicate code shows the server message on the field; calendar picker (start/expiry) works in Bangla and English
- ⬜ Delivery charges: owner can edit; a staff login sees read-only
- ⬜ Landing pages: create with a product, edit, add/remove photo, add/remove testimonial, open/share link, delete
- ⬜ Thermal printer: not built. Need the model, paper width (58/80 mm), and a real printer to test

### E Storefront + insights
- ✅ Dashboard and banners work on the phone (user: "it's working"; individual items below not itemised)
- ⬜ Dashboard: 7/30/90-day chips, custom range with the calendar (max one year), revenue/orders/average/conversion, daily bars (zero-filled), funnel, status counts, top products, recent orders, first-steps checklist
- ⬜ Dashboard as a staff login (it is open to staff)
- ⬜ Banners: add with image, edit, replace image, hide/show, reorder, delete; unsafe link (javascript:) is refused
- ⬜ Home sections: add each source type (manual, featured, category, newest, best sellers, on sale), edit, hide, reorder, delete; hand-pick products (add/remove/reorder, 24 max), preview matches the shop; product limit outside 4-12 is refused
- ⬜ Appearance (owner): pick a theme, back to the default, accent colour (#RRGGBB, shorthand, reset), the two toggles, logo add/replace/remove (2 MB limit)
- ⬜ A staff login does NOT see the Appearance button in More → Storefront (owner only)

### F Owner settings
- ⬜ Shop details: WhatsApp number (spaces/dashes accepted), reviews switch, "Powered by" switch
- ⬜ Payments: bKash/Nagad numbers, SSLCommerz id; the store password shows "Configured ✓" with Replace and Clear and is never prefilled; the list of methods customers can pay by updates
- ⬜ AI key: provider + key (write-only); after saving, "Write with AI" appears on the product form
- ⬜ Marketing: pixel/analytics ids, Conversions API token (write-only), a pasted Search Console tag is reduced to its code
- ⬜ A staff login does NOT see "Shop settings" in More (owner only)

### Design system (2026-11-05)
- Brand from `assets/logo/byapari-logo.svg`: red `#ED1C24` (logo), buttons `#D8161E` (white text 5.2:1), text `#1A1A1A`, background `#F7F5F0`. Tokens in `src/ui/theme.ts`; shared kit in `src/ui/` (Button, Field, Choice, Skeleton, Sheet, Chip/Pill, Icon, Brand logo, TabBar, DateField).
- App icon: adaptive (red background + cream symbol), rendered from the SVG with resvg (scratch tooling, not a project dependency). App name "Byapari" / "ব্যাপারি".
- Cards are soft white shadows instead of borders; 22 screens converted by script.
- ⬜ User to review on the phone: logo on auth screens, floating tab bar, More screen, dashboard hero card, order badges, bottom sheets (language, sign-out, date picker, order status).
- ⬜ Still inline (candidates for bottom sheets): the "Are you sure?" confirmations for deleting products, variants, categories, coupons, banners, sections, landing pages, reviews, carts, staff, and the SecretField clear.
- Not done: haptics, shared-element transitions, a Latin display font (kept Noto Sans Bengali so old Android phones render Bangla).

## Known gaps and open questions
- Backend gaps are in `docs/api-contract.md` under "Gaps" (image upload has no idempotency key; `/me` vs describe inconsistency; `stock_changed` missing from the error table).
- `PUT /products/{id}` response shape is not in the samples; the app re-reads the product after saving. Same for category create/update responses (not in the samples): the app re-reads the category list.
- Category delete (known from the samples): it never refuses. Products in it are kept and become uncategorised; subcategories are promoted to top level. The response is always the fixed message "Category deleted.", so the app warns about the consequences before deleting. Category save responses return `{data: category}` and are now validated.
- **Live server is behind the samples:** create/update category replies on the deployed server omit `position` and `products_count` (the samples doc says they're included). Found when a create succeeded but the app reported a failure; fixed by making both optional on save replies. Other endpoints may also differ from the samples: when a save works but the app shows "unexpected reply", check the dev log line `[api] ... response failed validation at <fields>`.
- Dashboard `low_stock` row shape is not in the samples (always empty there), so the app only shows a count. Need a sample with a low-stock item to list them.
- Banner `link_url` rule: the server accepts a path starting with `/` or a full http(s) address (its own message); the app also allows mailto:/tel: as a courtesy and blocks `javascript:`, `data:` and `//host` links.
- `docs/samples-storefront.md` is untracked: backup `test/samples-storefront.source.md` (do not overwrite), fixture `test/samples-storefront.ts`.
- Courier `fields` (e.g. `steadfast_api_key`, `sslcommerz_store_id`) come back in clear as non-secret values per the samples; only the real secrets (secret keys, passwords) are `*_set` flags. CLAUDE.md rule 6 says keys are never returned: the backend treats API keys/ids as identifiers. The app shows them as the server sends them. Confirm this is intended.
- `docs/samples-settings.md` is untracked: backup `test/samples-settings.source.md` (do not overwrite), fixture `test/samples-settings.ts`.
- Category 404 bodies are PHP model names ("No query results for model [App\\Models\\Category] 9999"), not user-friendly. The app never shows server text for 404; it shows its own translated message.
- **`docs/samples-catalogue.md` lost its original ~770 lines** (create product, stock, imports, etc.) when the categories sections were added; it now starts at "# Categories: save and delete" and says "same way as above" with nothing above. The doc is untracked, so git cannot restore it. The original samples survive as `test/samples-catalogue.ts` (generated before the loss); the categories ones are in `test/samples-categories.ts`. Do not regenerate the first from the doc.
- CSV import row-error messages come from the server in English and are shown as-is.
- Product delete: unknown whether the server refuses products that appear in past orders.
- Debug APK is ~91 MB (ML Kit, image libraries, all libs). Release needs ABI splits and ProGuard; measure in Milestone F.
- Wireless debugging drops often; USB is more reliable for installs. Metro must be running (`npx react-native start`) with `adb reverse tcp:8081 tcp:8081`.

- The calendar date picker is plain JavaScript (`src/ui/DateField.tsx`, logic in `src/ui/calendar.ts`): no native library, so no rebuild and no APK growth. Week starts on Sunday; "today" is the Asia/Dhaka date.

## Libraries deviating from the CLAUDE.md suggestions (and why)
- `@bam.tech/react-native-image-resizer` instead of `react-native-image-resizer` (original unmaintained since 2022, no New Architecture).
- `@react-native-documents/picker` instead of `react-native-document-picker` (renamed successor).
- `react-native-vision-camera-barcode-scanner` added: vision-camera v5 cannot scan barcodes on Android on its own.
- `react-native-fast-image` not used yet; the product list uses React Native's `Image`. Check New Architecture support before swapping it in.

## Tests
302 unit tests, 36 suites (API client, error mapper, offline queue, formatters, schemas against real samples, rich text, forms, push payload, upload). No component tests or Maestro E2E yet (CLAUDE.md asks for both).

## CI readiness (CLAUDE.md: lint, typecheck, test, signed release build)
- `npm run lint`: 0 errors, 26 style warnings (`void promise` inside arrow functions). `npm run typecheck` clean. `npm test` 174 tests.
- Not done: a CI workflow file, and a signed release build (Milestone F).

## Source control
`docs/samples-selling.md` is untracked: its backup is `test/samples-selling.source.md` (do not overwrite) and its parsed fixture is `test/samples-selling.ts`.

Nothing committed since the initial commit; no remote. Back this up to a private GitHub repo.
