# Real response samples (generated from the backend code)

Produced by running the real API against a throwaway database with **fake** data (no real phones or addresses). They are the exact shapes the server returns today. Money is always a **string**; timestamps are ISO-8601 UTC.

Enum values (from the migrations):
- `order.status`: `pending | confirmed | shipped | delivered | cancelled`
- `order.payment_status`: `unpaid | paid | failed`
- `order.payment_method`: `cod | sslcommerz | manual_bkash | manual_nagad | pos`
- `store.status`: `pending | trial | active | suspended | cancelled` (`trial` = legacy stores only)
- `customer_risk.level`: `new | low | medium | high`

What the samples show:
- `GET /orders` rows are **compact**; `GET /orders/{id}` adds address, totals, `items`, `payment`, `advance_payments`, `courier`, `customer_risk`.
- `payment` is `null` for an order with no online/manual payment record (a plain COD order). It is an object for gateway and manual bKash/Nagad orders.
- `items[].product_id` / `variant_id` can be `null` (the product was deleted later), so don't assume a link to a product screen.
- `GET /notifications` is `{unread, data, meta:{current_page,last_page}}`, **not** the `{data, links, meta}` shape orders use. `data[].data` is the stored new-order payload and it **does** include `customer_name` (the push never does).
- `store.api_base_url` is built from the request host. Save it after login/signup.
- `platform.support_whatsapp*` is empty until the operator fills Site settings.

### POST /auth/login (token redacted)
```json
{
  "token": "1|REDACTED",
  "user": {
    "id": 1,
    "name": "Demo Owner",
    "email": "owner@example.com",
    "roles": [
      "owner"
    ],
    "is_owner": true
  },
  "store": {
    "name": "Demo Shop",
    "subdomain": "demoshop",
    "status": "trial",
    "is_pending": false,
    "plan": "growth",
    "plan_expires_at": null,
    "plan_overdue": false,
    "storefront_url": "http://demoshop.bypari.localhost/",
    "api_base_url": "http://demoshop.bypari.localhost/api/v1",
    "ai_configured": false,
    "reviews_enabled": false
  },
  "limits": {
    "max_staff_accounts": 3,
    "can_add_staff_account": true,
    "custom_domain_enabled": true,
    "courier_drivers": [
      "steadfast",
      "pathao",
      "redx"
    ],
    "configured_courier_drivers": []
  },
  "platform": {
    "support_whatsapp": "",
    "support_whatsapp_url": null,
    "support_phone": "",
    "support_email": ""
  },
  "unread_notifications": 1
}
```

### GET /orders
```json
{
  "data": [
    {
      "id": 1,
      "order_number": "ORD-000001",
      "status": "pending",
      "payment_method": "cod",
      "payment_status": "unpaid",
      "customer_name": "Sample Buyer",
      "customer_phone": "01700000000",
      "total": "1560.00",
      "created_at": "2026-11-03T06:04:48+00:00"
    }
  ],
  "links": {
    "first": "http://demoshop.bypari.localhost/api/v1/orders?page=1",
    "last": "http://demoshop.bypari.localhost/api/v1/orders?page=1",
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
        "url": "http://demoshop.bypari.localhost/api/v1/orders?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": null,
        "label": "Next",
        "active": false
      }
    ],
    "path": "http://demoshop.bypari.localhost/api/v1/orders",
    "per_page": 20,
    "to": 1,
    "total": 1
  }
}
```

### GET /orders/{id}
```json
{
  "data": {
    "id": 1,
    "order_number": "ORD-000001",
    "status": "pending",
    "payment_method": "cod",
    "payment_status": "unpaid",
    "customer_name": "Sample Buyer",
    "customer_phone": "01700000000",
    "total": "1560.00",
    "created_at": "2026-11-03T06:04:48+00:00",
    "customer_address": "House 1, Road 2, Dhaka",
    "delivery_zone": "inside_dhaka",
    "coupon_code": null,
    "subtotal": "1500.00",
    "discount_amount": "0.00",
    "delivery_charge": "60.00",
    "advance_paid": "0.00",
    "amount_due": "1560.00",
    "cancelled_at": null,
    "items": [
      {
        "id": 1,
        "product_id": null,
        "variant_id": null,
        "product_name": "Wireless Earbuds",
        "variant_name": "Black",
        "sku": "EAR-BLK",
        "unit_price": "750.00",
        "quantity": 2,
        "line_total": "1500.00"
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

### GET /notifications
```json
{
  "unread": 1,
  "data": [
    {
      "id": "e8f7fb0e-ad70-4992-9e88-b1a819c197ea",
      "type": "new_order",
      "data": {
        "order_id": 1,
        "order_number": "ORD-000001",
        "customer_name": "Sample Buyer",
        "total": "1560.00",
        "payment_method": "cod"
      },
      "read_at": null,
      "created_at": "2026-11-03T06:04:48+00:00"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1
  }
}
```

