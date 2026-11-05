// Parsed from docs/samples-settings.md (fake data). Do not edit by hand.
export const settingsSamples: Record<string, unknown> = {
  "General settings": {
    "data": {
        "name": "Mosciski-Rosenbaum",
        "subdomain": "mystore",
        "category": "general",
        "whatsapp_number": null,
        "reviews_enabled": false,
        "show_platform_credit": true
    }
},
  "Update general settings": {
    "data": {
        "name": "Mosciski-Rosenbaum",
        "subdomain": "mystore",
        "category": "general",
        "whatsapp_number": "01712345678",
        "reviews_enabled": true,
        "show_platform_credit": true
    }
},
  "General settings, validation error": {
    "message": "The whatsapp number field format is invalid.",
    "errors": {
        "whatsapp_number": [
            "The whatsapp number field format is invalid."
        ]
    }
},
  "Payments (nothing configured)": {
    "data": {
        "sslcommerz_store_id": null,
        "sslcommerz_store_password_set": false,
        "sslcommerz_configured": false,
        "bkash_number": null,
        "nagad_number": null,
        "available_payment_methods": [
            "cod"
        ]
    }
},
  "Update payments": {
    "data": {
        "sslcommerz_store_id": "shop001",
        "sslcommerz_store_password_set": true,
        "sslcommerz_configured": true,
        "bkash_number": "01711111111",
        "nagad_number": "01822222222",
        "available_payment_methods": [
            "cod",
            "sslcommerz",
            "manual_bkash",
            "manual_nagad"
        ]
    }
},
  "Clear a payment secret": {
    "data": {
        "sslcommerz_store_id": "shop001",
        "sslcommerz_store_password_set": false,
        "sslcommerz_configured": false,
        "bkash_number": "01711111111",
        "nagad_number": "01822222222",
        "available_payment_methods": [
            "cod",
            "manual_bkash",
            "manual_nagad"
        ]
    }
},
  "Payments, invalid clear": {
    "message": "The selected clear.0 is invalid.",
    "errors": {
        "clear.0": [
            "The selected clear.0 is invalid."
        ]
    }
},
  "Couriers (Growth: all three allowed)": {
    "data": [
        {
            "driver": "steadfast",
            "label": "Steadfast",
            "plan_allows": true,
            "configured": false,
            "fields": {
                "steadfast_api_key": null
            },
            "secrets_set": {
                "steadfast_secret_key": false
            }
        },
        {
            "driver": "pathao",
            "label": "Pathao",
            "plan_allows": true,
            "configured": false,
            "fields": {
                "pathao_client_id": null,
                "pathao_username": null,
                "pathao_store_id": null,
                "pathao_city_id": null,
                "pathao_zone_id": null,
                "pathao_area_id": null
            },
            "secrets_set": {
                "pathao_client_secret": false,
                "pathao_password": false
            }
        },
        {
            "driver": "redx",
            "label": "RedX",
            "plan_allows": true,
            "configured": false,
            "fields": {
                "redx_pickup_store_id": null,
                "redx_default_area_id": null,
                "redx_default_area_name": null
            },
            "secrets_set": {
                "redx_access_token": false
            }
        }
    ]
},
  "Update couriers": {
    "data": [
        {
            "driver": "steadfast",
            "label": "Steadfast",
            "plan_allows": true,
            "configured": true,
            "fields": {
                "steadfast_api_key": "sf-key-123"
            },
            "secrets_set": {
                "steadfast_secret_key": true
            }
        },
        {
            "driver": "pathao",
            "label": "Pathao",
            "plan_allows": true,
            "configured": false,
            "fields": {
                "pathao_client_id": "cid-789",
                "pathao_username": null,
                "pathao_store_id": null,
                "pathao_city_id": null,
                "pathao_zone_id": null,
                "pathao_area_id": null
            },
            "secrets_set": {
                "pathao_client_secret": false,
                "pathao_password": false
            }
        },
        {
            "driver": "redx",
            "label": "RedX",
            "plan_allows": true,
            "configured": false,
            "fields": {
                "redx_pickup_store_id": null,
                "redx_default_area_id": null,
                "redx_default_area_name": null
            },
            "secrets_set": {
                "redx_access_token": false
            }
        }
    ]
},
  "Couriers on Starter (Pathao/RedX shown but not allowed)": {
    "data": [
        {
            "driver": "steadfast",
            "label": "Steadfast",
            "plan_allows": true,
            "configured": false,
            "fields": {
                "steadfast_api_key": null
            },
            "secrets_set": {
                "steadfast_secret_key": false
            }
        },
        {
            "driver": "pathao",
            "label": "Pathao",
            "plan_allows": false,
            "configured": false,
            "fields": {
                "pathao_client_id": null,
                "pathao_username": null,
                "pathao_store_id": null,
                "pathao_city_id": null,
                "pathao_zone_id": null,
                "pathao_area_id": null
            },
            "secrets_set": {
                "pathao_client_secret": false,
                "pathao_password": false
            }
        },
        {
            "driver": "redx",
            "label": "RedX",
            "plan_allows": false,
            "configured": false,
            "fields": {
                "redx_pickup_store_id": null,
                "redx_default_area_id": null,
                "redx_default_area_name": null
            },
            "secrets_set": {
                "redx_access_token": false
            }
        }
    ]
},
  "PLAN LIMIT: Pathao fields on Starter": {
    "message": "Pathao is not part of your plan. Upgrade to use it.",
    "code": "driver_not_in_plan",
    "driver": "pathao"
},
  "AI settings": {
    "data": {
        "ai_provider": null,
        "ai_api_key_set": false,
        "configured": false
    }
},
  "Update AI key": {
    "data": {
        "ai_provider": "anthropic",
        "ai_api_key_set": true,
        "configured": true
    }
},
  "AI, invalid provider": {
    "message": "The selected ai provider is invalid.",
    "errors": {
        "ai_provider": [
            "The selected ai provider is invalid."
        ]
    }
},
  "Marketing settings": {
    "data": {
        "facebook_pixel_id": null,
        "facebook_conversions_api_configured": false,
        "ga4_measurement_id": null,
        "gtm_container_id": null,
        "tiktok_pixel_id": null,
        "meta_title": null,
        "meta_description": null,
        "google_site_verification": null
    }
},
  "Update marketing": {
    "data": {
        "facebook_pixel_id": "123456789",
        "facebook_conversions_api_configured": true,
        "ga4_measurement_id": "G-ABC123",
        "gtm_container_id": null,
        "tiktok_pixel_id": null,
        "meta_title": "My Shop",
        "meta_description": null,
        "google_site_verification": "abc_DEF-123"
    }
},
  "Marketing, validation error": {
    "message": "The google site verification field format is invalid.",
    "errors": {
        "google_site_verification": [
            "The google site verification field format is invalid."
        ]
    }
},
  "Domains (empty)": {
    "custom_domain_enabled": true,
    "addon_price_yearly": 500,
    "addon_expires_at": null,
    "data": []
},
  "Add a subdomain-style domain (DNS fields)": {
    "data": {
        "id": 1,
        "domain": "shop.example.com",
        "status": "pending_verification",
        "verified_at": null,
        "is_primary": false,
        "ssl_status": null,
        "dns": {
            "zone": "example.com",
            "verification": {
                "type": "TXT",
                "host": "_bypari-verify.shop",
                "full_name": "_bypari-verify.shop.example.com",
                "value": "MFjphjZ7kvUruictgemgRwMk7z9t7aXC"
            },
            "routing": {
                "type": "CNAME",
                "host": "shop",
                "value": "mystore.bypari.localhost",
                "value_hint": null
            },
            "notes": [
                "Type each Host exactly as shown — your provider adds example.com itself.",
                "On Cloudflare, set the record to DNS only (grey cloud)."
            ]
        }
    }
},
  "Add a root domain (A record routing)": {
    "data": {
        "id": 2,
        "domain": "example.org",
        "status": "pending_verification",
        "verified_at": null,
        "is_primary": false,
        "ssl_status": null,
        "dns": {
            "zone": "example.org",
            "verification": {
                "type": "TXT",
                "host": "_bypari-verify",
                "full_name": "_bypari-verify.example.org",
                "value": "ozQa0RoEd0eTtAYYFmnbIC6jLyEPZeRg"
            },
            "routing": {
                "type": "A",
                "host": "@",
                "value": "203.0.113.7",
                "value_hint": null
            },
            "notes": [
                "Type each Host exactly as shown — your provider adds example.org itself.",
                "On Cloudflare, set the record to DNS only (grey cloud)."
            ]
        }
    }
},
  "Add domain, validation errors": {
    "message": "The domain field format is invalid.",
    "errors": {
        "domain": [
            "The domain field format is invalid."
        ]
    }
},
  "Add domain, already taken": {
    "message": "The domain has already been taken.",
    "errors": {
        "domain": [
            "The domain has already been taken."
        ]
    }
},
  "List domains": {
    "custom_domain_enabled": true,
    "addon_price_yearly": 500,
    "addon_expires_at": null,
    "data": [
        {
            "id": 1,
            "domain": "shop.example.com",
            "status": "pending_verification",
            "verified_at": null,
            "is_primary": false,
            "ssl_status": "pending",
            "dns": {
                "zone": "example.com",
                "verification": {
                    "type": "TXT",
                    "host": "_bypari-verify.shop",
                    "full_name": "_bypari-verify.shop.example.com",
                    "value": "MFjphjZ7kvUruictgemgRwMk7z9t7aXC"
                },
                "routing": {
                    "type": "CNAME",
                    "host": "shop",
                    "value": "mystore.bypari.localhost",
                    "value_hint": null
                },
                "notes": [
                    "Type each Host exactly as shown — your provider adds example.com itself.",
                    "On Cloudflare, set the record to DNS only (grey cloud)."
                ]
            }
        },
        {
            "id": 2,
            "domain": "example.org",
            "status": "pending_verification",
            "verified_at": null,
            "is_primary": false,
            "ssl_status": "pending",
            "dns": {
                "zone": "example.org",
                "verification": {
                    "type": "TXT",
                    "host": "_bypari-verify",
                    "full_name": "_bypari-verify.example.org",
                    "value": "ozQa0RoEd0eTtAYYFmnbIC6jLyEPZeRg"
                },
                "routing": {
                    "type": "A",
                    "host": "@",
                    "value": "203.0.113.7",
                    "value_hint": null
                },
                "notes": [
                    "Type each Host exactly as shown — your provider adds example.org itself.",
                    "On Cloudflare, set the record to DNS only (grey cloud)."
                ]
            }
        }
    ]
},
  "Verify, nothing in DNS yet": {
    "verified": false,
    "message": "Couldn't find the TXT record yet — DNS changes can take a while to propagate. Try again in a few minutes.",
    "misplaced_record": null,
    "data": {
        "id": 1,
        "domain": "shop.example.com",
        "status": "pending_verification",
        "verified_at": null,
        "is_primary": false,
        "ssl_status": "pending",
        "dns": {
            "zone": "example.com",
            "verification": {
                "type": "TXT",
                "host": "_bypari-verify.shop",
                "full_name": "_bypari-verify.shop.example.com",
                "value": "MFjphjZ7kvUruictgemgRwMk7z9t7aXC"
            },
            "routing": {
                "type": "CNAME",
                "host": "shop",
                "value": "mystore.bypari.localhost",
                "value_hint": null
            },
            "notes": [
                "Type each Host exactly as shown — your provider adds example.com itself.",
                "On Cloudflare, set the record to DNS only (grey cloud)."
            ]
        }
    }
},
  "Verify, record typed with the zone doubled": {
    "verified": false,
    "message": "Your TXT record was created as \"_bypari-verify.shop.example.com.example.com\" — your DNS provider added \"example.com\" to the end of what you typed. Edit the record so the Host field says only \"_bypari-verify.shop\", then verify again.",
    "misplaced_record": "_bypari-verify.shop.example.com.example.com",
    "data": {
        "id": 1,
        "domain": "shop.example.com",
        "status": "pending_verification",
        "verified_at": null,
        "is_primary": false,
        "ssl_status": "pending",
        "dns": {
            "zone": "example.com",
            "verification": {
                "type": "TXT",
                "host": "_bypari-verify.shop",
                "full_name": "_bypari-verify.shop.example.com",
                "value": "MFjphjZ7kvUruictgemgRwMk7z9t7aXC"
            },
            "routing": {
                "type": "CNAME",
                "host": "shop",
                "value": "mystore.bypari.localhost",
                "value_hint": null
            },
            "notes": [
                "Type each Host exactly as shown — your provider adds example.com itself.",
                "On Cloudflare, set the record to DNS only (grey cloud)."
            ]
        }
    }
},
  "Make primary, not yet verified": {
    "message": "Only a verified domain can be made primary.",
    "code": "not_verified"
},
  "Verify, success": {
    "verified": true,
    "message": "Domain verified. It will start serving over HTTPS automatically once its DNS points to your store.",
    "data": {
        "id": 1,
        "domain": "shop.example.com",
        "status": "verified",
        "verified_at": "2026-11-05T09:56:10+00:00",
        "is_primary": false,
        "ssl_status": "pending",
        "dns": {
            "zone": "example.com",
            "verification": {
                "type": "TXT",
                "host": "_bypari-verify.shop",
                "full_name": "_bypari-verify.shop.example.com",
                "value": "MFjphjZ7kvUruictgemgRwMk7z9t7aXC"
            },
            "routing": {
                "type": "CNAME",
                "host": "shop",
                "value": "mystore.bypari.localhost",
                "value_hint": null
            },
            "notes": [
                "Type each Host exactly as shown — your provider adds example.com itself.",
                "On Cloudflare, set the record to DNS only (grey cloud)."
            ]
        }
    }
},
  "Make primary": {
    "data": {
        "id": 1,
        "domain": "shop.example.com",
        "status": "verified",
        "verified_at": "2026-11-05T09:56:10+00:00",
        "is_primary": true,
        "ssl_status": "pending",
        "dns": {
            "zone": "example.com",
            "verification": {
                "type": "TXT",
                "host": "_bypari-verify.shop",
                "full_name": "_bypari-verify.shop.example.com",
                "value": "MFjphjZ7kvUruictgemgRwMk7z9t7aXC"
            },
            "routing": {
                "type": "CNAME",
                "host": "shop",
                "value": "mystore.bypari.localhost",
                "value_hint": null
            },
            "notes": [
                "Type each Host exactly as shown — your provider adds example.com itself.",
                "On Cloudflare, set the record to DNS only (grey cloud)."
            ]
        }
    }
},
  "PLAN LIMIT: add a domain on Starter": {
    "message": "Custom domains need the Growth plan or higher, or the ৳500/year custom domain add-on on Starter. Contact us to enable it.",
    "code": "custom_domain_not_in_plan",
    "addon_price_yearly": 500
},
  "Domains on Starter (list)": {
    "custom_domain_enabled": false,
    "addon_price_yearly": 500,
    "addon_expires_at": null,
    "data": []
},
  "Staff list": {
    "max_staff_accounts": 3,
    "can_add_staff_account": true,
    "data": [
        {
            "id": 1,
            "name": "Dr. Sydni Lesch Jr.",
            "email": "dejah.hodkiewicz@example.net",
            "role": "owner",
            "created_at": "2026-11-05T09:56:10+00:00"
        },
        {
            "id": 3,
            "name": "Karim Staff",
            "email": "karim@example.com",
            "role": "staff",
            "created_at": "2026-11-05T09:56:10+00:00"
        }
    ]
},
  "Add staff": {
    "data": {
        "id": 4,
        "name": "Rina Das",
        "email": "rina@example.com",
        "role": "staff",
        "created_at": "2026-11-05T09:56:10+00:00"
    }
},
  "PLAN LIMIT: add staff past the cap": {
    "message": "You've reached your plan's staff account limit. Upgrade your plan to add more.",
    "code": "staff_limit_reached",
    "max_staff_accounts": 3
},
  "Add staff, validation errors": {
    "message": "The name field is required. (and 3 more errors)",
    "errors": {
        "name": [
            "The name field is required."
        ],
        "email": [
            "The email has already been taken."
        ],
        "password": [
            "The password field confirmation does not match.",
            "The password field must be at least 8 characters."
        ]
    }
},
  "Update staff (rename)": {
    "data": {
        "id": 4,
        "name": "Rina D.",
        "email": "rina@example.com",
        "role": "staff",
        "created_at": "2026-11-05T09:56:10+00:00"
    }
},
  "Last owner cannot be demoted": {
    "message": "This store must always have at least one owner."
},
  "Remove staff": {
    "message": "Staff account removed."
},
  "PLAN LIMIT: add staff on Starter (owner only)": {
    "message": "You've reached your plan's staff account limit. Upgrade your plan to add more.",
    "code": "staff_limit_reached",
    "max_staff_accounts": 1
},
  "Plan (Growth)": {
    "data": {
        "plan": {
            "key": "growth",
            "label": "Growth",
            "blurb": "Hiring help and adding courier options.",
            "price_yearly": 8400,
            "price_monthly_quote": 700,
            "staff_accounts": 3,
            "custom_domain_included": true,
            "courier_drivers": [
                "steadfast",
                "pathao",
                "redx"
            ],
            "status": "trial",
            "is_pending": false,
            "trial_ends_at": "2026-11-19T09:56:10+00:00"
        },
        "renewal": {
            "expires_at": "2026-12-15T09:56:10+00:00",
            "overdue": false,
            "days_left": 39
        },
        "usage": {
            "staff_accounts": {
                "used": 2,
                "max": 3
            },
            "courier_drivers": {
                "enabled": [
                    "steadfast",
                    "pathao",
                    "redx"
                ],
                "configured": [
                    "steadfast"
                ]
            },
            "products": "unlimited",
            "orders": "unlimited"
        },
        "custom_domain": {
            "enabled": true,
            "included_in_plan": true,
            "addon_price_yearly": 500,
            "addon_expires_at": null
        },
        "plans": [
            {
                "key": "starter",
                "label": "Starter",
                "blurb": "A one-person shop just getting started.",
                "price_yearly": 4200,
                "price_monthly_quote": 350,
                "staff_accounts": 1,
                "custom_domain_included": false,
                "courier_drivers": [
                    "steadfast"
                ],
                "is_current": false,
                "is_upgrade": false,
                "contact_whatsapp_url": "https://wa.me/8801700000000?text=Assalamu%20alaikum%2C%20I%20want%20to%20move%20Mosciski-Rosenbaum%20to%20the%20Starter%20plan."
            },
            {
                "key": "growth",
                "label": "Growth",
                "blurb": "Hiring help and adding courier options.",
                "price_yearly": 8400,
                "price_monthly_quote": 700,
                "staff_accounts": 3,
                "custom_domain_included": true,
                "courier_drivers": [
                    "steadfast",
                    "pathao",
                    "redx"
                ],
                "is_current": true,
                "is_upgrade": false,
                "contact_whatsapp_url": "https://wa.me/8801700000000?text=Assalamu%20alaikum%2C%20I%20want%20to%20move%20Mosciski-Rosenbaum%20to%20the%20Growth%20plan."
            },
            {
                "key": "business",
                "label": "Business",
                "blurb": "Running the shop as a full-time team.",
                "price_yearly": 16800,
                "price_monthly_quote": 1400,
                "staff_accounts": null,
                "custom_domain_included": true,
                "courier_drivers": [
                    "steadfast",
                    "pathao",
                    "redx"
                ],
                "is_current": false,
                "is_upgrade": true,
                "contact_whatsapp_url": "https://wa.me/8801700000000?text=Assalamu%20alaikum%2C%20I%20want%20to%20move%20Mosciski-Rosenbaum%20to%20the%20Business%20plan."
            }
        ],
        "renew_whatsapp_url": "https://wa.me/8801700000000?text=Assalamu%20alaikum%2C%20I%20want%20to%20renew%20the%20plan%20for%20Mosciski-Rosenbaum."
    }
},
  "Plan (Starter)": {
    "data": {
        "plan": {
            "key": "starter",
            "label": "Starter",
            "blurb": "A one-person shop just getting started.",
            "price_yearly": 4200,
            "price_monthly_quote": 350,
            "staff_accounts": 1,
            "custom_domain_included": false,
            "courier_drivers": [
                "steadfast"
            ],
            "status": "trial",
            "is_pending": false,
            "trial_ends_at": "2026-11-19T09:56:10+00:00"
        },
        "renewal": {
            "expires_at": null,
            "overdue": false,
            "days_left": null
        },
        "usage": {
            "staff_accounts": {
                "used": 1,
                "max": 1
            },
            "courier_drivers": {
                "enabled": [
                    "steadfast"
                ],
                "configured": []
            },
            "products": "unlimited",
            "orders": "unlimited"
        },
        "custom_domain": {
            "enabled": false,
            "included_in_plan": false,
            "addon_price_yearly": 500,
            "addon_expires_at": null
        },
        "plans": [
            {
                "key": "starter",
                "label": "Starter",
                "blurb": "A one-person shop just getting started.",
                "price_yearly": 4200,
                "price_monthly_quote": 350,
                "staff_accounts": 1,
                "custom_domain_included": false,
                "courier_drivers": [
                    "steadfast"
                ],
                "is_current": true,
                "is_upgrade": false,
                "contact_whatsapp_url": "https://wa.me/8801700000000?text=Assalamu%20alaikum%2C%20I%20want%20to%20move%20Zulauf%20Group%20to%20the%20Starter%20plan."
            },
            {
                "key": "growth",
                "label": "Growth",
                "blurb": "Hiring help and adding courier options.",
                "price_yearly": 8400,
                "price_monthly_quote": 700,
                "staff_accounts": 3,
                "custom_domain_included": true,
                "courier_drivers": [
                    "steadfast",
                    "pathao",
                    "redx"
                ],
                "is_current": false,
                "is_upgrade": true,
                "contact_whatsapp_url": "https://wa.me/8801700000000?text=Assalamu%20alaikum%2C%20I%20want%20to%20move%20Zulauf%20Group%20to%20the%20Growth%20plan."
            },
            {
                "key": "business",
                "label": "Business",
                "blurb": "Running the shop as a full-time team.",
                "price_yearly": 16800,
                "price_monthly_quote": 1400,
                "staff_accounts": null,
                "custom_domain_included": true,
                "courier_drivers": [
                    "steadfast",
                    "pathao",
                    "redx"
                ],
                "is_current": false,
                "is_upgrade": true,
                "contact_whatsapp_url": "https://wa.me/8801700000000?text=Assalamu%20alaikum%2C%20I%20want%20to%20move%20Zulauf%20Group%20to%20the%20Business%20plan."
            }
        ],
        "renew_whatsapp_url": "https://wa.me/8801700000000?text=Assalamu%20alaikum%2C%20I%20want%20to%20renew%20the%20plan%20for%20Zulauf%20Group."
    }
},
  "Owner-only: staff token gets 403": {
    "message": "User does not have the right roles."
},
};
