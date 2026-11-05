// Parsed from docs/samples-storefront.md (fake data). Do not edit by hand.
export const storefrontSamples: Record<string, unknown> = {
  "Create banner": {
    "data": {
        "id": 1,
        "title": "Eid sale",
        "link_url": "https://example.com/sale",
        "position": 1,
        "is_active": true,
        "image": "/storage/store-1/1/conversions/a-display.webp"
    }
},
  "Create banner (image only)": {
    "data": {
        "id": 2,
        "title": null,
        "link_url": null,
        "position": 2,
        "is_active": true,
        "image": "/storage/store-1/2/conversions/b-display.webp"
    }
},
  "Create banner, validation errors": {
    "message": "The image field is required. (and 1 more error)",
    "errors": {
        "image": [
            "The image field is required."
        ],
        "link_url": [
            "Enter a path starting with / or a full http(s):// address."
        ]
    }
},
  "List banners": {
    "data": [
        {
            "id": 1,
            "title": "Eid sale",
            "link_url": "https://example.com/sale",
            "position": 1,
            "is_active": true,
            "image": "/storage/store-1/1/conversions/a-display.webp"
        },
        {
            "id": 2,
            "title": null,
            "link_url": null,
            "position": 2,
            "is_active": true,
            "image": "/storage/store-1/2/conversions/b-display.webp"
        }
    ]
},
  "Update banner (hide it)": {
    "data": {
        "id": 1,
        "title": "Eid sale — extended",
        "link_url": "https://example.com/sale",
        "position": 1,
        "is_active": false,
        "image": "/storage/store-1/1/conversions/a-display.webp"
    }
},
  "Reorder banners": {
    "message": "Order saved."
},
  "List banners after reorder": {
    "data": [
        {
            "id": 2,
            "title": null,
            "link_url": null,
            "position": 0,
            "is_active": true,
            "image": "/storage/store-1/2/conversions/b-display.webp"
        },
        {
            "id": 1,
            "title": "Eid sale — extended",
            "link_url": "https://example.com/sale",
            "position": 1,
            "is_active": false,
            "image": "/storage/store-1/1/conversions/a-display.webp"
        }
    ]
},
  "Create home section (manual)": {
    "data": {
        "id": 1,
        "title": "Our picks",
        "title_bn": "আমাদের পছন্দ",
        "subtitle": null,
        "source": "manual",
        "source_label": "Products I pick",
        "category": null,
        "product_limit": 8,
        "is_active": true,
        "position": 1,
        "picks_count": 0
    }
},
  "Create home section (category)": {
    "data": {
        "id": 2,
        "title": "Electronics",
        "title_bn": null,
        "subtitle": null,
        "source": "category",
        "source_label": "A category",
        "category": {
            "id": 1,
            "name": "Electronics"
        },
        "product_limit": 4,
        "is_active": true,
        "position": 2,
        "picks_count": 0
    }
},
  "Create home section, validation errors": {
    "message": "The product limit field must be between 4 and 12.",
    "errors": {
        "product_limit": [
            "The product limit field must be between 4 and 12."
        ]
    }
},
  "Add pick": {
    "data": {
        "id": 1,
        "title": "Our picks",
        "title_bn": "আমাদের পছন্দ",
        "subtitle": null,
        "source": "manual",
        "source_label": "Products I pick",
        "category": null,
        "product_limit": 8,
        "is_active": true,
        "position": 1,
        "picks_count": 1,
        "picks": [
            {
                "id": 1,
                "position": 1,
                "product": {
                    "id": 1,
                    "name": "Wireless Earbuds",
                    "slug": "cum-maiores-voluptatem",
                    "status": "active",
                    "is_featured": false,
                    "track_inventory": true,
                    "brand": null,
                    "thumb": null,
                    "default_variant": {
                        "id": 1,
                        "sku": "SKU-5699LV",
                        "price": "3182.56",
                        "compare_at_price": null,
                        "stock_quantity": 6
                    },
                    "created_at": "2026-11-05T09:11:58+00:00"
                }
            }
        ]
    }
},
  "Add pick #2": {
    "data": {
        "id": 1,
        "title": "Our picks",
        "title_bn": "আমাদের পছন্দ",
        "subtitle": null,
        "source": "manual",
        "source_label": "Products I pick",
        "category": null,
        "product_limit": 8,
        "is_active": true,
        "position": 1,
        "picks_count": 2,
        "picks": [
            {
                "id": 1,
                "position": 1,
                "product": {
                    "id": 1,
                    "name": "Wireless Earbuds",
                    "slug": "cum-maiores-voluptatem",
                    "status": "active",
                    "is_featured": false,
                    "track_inventory": true,
                    "brand": null,
                    "thumb": null,
                    "default_variant": {
                        "id": 1,
                        "sku": "SKU-5699LV",
                        "price": "3182.56",
                        "compare_at_price": null,
                        "stock_quantity": 6
                    },
                    "created_at": "2026-11-05T09:11:58+00:00"
                }
            },
            {
                "id": 2,
                "position": 2,
                "product": {
                    "id": 2,
                    "name": "Smart Watch",
                    "slug": "aperiam-repellat-quis",
                    "status": "active",
                    "is_featured": false,
                    "track_inventory": true,
                    "brand": null,
                    "thumb": null,
                    "default_variant": {
                        "id": 2,
                        "sku": "SKU-4345DN",
                        "price": "3570.57",
                        "compare_at_price": null,
                        "stock_quantity": 31
                    },
                    "created_at": "2026-11-05T09:11:58+00:00"
                }
            }
        ]
    }
},
  "List home sections (with limits)": {
    "data": [
        {
            "id": 1,
            "title": "Our picks",
            "title_bn": "আমাদের পছন্দ",
            "subtitle": null,
            "source": "manual",
            "source_label": "Products I pick",
            "category": null,
            "product_limit": 8,
            "is_active": true,
            "position": 1,
            "picks_count": 2
        },
        {
            "id": 2,
            "title": "Electronics",
            "title_bn": null,
            "subtitle": null,
            "source": "category",
            "source_label": "A category",
            "category": {
                "id": 1,
                "name": "Electronics"
            },
            "product_limit": 4,
            "is_active": true,
            "position": 2,
            "picks_count": 0
        }
    ],
    "limits": {
        "max_visible": 6,
        "max_picks": 24
    },
    "sources": [
        {
            "key": "manual",
            "label": "Products I pick"
        },
        {
            "key": "featured",
            "label": "Products marked \"Featured\""
        },
        {
            "key": "category",
            "label": "A category"
        },
        {
            "key": "newest",
            "label": "Newest products"
        },
        {
            "key": "best_sellers",
            "label": "Best sellers (from real sales)"
        },
        {
            "key": "on_sale",
            "label": "Products on sale"
        }
    ],
    "featured_products_count": 0
},
  "One home section with picks": {
    "data": {
        "id": 1,
        "title": "Our picks",
        "title_bn": "আমাদের পছন্দ",
        "subtitle": null,
        "source": "manual",
        "source_label": "Products I pick",
        "category": null,
        "product_limit": 8,
        "is_active": true,
        "position": 1,
        "picks_count": 2,
        "picks": [
            {
                "id": 1,
                "position": 1,
                "product": {
                    "id": 1,
                    "name": "Wireless Earbuds",
                    "slug": "cum-maiores-voluptatem",
                    "status": "active",
                    "is_featured": false,
                    "track_inventory": true,
                    "brand": null,
                    "thumb": null,
                    "default_variant": {
                        "id": 1,
                        "sku": "SKU-5699LV",
                        "price": "3182.56",
                        "compare_at_price": null,
                        "stock_quantity": 6
                    },
                    "created_at": "2026-11-05T09:11:58+00:00"
                }
            },
            {
                "id": 2,
                "position": 2,
                "product": {
                    "id": 2,
                    "name": "Smart Watch",
                    "slug": "aperiam-repellat-quis",
                    "status": "active",
                    "is_featured": false,
                    "track_inventory": true,
                    "brand": null,
                    "thumb": null,
                    "default_variant": {
                        "id": 2,
                        "sku": "SKU-4345DN",
                        "price": "3570.57",
                        "compare_at_price": null,
                        "stock_quantity": 31
                    },
                    "created_at": "2026-11-05T09:11:58+00:00"
                }
            }
        ]
    }
},
  "Home section preview": {
    "data": [
        {
            "id": 1,
            "name": "Wireless Earbuds",
            "slug": "cum-maiores-voluptatem",
            "status": "active",
            "is_featured": false,
            "track_inventory": true,
            "brand": null,
            "thumb": null,
            "default_variant": {
                "id": 1,
                "sku": "SKU-5699LV",
                "price": "3182.56",
                "compare_at_price": null,
                "stock_quantity": 6
            },
            "created_at": "2026-11-05T09:11:58+00:00"
        },
        {
            "id": 2,
            "name": "Smart Watch",
            "slug": "aperiam-repellat-quis",
            "status": "active",
            "is_featured": false,
            "track_inventory": true,
            "brand": null,
            "thumb": null,
            "default_variant": {
                "id": 2,
                "sku": "SKU-4345DN",
                "price": "3570.57",
                "compare_at_price": null,
                "stock_quantity": 31
            },
            "created_at": "2026-11-05T09:11:58+00:00"
        }
    ]
},
  "Theme catalogue": {
    "data": [
        {
            "slug": "electronics",
            "label": "Electronics / Gadget",
            "blurb": "Dark navbar, bold color-blocked tiles",
            "family": "electronics",
            "is_current": false,
            "is_category_default": false,
            "preview": {
                "header": "#0b0f1a",
                "headerText": "#ffffff",
                "accent": "#2f5bea",
                "tiles": [
                    "#2f5bea",
                    "#ea580c",
                    "#7c3aed"
                ]
            }
        },
        {
            "slug": "gear",
            "label": "Gear",
            "blurb": "Charcoal chrome, yellow buttons, orange highlights",
            "family": "electronics",
            "is_current": false,
            "is_category_default": false,
            "preview": {
                "header": "#292d32",
                "headerText": "#ffffff",
                "accent": "#ffca0d",
                "tiles": [
                    "#f26e21",
                    "#292d32",
                    "#ffca0d"
                ]
            }
        },
        {
            "slug": "techmart",
            "label": "Tech Mart",
            "blurb": "Bright white shop, orange accents, boxed product cards",
            "family": "electronics",
            "is_current": false,
            "is_category_default": false,
            "preview": {
                "header": "#ffffff",
                "headerText": "#111827",
                "accent": "#f27f20",
                "tiles": [
                    "#fff1e4",
                    "#f3f4f6",
                    "#ffe4cc"
                ]
            }
        },
        {
            "slug": "beauty-fashion",
            "label": "Beauty / Fashion",
            "blurb": "Soft palette, editorial serif accent",
            "family": "beauty-fashion",
            "is_current": false,
            "is_category_default": false,
            "preview": {
                "header": "#fbf6f3",
                "headerText": "#3d2c2a",
                "accent": "#a85c68",
                "tiles": [
                    "#f1ddd8",
                    "#ecdfd4",
                    "#e7dde2"
                ]
            }
        },
        {
            "slug": "glow",
            "label": "Glow",
            "blurb": "Night header, magenta and coral, skincare-store feel",
            "family": "beauty-fashion",
            "is_current": false,
            "is_category_default": false,
            "preview": {
                "header": "#1f1619",
                "headerText": "#ffffff",
                "accent": "#c73063",
                "tiles": [
                    "#fbe1eb",
                    "#fee4dc",
                    "#f1e6f4"
                ]
            }
        },
        {
            "slug": "wellness",
            "label": "Wellness / Food / Organic",
            "blurb": "Earthy tones, ingredient storytelling",
            "family": "wellness",
            "is_current": true,
            "is_category_default": true,
            "preview": {
                "header": "#f8f7f0",
                "headerText": "#2c3722",
                "accent": "#4e6b3a",
                "tiles": [
                    "#e4e9d6",
                    "#ece4d3",
                    "#e2e5dd"
                ]
            }
        },
        {
            "slug": "bazaar",
            "label": "Bazaar",
            "blurb": "Warm grocery look, maroon menu strip, orange buttons",
            "family": "wellness",
            "is_current": false,
            "is_category_default": false,
            "preview": {
                "header": "#ffffff",
                "headerText": "#2b1a14",
                "accent": "#c2410c",
                "tiles": [
                    "#6d1a17",
                    "#fde9d6",
                    "#e3eed9"
                ]
            }
        },
        {
            "slug": "general",
            "label": "General / Multipurpose",
            "blurb": "Safe default for everything else",
            "family": "general",
            "is_current": false,
            "is_category_default": false,
            "preview": {
                "header": "#ffffff",
                "headerText": "#17171b",
                "accent": "#0f766e",
                "tiles": [
                    "#0f766e",
                    "#334155",
                    "#b45309"
                ]
            }
        }
    ]
},
  "Appearance (current)": {
    "data": {
        "theme": null,
        "effective_theme": "wellness",
        "theme_accent_color": null,
        "show_category_tiles": true,
        "show_theme_highlight_section": true,
        "logo_url": null
    }
},
  "Update appearance": {
    "data": {
        "theme": "gear",
        "effective_theme": "gear",
        "theme_accent_color": "#FF8800",
        "show_category_tiles": false,
        "show_theme_highlight_section": true,
        "logo_url": null
    }
},
  "Update appearance, validation errors": {
    "message": "The selected theme is invalid. (and 1 more error)",
    "errors": {
        "theme": [
            "The selected theme is invalid."
        ],
        "theme_accent_color": [
            "The theme accent color field format is invalid."
        ]
    }
},
  "Upload logo": {
    "data": {
        "theme": "gear",
        "effective_theme": "gear",
        "theme_accent_color": "#FF8800",
        "show_category_tiles": false,
        "show_theme_highlight_section": true,
        "logo_url": "/storage/store-/3/conversions/logo-display.webp"
    }
},
  "Upload logo, validation error": {
    "message": "The logo field must be a file of type: jpeg, png, webp, svg.",
    "errors": {
        "logo": [
            "The logo field must be a file of type: jpeg, png, webp, svg."
        ]
    }
},
  "Dashboard, 7-day range": {
    "data": {
        "period": {
            "range": 7,
            "from": "2026-10-29T09:11:58+00:00",
            "to": "2026-11-05T09:11:58+00:00"
        },
        "revenue": "1950.00",
        "revenue_delta_percent": null,
        "orders_count": 3,
        "orders_delta_percent": null,
        "average_order_value": "650.00",
        "conversion_rate": 0.5,
        "funnel": {
            "product_view": 6,
            "form_engaged": 0,
            "add_to_cart": 0,
            "checkout_start": 0,
            "checkout_complete": 3
        },
        "funnel_rates": {
            "form_engaged": 0,
            "add_to_cart": 0,
            "checkout_start": null,
            "checkout_completion": null
        },
        "orders_by_status": {
            "pending": 1,
            "confirmed": 0,
            "shipped": 0,
            "delivered": 1,
            "cancelled": 1
        },
        "daily": [
            {
                "date": "2026-11-02",
                "orders": 1,
                "revenue": "0.00"
            },
            {
                "date": "2026-11-03",
                "orders": 1,
                "revenue": "1350.00"
            },
            {
                "date": "2026-11-04",
                "orders": 1,
                "revenue": "600.00"
            }
        ],
        "top_products": [
            {
                "product_id": 3,
                "name": "Earbuds",
                "units": 3,
                "revenue": "1350.00"
            }
        ],
        "recent_orders": [
            {
                "id": 4,
                "order_number": "ORD-000004",
                "status": "delivered",
                "payment_method": "cod",
                "payment_status": "unpaid",
                "customer_name": "Prof. Elijah Koepp IV",
                "customer_phone": "01533899341",
                "total": "500.00",
                "created_at": "2026-09-26T09:11:58+00:00"
            },
            {
                "id": 3,
                "order_number": "ORD-000003",
                "status": "cancelled",
                "payment_method": "cod",
                "payment_status": "unpaid",
                "customer_name": "Charity Lockman I",
                "customer_phone": "01389148375",
                "total": "400.00",
                "created_at": "2026-11-02T09:11:58+00:00"
            },
            {
                "id": 2,
                "order_number": "ORD-000002",
                "status": "pending",
                "payment_method": "cod",
                "payment_status": "unpaid",
                "customer_name": "Opal Streich",
                "customer_phone": "01819611052",
                "total": "600.00",
                "created_at": "2026-11-04T09:11:58+00:00"
            },
            {
                "id": 1,
                "order_number": "ORD-000001",
                "status": "delivered",
                "payment_method": "cod",
                "payment_status": "unpaid",
                "customer_name": "Noel Runolfsson",
                "customer_phone": "01925054462",
                "total": "1350.00",
                "created_at": "2026-11-03T09:11:58+00:00"
            }
        ],
        "pending_payments": 0,
        "low_stock": [],
        "checklist": [
            {
                "key": "add_product",
                "done": true
            },
            {
                "key": "payment_method",
                "done": false
            },
            {
                "key": "whatsapp",
                "done": false
            },
            {
                "key": "logo",
                "done": true
            }
        ]
    }
},
  "Dashboard, custom range": {
    "data": {
        "period": {
            "range": null,
            "from": "2026-09-21T00:00:00+00:00",
            "to": "2026-10-01T23:59:59+00:00"
        },
        "revenue": "500.00",
        "revenue_delta_percent": null,
        "orders_count": 1,
        "orders_delta_percent": null,
        "average_order_value": "500.00",
        "conversion_rate": null,
        "funnel": {
            "product_view": 0,
            "form_engaged": 0,
            "add_to_cart": 0,
            "checkout_start": 0,
            "checkout_complete": 1
        },
        "funnel_rates": {
            "form_engaged": null,
            "add_to_cart": null,
            "checkout_start": null,
            "checkout_completion": null
        },
        "orders_by_status": {
            "pending": 0,
            "confirmed": 0,
            "shipped": 0,
            "delivered": 1,
            "cancelled": 0
        },
        "daily": [
            {
                "date": "2026-09-26",
                "orders": 1,
                "revenue": "500.00"
            }
        ],
        "top_products": [],
        "recent_orders": [
            {
                "id": 4,
                "order_number": "ORD-000004",
                "status": "delivered",
                "payment_method": "cod",
                "payment_status": "unpaid",
                "customer_name": "Prof. Elijah Koepp IV",
                "customer_phone": "01533899341",
                "total": "500.00",
                "created_at": "2026-09-26T09:11:58+00:00"
            },
            {
                "id": 3,
                "order_number": "ORD-000003",
                "status": "cancelled",
                "payment_method": "cod",
                "payment_status": "unpaid",
                "customer_name": "Charity Lockman I",
                "customer_phone": "01389148375",
                "total": "400.00",
                "created_at": "2026-11-02T09:11:58+00:00"
            },
            {
                "id": 2,
                "order_number": "ORD-000002",
                "status": "pending",
                "payment_method": "cod",
                "payment_status": "unpaid",
                "customer_name": "Opal Streich",
                "customer_phone": "01819611052",
                "total": "600.00",
                "created_at": "2026-11-04T09:11:58+00:00"
            },
            {
                "id": 1,
                "order_number": "ORD-000001",
                "status": "delivered",
                "payment_method": "cod",
                "payment_status": "unpaid",
                "customer_name": "Noel Runolfsson",
                "customer_phone": "01925054462",
                "total": "1350.00",
                "created_at": "2026-11-03T09:11:58+00:00"
            }
        ],
        "pending_payments": 0,
        "low_stock": [],
        "checklist": [
            {
                "key": "add_product",
                "done": true
            },
            {
                "key": "payment_method",
                "done": false
            },
            {
                "key": "whatsapp",
                "done": false
            },
            {
                "key": "logo",
                "done": true
            }
        ]
    }
},
  "Dashboard, invalid range": {
    "message": "The selected range is invalid.",
    "errors": {
        "range": [
            "The selected range is invalid."
        ]
    }
},
};
