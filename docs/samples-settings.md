# Settings, account & plan API samples (Milestone F)

Generated from the real backend against fake data (a throwaway test, not committed), so field names, types and nesting match production. IDs, dates and tokens are test values. Main store is on the **Growth** plan; the plan-limit errors come from a **Starter** store.

All of these are **owner-only**: a staff token gets 403 (sample at the end).

## General settings

`GET /api/v1/settings` → **200**

Response:

```json
{
    "data": {
        "name": "Mosciski-Rosenbaum",
        "subdomain": "mystore",
        "category": "general",
        "whatsapp_number": null,
        "reviews_enabled": false,
        "show_platform_credit": true
    }
}
```

## Update general settings

`PUT /api/v1/settings` → **200**

Partial update; the WhatsApp number is normalised.

Request body:

```json
{
    "whatsapp_number": "01712-345 678",
    "reviews_enabled": true
}
```

Response:

```json
{
    "data": {
        "name": "Mosciski-Rosenbaum",
        "subdomain": "mystore",
        "category": "general",
        "whatsapp_number": "01712345678",
        "reviews_enabled": true,
        "show_platform_credit": true
    }
}
```

## General settings, validation error

`PUT /api/v1/settings` → **422**

Request body:

```json
{
    "whatsapp_number": "12345"
}
```

Response:

```json
{
    "message": "The whatsapp number field format is invalid.",
    "errors": {
        "whatsapp_number": [
            "The whatsapp number field format is invalid."
        ]
    }
}
```

## Payments (nothing configured)

`GET /api/v1/settings/payments` → **200**

Response:

```json
{
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
}
```

## Update payments

`PUT /api/v1/settings/payments` → **200**

Secrets are write-only: the reply says whether one is set, never its value. A blank secret keeps the stored one.

Request body:

```json
{
    "bkash_number": "01711111111",
    "nagad_number": "01822222222",
    "sslcommerz_store_id": "shop001",
    "sslcommerz_store_password": "sup3r-secret"
}
```

Response:

```json
{
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
}
```

## Clear a payment secret

`PUT /api/v1/settings/payments` → **200**

`clear` lists secrets to delete.

Request body:

```json
{
    "clear": [
        "sslcommerz_store_password"
    ]
}
```

Response:

```json
{
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
}
```

## Payments, invalid clear

`PUT /api/v1/settings/payments` → **422**

Each group only accepts its own secrets in `clear`.

Request body:

```json
{
    "clear": [
        "ai_api_key"
    ]
}
```

Response:

```json
{
    "message": "The selected clear.0 is invalid.",
    "errors": {
        "clear.0": [
            "The selected clear.0 is invalid."
        ]
    }
}
```

## Couriers (Growth: all three allowed)

`GET /api/v1/settings/couriers` → **200**

Response:

```json
{
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
}
```

## Update couriers

`PUT /api/v1/settings/couriers` → **200**

Request body:

```json
{
    "steadfast_api_key": "sf-key-123",
    "steadfast_secret_key": "sf-secret-456",
    "pathao_client_id": "cid-789"
}
```

Response:

```json
{
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
}
```

## Couriers on Starter (Pathao/RedX shown but not allowed)

`GET /api/v1/settings/couriers` → **200**

Show disabled drivers with an upgrade prompt; do not hide them.

Response:

```json
{
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
}
```

## PLAN LIMIT: Pathao fields on Starter

`PUT /api/v1/settings/couriers` → **403**

Refused outright; nothing is saved.

Request body:

```json
{
    "pathao_client_id": "cid"
}
```

Response:

```json
{
    "message": "Pathao is not part of your plan. Upgrade to use it.",
    "code": "driver_not_in_plan",
    "driver": "pathao"
}
```

## AI settings

`GET /api/v1/settings/ai` → **200**

Response:

```json
{
    "data": {
        "ai_provider": null,
        "ai_api_key_set": false,
        "configured": false
    }
}
```

## Update AI key

