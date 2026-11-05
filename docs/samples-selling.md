# Selling-tools API samples (Milestone D)

Generated from the real backend against fake data (a throwaway test, not committed), so field names, types and nesting match production. IDs, dates and image URLs are test values.

## POS product search (variant with price tiers)

`GET /api/v1/pos/products?q=Earbuds` → **200**

Response:

```json
{
    "data": [
        {
            "variant_id": 1,
            "product_id": 1,
            "product_name": "Wireless Earbuds",
            "variant_name": "Default",
            "sku": "EAR-001",
            "price": "1500.00",
            "stock_quantity": 12,
            "tracks_inventory": true,
            "thumb": null,
            "price_tiers": [
                {
                    "min_quantity": 5,
                    "price": "1350.00"
                },
                {
                    "min_quantity": 10,
                    "price": "1200.00"
                }
            ]
        }
    ]
}
```

## POS sale (success, wholesale tier applied)

`POST /api/v1/pos/sales` → **201**

5 × tier price ৳1,350 instead of ৳1,500.

Request body:

```json
{
    "customer_name": "Rafi Ahmed",
    "customer_phone": "01711111111",
    "items": [
        {
            "variant_id": 1,
            "quantity": 5
        }
    ]
}
```

Response:

```json
{
    "data": {
        "id": 1,
        "order_number": "ORD-000001",
        "status": "delivered",
        "payment_method": "pos",
        "payment_status": "paid",
        "customer_name": "Rafi Ahmed",
        "customer_phone": "01711111111",
        "total": "6750.00",
        "created_at": "2026-11-05T08:40:08+00:00",
        "customer_address": "",
        "delivery_zone": "in_store",
        "coupon_code": null,
        "subtotal": "6750.00",
        "discount_amount": "0.00",
        "delivery_charge": "0.00",
        "advance_paid": "0.00",
        "amount_due": "0.00",
        "cancelled_at": null,
        "items": [
            {
                "id": 1,
                "product_id": 1,
                "variant_id": 1,
                "product_name": "Wireless Earbuds",
                "variant_name": "Default",
                "sku": "EAR-001",
                "unit_price": "1350.00",
                "quantity": 5,
                "line_total": "6750.00"
            }
        ],
        "payment": null,
        "advance_payments": [],
        "courier": {
            "booking": null,
            "available_drivers": []
        },
        "customer_risk": {
            "total": 0,
            "delivered": 0,
            "cancelled": 0,
            "resolved": 0,
            "cancellation_rate": null,
            "level": "new"
        }
    }
}
```

## POS sale, insufficient stock

`POST /api/v1/pos/sales` → **409**

Only 2 Phone Cases in stock. The whole sale is rolled back.

Request body:

```json
{
    "items": [
        {
            "variant_id": 2,
            "quantity": 3
        }
    ]
}
```

Response:

```json
{
    "message": "Not enough stock for PHC-002 — only 2 left.",
    "code": "insufficient_stock",
    "variant_id": 2,
    "stock_quantity": 2
}
```

## POS sale, validation error (empty cart)

`POST /api/v1/pos/sales` → **422**

Request body:

```json
{
    "items": []
}
```

Response:

```json
{
    "message": "The items field is required.",
    "errors": {
        "items": [
            "The items field is required."
        ]
    }
}
```

## Create coupon (percentage)

`POST /api/v1/coupons` → **201**

Code is trimmed and upper-cased.

Request body:

```json
{
    "code": " eid20 ",
    "type": "percentage",
    "value": 20,
    "min_order_amount": 1000,
    "max_uses": 100,
    "expires_at": "2026-12-31",
    "is_active": true
}
```

Response:

```json
{
    "data": {
        "id": 1,
        "code": "EID20",
        "type": "percentage",
        "value": "20.00",
        "min_order_amount": "1000.00",
        "max_uses": 100,
        "used_count": 0,
        "starts_at": null,
        "expires_at": "2026-12-31T00:00:00+00:00",
        "is_active": true
    }
}
```

## Create coupon (free delivery)

`POST /api/v1/coupons` → **201**

Request body:

```json
{
    "code": "FREESHIP",
    "type": "free_delivery"
}
```

Response:

```json
{
    "data": {
        "id": 2,
        "code": "FREESHIP",
        "type": "free_delivery",
        "value": null,
        "min_order_amount": null,
        "max_uses": null,
        "used_count": 0,
        "starts_at": null,
        "expires_at": null,
        "is_active": true
    }
}
```

## Create coupon, validation errors

`POST /api/v1/coupons` → **422**

Duplicate code and value over 100%.

Request body:

```json
{
    "code": "EID20",
    "type": "percentage",
    "value": 150
}
```

Response:

```json
{
    "message": "The code has already been taken. (and 1 more error)",
    "errors": {
        "code": [
            "The code has already been taken."
        ],
        "value": [
            "The value field must not be greater than 100."
        ]
    }
}
```

## List coupons

`GET /api/v1/coupons` → **200**

Response:

```json
{
    "data": [
        {
            "id": 2,
            "code": "FREESHIP",
            "type": "free_delivery",
            "value": null,
            "min_order_amount": null,
            "max_uses": null,
            "used_count": 0,
            "starts_at": null,
            "expires_at": null,
            "is_active": true
        },
        {
            "id": 1,
            "code": "EID20",
            "type": "percentage",
            "value": "20.00",
            "min_order_amount": "1000.00",
            "max_uses": 100,
            "used_count": 0,
            "starts_at": null,
            "expires_at": "2026-12-31T00:00:00+00:00",
            "is_active": true
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 1,
        "total": 2
    }
}
```

## One coupon

`GET /api/v1/coupons/1` → **200**

Response:

```json
{
    "data": {
        "id": 1,
        "code": "EID20",
        "type": "percentage",
        "value": "20.00",
        "min_order_amount": "1000.00",
        "max_uses": 100,
        "used_count": 0,
        "starts_at": null,
        "expires_at": "2026-12-31T00:00:00+00:00",
        "is_active": true
    }
}
```

## Update coupon

`PUT /api/v1/coupons/1` → **200**

Request body:

```json
{
    "code": "EID25",
    "type": "percentage",
    "value": 25,
    "min_order_amount": 1000,
    "max_uses": 100,
    "is_active": true
}
```

Response:

```json
{
    "data": {
        "id": 1,
        "code": "EID25",
        "type": "percentage",
        "value": "25.00",
        "min_order_amount": "1000.00",
        "max_uses": 100,
        "used_count": 0,
        "starts_at": null,
        "expires_at": "2026-12-31T00:00:00+00:00",
        "is_active": true
    }
}
```

## List delivery zones

`GET /api/v1/delivery-zones` → **200**

Response:

```json
{
    "data": [
        {
            "zone": "inside_dhaka",
            "base_charge": "60.00",
            "base_weight_grams": 500,
            "per_kg_charge": "15.00",
            "estimated_delivery_note": "1-2 days"
        },
        {
            "zone": "outside_dhaka",
            "base_charge": "120.00",
            "base_weight_grams": 500,
            "per_kg_charge": "20.00",
            "estimated_delivery_note": "3-5 days"
        }
    ]
}
```

## Update delivery zone

`PUT /api/v1/delivery-zones/inside_dhaka` → **200**

Request body:

```json
{
    "base_charge": 70,
    "base_weight_grams": 1000,
    "per_kg_charge": 20,
    "estimated_delivery_note": "1-2 days"
}
```

Response:

```json
{
    "data": {
        "zone": "inside_dhaka",
        "base_charge": "70.00",
        "base_weight_grams": 1000,
        "per_kg_charge": "20.00",
        "estimated_delivery_note": "1-2 days"
    }
}
```

## Update delivery zone, validation error

`PUT /api/v1/delivery-zones/inside_dhaka` → **422**

Request body:

```json
{
    "base_charge": -5
}
```

Response:

```json
{
    "message": "The base charge field must be at least 0. (and 2 more errors)",
    "errors": {
        "base_charge": [
            "The base charge field must be at least 0."
        ],
        "base_weight_grams": [
            "The base weight grams field is required."
        ],
        "per_kg_charge": [
            "The per kg charge field is required."
        ]
    }
}
```

## Create landing page (with an image)

`POST /api/v1/landing-pages` → **201**

Multipart form; `images[]` is optional.

Request body:

```json
{
    "product_id": 1,
    "title": "Eid Offer",
    "headline": "Best earbuds deal this Eid",
    "is_active": true
}
```

Response:

```json
{
    "data": {
        "id": 1,
        "title": "Eid Offer",
        "slug": "eid-offer",
        "is_active": true,
        "product": {
            "id": 1,
            "name": "Wireless Earbuds"
        },
        "url": "http://similique-sint.bypari.localhost/lp/eid-offer",
        "headline": "Best earbuds deal this Eid",
        "subheadline": null,
        "description": null,
        "why_choose_us": null,
        "images": [
            {
                "id": 1,
                "thumb": "/storage/store-1/1/conversions/a-thumb.webp",
                "card": "/storage/store-1/1/conversions/a-card.webp",
                "zoom": "/storage/store-1/1/conversions/a-zoom.webp",
                "position": 1
            }
        ],
        "testimonials": []
    }
}
```

## Upload landing page image

`POST /api/v1/landing-pages/1/images` → **201**

Multipart form, field `image`.

Response:

```json
{
    "data": {
        "id": 2,
        "thumb": "/storage/store-1/2/conversions/b-thumb.webp",
        "card": "/storage/store-1/2/conversions/b-card.webp",
        "zoom": "/storage/store-1/2/conversions/b-zoom.webp",
        "position": 2
    }
}
```

## Add testimonial

`POST /api/v1/landing-pages/1/testimonials` → **201**

Request body:

```json
{
    "author_name": "Nadia Rahman",
    "quote": "Sound quality is amazing for the price."
}
```

Response:

```json
{
    "data": {
        "id": 1,
        "author_name": "Nadia Rahman",
        "quote": "Sound quality is amazing for the price."
    }
}
```

## Add testimonial, validation error

`POST /api/v1/landing-pages/1/testimonials` → **422**

Request body:

```json
{
    "author_name": "",
    "quote": ""
}
```

Response:

```json
{
    "message": "The author name field is required. (and 1 more error)",
    "errors": {
        "author_name": [
            "The author name field is required."
        ],
        "quote": [
            "The quote field is required."
        ]
    }
}
```

## List landing pages

`GET /api/v1/landing-pages` → **200**

Response:

```json
{
    "data": [
        {
            "id": 1,
            "title": "Eid Offer",
            "slug": "eid-offer",
            "is_active": true,
            "product": {
                "id": 1,
                "name": "Wireless Earbuds"
            },
            "url": "http://similique-sint.bypari.localhost/lp/eid-offer"
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 1,
        "total": 1
    }
}
```

## Landing page detail (images + testimonials)

`GET /api/v1/landing-pages/1` → **200**

Response:

```json
{
    "data": {
        "id": 1,
        "title": "Eid Offer",
        "slug": "eid-offer",
        "is_active": true,
        "product": {
            "id": 1,
            "name": "Wireless Earbuds"
        },
        "url": "http://similique-sint.bypari.localhost/lp/eid-offer",
        "headline": "Best earbuds deal this Eid",
        "subheadline": null,
        "description": null,
        "why_choose_us": null,
        "images": [
            {
                "id": 1,
                "thumb": "/storage/store-1/1/conversions/a-thumb.webp",
                "card": "/storage/store-1/1/conversions/a-card.webp",
                "zoom": "/storage/store-1/1/conversions/a-zoom.webp",
                "position": 1
            },
            {
                "id": 2,
                "thumb": "/storage/store-1/2/conversions/b-thumb.webp",
                "card": "/storage/store-1/2/conversions/b-card.webp",
                "zoom": "/storage/store-1/2/conversions/b-zoom.webp",
                "position": 2
            }
        ],
        "testimonials": [
            {
                "id": 1,
                "author_name": "Nadia Rahman",
                "quote": "Sound quality is amazing for the price."
            }
        ]
    }
}
```

## List abandoned carts

`GET /api/v1/abandoned-carts` → **200**

Only carts idle 60+ minutes are listed.

Response:

```json
{
    "data": [
        {
            "id": 1,
            "phone": "01822222222",
            "name": "Sara Khan",
            "address": "House 12, Road 4, Dhanmondi, Dhaka",
            "last_activity_at": "2026-11-05T05:40:08+00:00",
            "total": "3000.00",
            "items": [
                {
                    "product_name": "Wireless Earbuds",
                    "variant_name": "Default",
                    "sku": "EAR-001",
                    "quantity": 2,
                    "line_total": "3000.00"
                }
            ]
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 1,
        "total": 1
    }
}
```

## List reviews (default: pending) with counts

`GET /api/v1/reviews` → **200**

Response:

```json
{
    "reviews_enabled": false,
    "counts": {
        "pending": 1,
        "approved": 1,
        "rejected": 0
    },
    "data": [
        {
            "id": 2,
            "product": {
                "id": 1,
                "name": "Wireless Earbuds"
            },
            "customer_name": "Tania",
            "customer_phone": "01933333333",
            "rating": 4,
            "comment": "Good, battery could be better.",
            "status": "pending",
            "is_verified_buyer": false,
            "created_at": "2026-11-05T08:40:08+00:00",
            "moderated_at": null
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 1,
        "total": 1
    }
}
```

## Approve review

`PUT /api/v1/reviews/2` → **200**

Request body:

```json
{
    "status": "approved"
}
```

Response:

```json
{
    "data": {
        "id": 2,
        "product": {
            "id": 1,
            "name": "Wireless Earbuds"
        },
        "customer_name": "Tania",
        "customer_phone": "01933333333",
        "rating": 4,
        "comment": "Good, battery could be better.",
        "status": "approved",
        "is_verified_buyer": false,
        "created_at": "2026-11-05T08:40:08+00:00",
        "moderated_at": "2026-11-05T08:40:08+00:00"
    }
}
```

## Review, invalid status

`PUT /api/v1/reviews/2` → **422**

Request body:

```json
{
    "status": "pending"
}
```

Response:

```json
{
    "message": "The selected status is invalid.",
    "errors": {
        "status": [
            "The selected status is invalid."
        ]
    }
}
```

## List customers

`GET /api/v1/customers?sort=orders` → **200**

Response:

```json
{
    "data": [
        {
            "phone": "01711111111",
            "name": "Rafi Ahmed",
            "orders_count": 2,
            "delivered_count": 2,
            "cancelled_count": 0,
            "total_spent": "7250.00",
            "last_order_at": "2026-11-05T08:40:08+00:00",
            "risk_level": "new"
        },
        {
            "phone": "01822222222",
            "name": "Sara Khan",
            "orders_count": 2,
            "delivered_count": 0,
            "cancelled_count": 1,
            "total_spent": "700.00",
            "last_order_at": "2026-11-05T08:40:08+00:00",
            "risk_level": "new"
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 1,
        "total": 2
    }
}
```

## One customer

`GET /api/v1/customers/01711111111` → **200**

Response:

```json
{
    "data": {
        "phone": "01711111111",
        "name": "Rafi Ahmed",
        "last_address": "House 12, Road 4, Dhanmondi, Dhaka",
        "orders_count": 2,
        "total_spent": "7250.00",
        "has_account": false,
        "risk": {
            "total": 2,
            "delivered": 2,
            "cancelled": 0,
            "resolved": 2,
            "cancellation_rate": 0,
            "level": "new"
        },
        "orders": [
            {
                "id": 3,
                "order_number": "ORD-000003",
                "status": "delivered",
                "payment_method": "cod",
                "payment_status": "unpaid",
                "customer_name": "Rafi Ahmed",
                "customer_phone": "01711111111",
                "total": "500.00",
                "created_at": "2026-11-05T08:40:08+00:00"
            },
            {
                "id": 1,
                "order_number": "ORD-000001",
                "status": "delivered",
                "payment_method": "pos",
                "payment_status": "paid",
                "customer_name": "Rafi Ahmed",
                "customer_phone": "01711111111",
                "total": "6750.00",
                "created_at": "2026-11-05T08:40:08+00:00"
            }
        ]
    }
}
```

## Unknown customer

`GET /api/v1/customers/01799999999` → **404**

Response:

```json
{
    "message": ""
}
```

---

Notes: `reviews_enabled` is `false` here because the fake store never switched reviews on in Settings. The 404 body is shown without the Laravel debug trace (`APP_DEBUG` only); in production it is just `{"message": "No query results for model [...]"}`.
