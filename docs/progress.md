# Progress and verification tracker

Last updated: 2026-11-03. CLAUDE.md holds the milestone ticks; this file holds the detail that must survive between sessions.

Legend: ✅ confirmed by the user on a real phone · 🧪 covered by automated tests only · ⬜ not verified · ❌ not built

## Milestones
| | State |
|---|---|
| A Foundation | Code complete. User reports it works. |
| B Orders + push | Done and ticked. |
| C Catalogue + inventory | ~80%. Left: categories (create/edit/reorder/image), CSV import, AI description. |
| D Selling | ❌ not started |
| E Storefront + insights | ❌ not started |
| F Owner settings + release | ❌ not started |

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

## Known gaps and open questions
- Backend gaps are in `docs/api-contract.md` under "Gaps" (image upload has no idempotency key; `/me` vs describe inconsistency; `stock_changed` missing from the error table).
- `PUT /products/{id}` response shape is not in the samples; the app re-reads the product after saving.
- Product delete: unknown whether the server refuses products that appear in past orders.
- Debug APK is ~91 MB (ML Kit, image libraries, all libs). Release needs ABI splits and ProGuard; measure in Milestone F.
- Wireless debugging drops often; USB is more reliable for installs. Metro must be running (`npx react-native start`) with `adb reverse tcp:8081 tcp:8081`.

## Libraries deviating from the CLAUDE.md suggestions (and why)
- `@bam.tech/react-native-image-resizer` instead of `react-native-image-resizer` (original unmaintained since 2022, no New Architecture).
- `@react-native-documents/picker` instead of `react-native-document-picker` (renamed successor).
- `react-native-vision-camera-barcode-scanner` added: vision-camera v5 cannot scan barcodes on Android on its own.
- `react-native-fast-image` not used yet; the product list uses React Native's `Image`. Check New Architecture support before swapping it in.

## Tests
145 unit tests, 20 suites (API client, error mapper, offline queue, formatters, schemas against real samples, rich text, forms, push payload, upload). No component tests or Maestro E2E yet (CLAUDE.md asks for both).

## Source control
Nothing committed since the initial commit; no remote. Back this up to a private GitHub repo.
