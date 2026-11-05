// Parsed from docs/samples-selling.md (fake data). Do not edit by hand.
export const sellingSamples: Record<string, unknown> = {
  "POS product search (variant with price tiers)": {
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
},
  "POS sale (success, wholesale tier applied)": {
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
},
  "POS sale, insufficient stock": {
    "message": "Not enough stock for PHC-002 — only 2 left.",
    "code": "insufficient_stock",
    "variant_id": 2,
    "stock_quantity": 2
},
  "POS sale, validation error (empty cart)": {
    "message": "The items field is required.",
    "errors": {
        "items": [
            "The items field is required."
        ]
    }
},
  "Create coupon (percentage)": {
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
},
  "Create coupon (free delivery)": {
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
},
  "Create coupon, validation errors": {
    "message": "The code has already been taken. (and 1 more error)",
    "errors": {
        "code": [
            "The code has already been taken."
        ],
        "value": [
            "The value field must not be greater than 100."
        ]
    }
},
  "List coupons": {
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
},
  "One coupon": {
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
},
  "Update coupon": {
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
},
  "List delivery zones": {
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
},
  "Update delivery zone": {
    "data": {
        "zone": "inside_dhaka",
        "base_charge": "70.00",
        "base_weight_grams": 1000,
        "per_kg_charge": "20.00",
        "estimated_delivery_note": "1-2 days"
    }
},
  "Update delivery zone, validation error": {
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
},
  "Create landing page (with an image)": {
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
},
  "Upload landing page image": {
    "data": {
        "id": 2,
        "thumb": "/storage/store-1/2/conversions/b-thumb.webp",
        "card": "/storage/store-1/2/conversions/b-card.webp",
        "zoom": "/storage/store-1/2/conversions/b-zoom.webp",
        "position": 2
    }
},
  "Add testimonial": {
    "data": {
        "id": 1,
        "author_name": "Nadia Rahman",
        "quote": "Sound quality is amazing for the price."
    }
},
  "Add testimonial, validation error": {
    "message": "The author name field is required. (and 1 more error)",
    "errors": {
        "author_name": [
            "The author name field is required."
        ],
        "quote": [
            "The quote field is required."
        ]
    }
},
  "List landing pages": {
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
},
  "Landing page detail (images + testimonials)": {
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
},
  "List abandoned carts": {
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
},
  "List reviews (default: pending) with counts": {
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
},
  "Approve review": {
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
},
  "Review, invalid status": {
    "message": "The selected status is invalid.",
    "errors": {
        "status": [
            "The selected status is invalid."
        ]
    }
},
  "List customers": {
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
},
  "One customer": {
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
},
  "Unknown customer": {
    "message": ""
},
};
