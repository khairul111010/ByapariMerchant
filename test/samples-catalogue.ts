// Parsed from docs/samples-catalogue.md (fake data). Do not edit by hand.
export const catalogueSamples: Record<string, unknown> = {
  "Create product": {
    "data": {
        "id": 1,
        "name": "Wireless Earbuds",
        "slug": "wireless-earbuds",
        "status": "active",
        "is_featured": false,
        "track_inventory": true,
        "brand": null,
        "category": {
            "id": 1,
            "name": "Electronics"
        },
        "thumb": null,
        "default_variant": {
            "id": 1,
            "sku": "EAR-001",
            "price": "1500.00",
            "compare_at_price": "1800.00",
            "stock_quantity": 25
        },
        "created_at": "2026-11-03T06:56:18+00:00",
        "description": "<p>Great <strong>sound</strong> quality.</p>",
        "meta_title": null,
        "meta_description": null,
        "storefront_url": "http://veniam-omnis.bypari.localhost/products/wireless-earbuds",
        "images": [],
        "variants": [
            {
                "id": 1,
                "product_id": 1,
                "sku": "EAR-001",
                "name": null,
                "attributes": null,
                "price": "1500.00",
                "compare_at_price": "1800.00",
                "stock_quantity": 25,
                "low_stock_threshold": null,
                "weight_grams": 500,
                "is_default": true,
                "images": [],
                "price_tiers": []
            }
        ]
    }
},
  "Upload product image": {
    "data": {
        "id": 1,
        "thumb": "/storage/store-1/1/conversions/earbuds-thumb.webp",
        "card": "/storage/store-1/1/conversions/earbuds-card.webp",
        "zoom": "/storage/store-1/1/conversions/earbuds-zoom.webp",
        "position": 1
    }
},
  "Upload variant image": {
    "data": {
        "id": 2,
        "thumb": "/storage/store-1/2/conversions/black-thumb.webp",
        "card": "/storage/store-1/2/conversions/black-card.webp",
        "zoom": "/storage/store-1/2/conversions/black-zoom.webp",
        "position": 1
    }
},
  "Create variant": {
    "data": {
        "id": 2,
        "product_id": 1,
        "sku": "EAR-001-WHT",
        "name": "White",
        "attributes": null,
        "price": "1550.00",
        "compare_at_price": null,
        "stock_quantity": 8,
        "low_stock_threshold": null,
        "weight_grams": 500,
        "is_default": false,
        "images": [],
        "price_tiers": []
    }
},
  "Add price tier": {
    "data": {
        "id": 1,
        "min_quantity": 5,
        "price": "1400.00"
    }
},
  "List products (compact rows)": {
    "data": [
        {
            "id": 1,
            "name": "Wireless Earbuds",
            "slug": "wireless-earbuds",
            "status": "active",
            "is_featured": false,
            "track_inventory": true,
            "brand": null,
            "category": {
                "id": 1,
                "name": "Electronics"
            },
            "thumb": "/storage/store-1/1/conversions/earbuds-thumb.webp",
            "default_variant": {
                "id": 1,
                "sku": "EAR-001",
                "price": "1500.00",
                "compare_at_price": "1800.00",
                "stock_quantity": 25
            },
            "created_at": "2026-11-03T06:56:18+00:00"
        }
    ],
    "links": {
        "first": "http://veniam-omnis.bypari.localhost/api/v1/products?page=1",
        "last": "http://veniam-omnis.bypari.localhost/api/v1/products?page=1",
        "prev": null,
        "next": null
    },
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "links": [
            {
                "url": null,
                "label": "Previous",
                "active": false
            },
            {
                "url": "http://veniam-omnis.bypari.localhost/api/v1/products?page=1",
                "label": "1",
                "active": true
            },
            {
                "url": null,
                "label": "Next",
                "active": false
            }
        ],
        "path": "http://veniam-omnis.bypari.localhost/api/v1/products",
        "per_page": 20,
        "to": 1,
        "total": 1
    }
},
  "Product detail (full)": {
    "data": {
        "id": 1,
        "name": "Wireless Earbuds",
        "slug": "wireless-earbuds",
        "status": "active",
        "is_featured": false,
        "track_inventory": true,
        "brand": null,
        "category": {
            "id": 1,
            "name": "Electronics"
        },
        "thumb": "/storage/store-1/1/conversions/earbuds-thumb.webp",
        "default_variant": {
            "id": 1,
            "sku": "EAR-001",
            "price": "1500.00",
            "compare_at_price": "1800.00",
            "stock_quantity": 25
        },
        "created_at": "2026-11-03T06:56:18+00:00",
        "description": "<p>Great <strong>sound</strong> quality.</p>",
        "meta_title": null,
        "meta_description": null,
        "storefront_url": "http://veniam-omnis.bypari.localhost/products/wireless-earbuds",
        "images": [
            {
                "id": 1,
                "thumb": "/storage/store-1/1/conversions/earbuds-thumb.webp",
                "card": "/storage/store-1/1/conversions/earbuds-card.webp",
                "zoom": "/storage/store-1/1/conversions/earbuds-zoom.webp",
                "position": 1
            }
        ],
        "variants": [
            {
                "id": 1,
                "product_id": 1,
                "sku": "EAR-001",
                "name": null,
                "attributes": null,
                "price": "1500.00",
                "compare_at_price": "1800.00",
                "stock_quantity": 25,
                "low_stock_threshold": null,
                "weight_grams": 500,
                "is_default": true,
                "images": [
                    {
                        "id": 2,
                        "thumb": "/storage/store-1/2/conversions/black-thumb.webp",
                        "card": "/storage/store-1/2/conversions/black-card.webp",
                        "zoom": "/storage/store-1/2/conversions/black-zoom.webp",
                        "position": 1
                    }
                ],
                "price_tiers": [
                    {
                        "id": 1,
                        "min_quantity": 5,
                        "price": "1400.00"
                    }
                ]
            },
            {
                "id": 2,
                "product_id": 1,
                "sku": "EAR-001-WHT",
                "name": "White",
                "attributes": null,
                "price": "1550.00",
                "compare_at_price": null,
                "stock_quantity": 8,
                "low_stock_threshold": null,
                "weight_grams": 500,
                "is_default": false,
                "images": [],
                "price_tiers": []
            }
        ]
    }
},
  "List categories": {
    "data": [
        {
            "id": 2,
            "parent_id": null,
            "name": "Accessories",
            "slug": "asperiores-reiciendis",
            "description": null,
            "position": 0,
            "is_active": true,
            "image": null,
            "products_count": 0
        },
        {
            "id": 1,
            "parent_id": null,
            "name": "Electronics",
            "slug": "repellendus-blanditiis",
            "description": null,
            "position": 0,
            "is_active": true,
            "image": null,
            "products_count": 1
        }
    ]
},
  "Stock adjust, delta mode": {
    "data": {
        "id": 1,
        "product_id": 1,
        "sku": "EAR-001",
        "name": null,
        "attributes": null,
        "price": "1500.00",
        "compare_at_price": "1800.00",
        "stock_quantity": 22,
        "low_stock_threshold": null,
        "weight_grams": 500,
        "is_default": true,
        "images": [
            {
                "id": 2,
                "thumb": "/storage/store-1/2/conversions/black-thumb.webp",
                "card": "/storage/store-1/2/conversions/black-card.webp",
                "zoom": "/storage/store-1/2/conversions/black-zoom.webp",
                "position": 1
            }
        ],
        "price_tiers": [
            {
                "id": 1,
                "min_quantity": 5,
                "price": "1400.00"
            }
        ]
    }
},
  "Stock adjust, delta below zero": {
    "message": "Only 22 in stock; can't remove 500.",
    "code": "insufficient_stock",
    "stock_quantity": 22
},
  "Stock adjust, set with stale `expected`": {
    "message": "Stock changed to 22 while you were editing (orders came in). Check the number and try again.",
    "code": "stock_changed",
    "stock_quantity": 22
},
  "Variant save with stale `stock_quantity_was`": {
    "message": "Stock changed to 22 while you were editing (orders came in). Check the number and save again.",
    "code": "stock_changed",
    "stock_quantity": 22
},
  "Variant save (price only, stock untouched)": {
    "data": {
        "id": 1,
        "product_id": 1,
        "sku": "EAR-001",
        "name": null,
        "attributes": null,
        "price": "1450.00",
        "compare_at_price": "1800.00",
        "stock_quantity": 22,
        "low_stock_threshold": null,
        "weight_grams": 500,
        "is_default": true,
        "images": [
            {
                "id": 2,
                "thumb": "/storage/store-1/2/conversions/black-thumb.webp",
                "card": "/storage/store-1/2/conversions/black-card.webp",
                "zoom": "/storage/store-1/2/conversions/black-zoom.webp",
                "position": 1
            }
        ],
        "price_tiers": [
            {
                "id": 1,
                "min_quantity": 5,
                "price": "1400.00"
            }
        ]
    }
},
  "Stock history": {
    "data": [
        {
            "id": 3,
            "delta": -3,
            "balance_after": 22,
            "reason": "adjustment",
            "reason_label": "Manual adjustment",
            "note": "Damaged in store",
            "order": null,
            "user": "Hayley DuBuque",
            "created_at": "2026-11-03T06:56:18+00:00"
        },
        {
            "id": 1,
            "delta": 25,
            "balance_after": 25,
            "reason": "initial",
            "reason_label": "Initial stock",
            "note": null,
            "order": null,
            "user": null,
            "created_at": "2026-11-03T06:56:18+00:00"
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 1,
        "total": 2
    }
},
  "Low stock": {
    "data": [
        {
            "variant_id": 2,
            "product_id": 1,
            "product_name": "Wireless Earbuds",
            "variant_name": "White",
            "sku": "EAR-001-WHT",
            "stock_quantity": 8,
            "low_stock_threshold": 10
        }
    ]
},
  "SKU lookup (found)": {
    "variant": {
        "id": 1,
        "product_id": 1,
        "sku": "EAR-001",
        "name": null,
        "attributes": null,
        "price": "1450.00",
        "compare_at_price": "1800.00",
        "stock_quantity": 22,
        "low_stock_threshold": null,
        "weight_grams": 500,
        "is_default": true,
        "images": [
            {
                "id": 2,
                "thumb": "/storage/store-1/2/conversions/black-thumb.webp",
                "card": "/storage/store-1/2/conversions/black-card.webp",
                "zoom": "/storage/store-1/2/conversions/black-zoom.webp",
                "position": 1
            }
        ]
    },
    "product": {
        "id": 1,
        "name": "Wireless Earbuds",
        "status": "active"
    }
},
  "SKU lookup (not found)": {
    "message": "No variant with that SKU.",
    "code": "sku_not_found"
},
  "Start CSV import": {
    "data": {
        "id": 1,
        "original_filename": "products.csv",
        "status": "pending",
        "total_rows": null,
        "processed_rows": null,
        "imported_count": null,
        "failed_count": null,
        "errors": [],
        "started_at": null,
        "finished_at": null,
        "created_at": "2026-11-03T06:56:18+00:00"
    }
},
  "Poll CSV import (with row errors)": {
    "data": {
        "id": 1,
        "original_filename": "products.csv",
        "status": "completed_with_errors",
        "total_rows": 3,
        "processed_rows": 3,
        "imported_count": 1,
        "failed_count": 2,
        "errors": [
            {
                "row": 4,
                "sku": "",
                "message": "The sku field is required."
            },
            {
                "row": 5,
                "sku": "BAD-003",
                "message": "The price field must be a number."
            }
        ],
        "started_at": "2026-11-03T06:56:18+00:00",
        "finished_at": "2026-11-03T06:56:18+00:00",
        "created_at": "2026-11-03T06:56:18+00:00"
    }
},
  "List CSV imports": {
    "data": [
        {
            "id": 1,
            "original_filename": "products.csv",
            "status": "completed_with_errors",
            "total_rows": 3,
            "processed_rows": 3,
            "imported_count": 1,
            "failed_count": 2,
            "errors": null,
            "started_at": "2026-11-03T06:56:18+00:00",
            "finished_at": "2026-11-03T06:56:18+00:00",
            "created_at": "2026-11-03T06:56:18+00:00"
        }
    ]
},
  "AI describe": {
    "description": "<p>Crisp sound, all-day battery and a pocket-sized charging case.</p>"
},
};