`PUT /api/v1/settings/ai` → **200**

Request body:

```json
{
    "ai_provider": "anthropic",
    "ai_api_key": "sk-ant-secret"
}
```

Response:

```json
{
    "data": {
        "ai_provider": "anthropic",
        "ai_api_key_set": true,
        "configured": true
    }
}
```

## AI, invalid provider

`PUT /api/v1/settings/ai` → **422**

Request body:

```json
{
    "ai_provider": "gemini"
}
```

Response:

```json
{
    "message": "The selected ai provider is invalid.",
    "errors": {
        "ai_provider": [
            "The selected ai provider is invalid."
        ]
    }
}
```

## Marketing settings

`GET /api/v1/marketing` → **200**

Response:

```json
{
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
}
```

## Update marketing

`PUT /api/v1/marketing` → **200**

A pasted Search Console tag is reduced to its token. The CAPI token is write-only.

Request body:

```json
{
    "facebook_pixel_id": "123456789",
    "facebook_conversions_api_token": "EAAB-secret-token",
    "ga4_measurement_id": "G-ABC123",
    "meta_title": "My Shop",
    "google_site_verification": "<meta name=\"google-site-verification\" content=\"abc_DEF-123\" />"
}
```

Response:

```json
{
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
}
```

## Marketing, validation error

`PUT /api/v1/marketing` → **422**

Request body:

```json
{
    "google_site_verification": "bad value!"
}
```

Response:

```json
{
    "message": "The google site verification field format is invalid.",
    "errors": {
        "google_site_verification": [
            "The google site verification field format is invalid."
        ]
    }
}
```

## Domains (empty)

`GET /api/v1/domains` → **200**

Response:

```json
{
    "custom_domain_enabled": true,
    "addon_price_yearly": 500,
    "addon_expires_at": null,
    "data": []
}
```

## Add a subdomain-style domain (DNS fields)

`POST /api/v1/domains` → **201**

Hosts are relative to the zone, exactly what a merchant types in their DNS provider.

Request body:

```json
{
    "domain": "Shop.Example.com"
}
```

Response:

```json
{
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
}
```

## Add a root domain (A record routing)

`POST /api/v1/domains` → **201**

Request body:

```json
{
    "domain": "example.org"
}
```

Response:

```json
{
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
}
```

## Add domain, validation errors

`POST /api/v1/domains` → **422**

Request body:

```json
{
    "domain": "not a domain"
}
```

Response:

```json
{
    "message": "The domain field format is invalid.",
    "errors": {
        "domain": [
            "The domain field format is invalid."
        ]
    }
}
```

## Add domain, already taken

`POST /api/v1/domains` → **422**

Request body:

```json
{
    "domain": "shop.example.com"
}
```

Response:

```json
{
    "message": "The domain has already been taken.",
    "errors": {
        "domain": [
            "The domain has already been taken."
        ]
    }
}
```

## List domains

`GET /api/v1/domains` → **200**

Response:

```json
{
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
}
```

## Verify, nothing in DNS yet

`POST /api/v1/domains/1/verify` → **200**

Response:

```json
{
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
}
```

## Verify, record typed with the zone doubled

`POST /api/v1/domains/1/verify` → **200**

Diagnosed, never accepted.

Response:

```json
{
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
}
```

## Make primary, not yet verified

`PUT /api/v1/domains/1/primary` → **422**

Response:

```json
{
    "message": "Only a verified domain can be made primary.",
    "code": "not_verified"
}
```

## Verify, success

`POST /api/v1/domains/1/verify` → **200**

Response:

```json
{
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
}
```

## Make primary

`PUT /api/v1/domains/1/primary` → **200**

Response:

```json
{
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
}
```

## PLAN LIMIT: add a domain on Starter

`POST /api/v1/domains` → **403**

Starter needs the ৳500/year add-on (enabled by the operator).

Request body:

```json
{
    "domain": "shop.example.com"
}
```

Response:

```json
{
    "message": "Custom domains need the Growth plan or higher, or the ৳500/year custom domain add-on on Starter. Contact us to enable it.",
    "code": "custom_domain_not_in_plan",
    "addon_price_yearly": 500
}
```

## Domains on Starter (list)

`GET /api/v1/domains` → **200**

Response:

```json
{
    "custom_domain_enabled": false,
    "addon_price_yearly": 500,
    "addon_expires_at": null,
    "data": []
}
```

## Staff list

`GET /api/v1/staff` → **200**

Response:

```json
{
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
}
```

## Add staff

`POST /api/v1/staff` → **201**

Growth allows 3 seats; this is the third (owner + 2 staff).

Request body:

```json
{
    "name": "Rina Das",
    "email": "rina@example.com",
    "password": "good-password",
    "password_confirmation": "good-password",
    "role": "staff"
}
```

Response:

```json
{
    "data": {
        "id": 4,
        "name": "Rina Das",
        "email": "rina@example.com",
        "role": "staff",
        "created_at": "2026-11-05T09:56:10+00:00"
    }
}
```

## PLAN LIMIT: add staff past the cap

`POST /api/v1/staff` → **403**

The seat cap lives in the model, so it fires from any path.

Request body:

```json
{
    "name": "Rina Das",
    "email": "fourth@example.com",
    "password": "good-password",
    "password_confirmation": "good-password",
    "role": "staff"
}
```

Response:

```json
{
    "message": "You've reached your plan's staff account limit. Upgrade your plan to add more.",
    "code": "staff_limit_reached",
    "max_staff_accounts": 3
}
```

## Add staff, validation errors

`POST /api/v1/staff` → **422**

Request body:

```json
{
    "name": "",
    "email": "rina@example.com",
    "password": "x",
    "role": "staff"
}
```

Response:

```json
{
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
}
```

## Update staff (rename)

`PUT /api/v1/staff/4` → **200**

A new password signs that person out of the app.

Request body:

```json
{
    "name": "Rina D.",
    "email": "rina@example.com",
    "role": "staff"
}
```

Response:

```json
{
    "data": {
        "id": 4,
        "name": "Rina D.",
        "email": "rina@example.com",
        "role": "staff",
        "created_at": "2026-11-05T09:56:10+00:00"
    }
}
```

## Last owner cannot be demoted

`PUT /api/v1/staff/1` → **422**

Request body:

```json
{
    "name": "Owner",
    "email": "x@example.com",
    "role": "staff"
}
```

Response:

```json
{
    "message": "This store must always have at least one owner."
}
```

## Remove staff

`DELETE /api/v1/staff/4` → **200**

Response:

```json
{
    "message": "Staff account removed."
}
```

## PLAN LIMIT: add staff on Starter (owner only)

`POST /api/v1/staff` → **403**

Request body:

```json
{
    "name": "Rina Das",
    "email": "first@example.com",
    "password": "good-password",
    "password_confirmation": "good-password",
    "role": "staff"
}
```

Response:

```json
{
    "message": "You've reached your plan's staff account limit. Upgrade your plan to add more.",
    "code": "staff_limit_reached",
    "max_staff_accounts": 1
}
```

## Plan (Growth)

`GET /api/v1/plan` → **200**

Response:

```json
{
    "data": {
        "plan": {
            "key": "growth",
            "label": "Growth",
            "blurb": "Hiring help and adding courier options.",
            "price_yearly": 8400,
            "price_monthly_quote": 700,
            "staff_accounts": 3,
            "products": 1000,
            "orders_per_month": 2000,
            "has_trial": false,
            "trial_days": 0,
            "custom_domain_included": true,
            "courier_drivers": [
                "steadfast",
                "pathao",
                "redx"
            ],
            "status": "active",
            "is_pending": false,
            "trial_ends_at": null,
            "state": "active",
            "is_trial": false,
            "trial_expired": false,
            "storefront_closed": false,
            "trial_days_left": null
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
            "products": {
                "used": 312,
                "max": 1000
            },
            "orders": {
                "used": 1712,
                "max": 2000,
                "state": "near"
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
            }
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
                "products": 100,
                "orders_per_month": 500,
                "has_trial": true,
                "trial_days": 7,
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
                "products": 1000,
                "orders_per_month": 2000,
                "has_trial": false,
                "trial_days": 0,
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
                "products": 2000,
                "orders_per_month": 5000,
                "has_trial": false,
                "trial_days": 0,
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
        "renew_whatsapp_url": "https://wa.me/8801700000000?text=Assalamu%20alaikum%2C%20I%20want%20to%20renew%20the%20plan%20for%20Mosciski-Rosenbaum.",
        "history": [
            {
                "date": "2025-12-15T09:56:10+00:00",
                "label": "Renewed on Growth",
                "period_from": "2025-12-15T09:56:10+00:00",
                "period_to": "2026-12-15T09:56:10+00:00",
                "amount": 8400,
                "payment_reference": "BK8F2K1Q"
            },
            {
                "date": "2024-12-15T09:56:10+00:00",
                "label": "Started on Growth",
                "period_from": null,
                "period_to": "2025-12-15T09:56:10+00:00",
                "amount": null,
                "payment_reference": null
            }
        ]
    }
}
```

## Plan (Starter)

`GET /api/v1/plan` → **200**

Response:

```json
{
    "data": {
        "plan": {
            "key": "starter",
            "label": "Starter",
            "blurb": "A one-person shop just getting started.",
            "price_yearly": 4200,
            "price_monthly_quote": 350,
            "staff_accounts": 1,
            "products": 100,
            "orders_per_month": 500,
            "has_trial": true,
            "trial_days": 7,
            "custom_domain_included": false,
            "courier_drivers": [
                "steadfast"
            ],
            "status": "trial",
            "is_pending": false,
            "trial_ends_at": "2026-11-19T09:56:10+00:00",
            "state": "trial",
            "is_trial": true,
            "trial_expired": false,
            "storefront_closed": false,
            "trial_days_left": 4
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
            "products": {
                "used": 42,
                "max": 100
            },
            "orders": {
                "used": 380,
                "max": 500,
                "state": "ok"
            },
            "courier_drivers": {
                "enabled": [
                    "steadfast"
                ],
                "configured": []
            }
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
                "products": 100,
                "orders_per_month": 500,
                "has_trial": true,
                "trial_days": 7,
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
                "products": 1000,
                "orders_per_month": 2000,
                "has_trial": false,
                "trial_days": 0,
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
                "products": 2000,
                "orders_per_month": 5000,
                "has_trial": false,
                "trial_days": 0,
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
        "renew_whatsapp_url": "https://wa.me/8801700000000?text=Assalamu%20alaikum%2C%20I%20want%20to%20renew%20the%20plan%20for%20Zulauf%20Group.",
        "history": [
            {
                "date": "2026-11-12T09:56:10+00:00",
                "label": "Free trial",
                "period_from": "2026-11-12T09:56:10+00:00",
                "period_to": "2026-11-19T09:56:10+00:00",
                "amount": 0,
                "payment_reference": null
            }
        ]
    }
}
```

## Owner-only: staff token gets 403

`GET /api/v1/settings` → **403**

Same for every endpoint in this file.

Response:

```json
{
    "message": "User does not have the right roles."
}
```

---

Notes:

- **Plan-limit errors** all share the shape `{message, code, …extras}` with HTTP 403: `driver_not_in_plan` (+`driver`), `custom_domain_not_in_plan` (+`addon_price_yearly`), `staff_limit_reached` (+`max_staff_accounts`). Show `message` and an upgrade prompt.
- Debug traces (`exception`, `file`, `line`, `trace`) are stripped from every body above; they only appear when `APP_DEBUG` is on.
- Secrets are write-only everywhere: replies carry `*_configured` / `secrets_set` flags, never the value.
- DNS `value` tokens are random per domain.
