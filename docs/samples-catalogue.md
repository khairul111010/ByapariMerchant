
---

# Categories: save and delete

Generated the same way as above. Notes:

- Save responses return the single category in `data` (now with `products_count`, same shape as a list row).
- Deleting never blocks and never refuses: products in the category are kept and become **uncategorised** (`category: null`), and subcategories are promoted to top level (`parent_id: null`). Their own products keep their category. The response is always the same fixed message, so it says nothing about what happened to the products.
- 404 bodies are shown without the Laravel debug trace (`APP_DEBUG` only); in production they are `{"message": "No query results for model [App\\Models\\Category] 9999"}`, not a user-friendly string.

## Create category (top level)

`POST /api/v1/categories` → **201**

Request body:

```json
{
    "name": "Electronics",
    "description": "Gadgets and gear"
}
```

Response:

```json
{
    "data": {
        "id": 1,
        "parent_id": null,
        "name": "Electronics",
        "slug": "electronics",
        "description": "Gadgets and gear",
        "position": 0,
        "is_active": true,
        "image": null,
        "products_count": 0
    }
}
```

## Create subcategory

`POST /api/v1/categories` → **201**

Request body:

```json
{
    "name": "Earphones",
    "parent_id": 1
}
```

Response:

```json
{
    "data": {
        "id": 2,
        "parent_id": 1,
        "name": "Earphones",
        "slug": "earphones",
        "description": null,
        "position": 0,
        "is_active": true,
        "image": null,
        "products_count": 0
    }
}
```

## Create category, validation errors

`POST /api/v1/categories` → **422**

Empty name; parent is itself a subcategory.

Request body:

```json
{
    "name": "",
    "parent_id": 2
}
```

Response:

```json
{
    "message": "The name field is required. (and 1 more error)",
    "errors": {
        "name": [
            "The name field is required."
        ],
        "parent_id": [
            "A subcategory cannot itself be used as a parent category."
        ]
    }
}
```

## Create category with image

`POST /api/v1/categories` → **201**

Multipart form.

Response:

```json
{
    "data": {
        "id": 3,
        "parent_id": null,
        "name": "Accessories",
        "slug": "accessories",
        "description": null,
        "position": 0,
        "is_active": true,
        "image": "/storage/store-1/1/conversions/c-tile.webp",
        "products_count": 0
    }
}
```

## Update category (rename, hide)

`POST /api/v1/categories/1` → **200**

POST, not PUT, so multipart works.

Request body:

```json
{
    "name": "Electronics & Gadgets",
    "is_active": false
}
```

Response:

```json
{
    "data": {
        "id": 1,
        "parent_id": null,
        "name": "Electronics & Gadgets",
        "slug": "electronics",
        "description": "Gadgets and gear",
        "position": 0,
        "is_active": false,
        "image": null,
        "products_count": 0
    }
}
```

## Update category, make it a child of its own child

`POST /api/v1/categories/1` → **422**

Request body:

```json
{
    "name": "Electronics",
    "parent_id": 2
}
```

Response:

```json
{
    "message": "A subcategory cannot itself be used as a parent category.",
    "errors": {
        "parent_id": [
            "A subcategory cannot itself be used as a parent category."
        ]
    }
}
```

## Update category, parent_id = itself

`POST /api/v1/categories/1` → **422**

Request body:

```json
{
    "name": "Electronics",
    "parent_id": 1
}
```

Response:

```json
{
    "message": "The selected parent id is invalid.",
    "errors": {
        "parent_id": [
            "The selected parent id is invalid."
        ]
    }
}
```

## Update unknown category

`POST /api/v1/categories/9999` → **404**

Request body:

```json
{
    "name": "X"
}
```

Response:

```json
{
    "message": "No query results for model [App\\Models\\Category] 9999"
}
```

## List categories BEFORE delete

`GET /api/v1/categories` → **200**

Response:

```json
{
    "data": [
        {
            "id": 3,
            "parent_id": null,
            "name": "Accessories",
            "slug": "accessories",
            "description": null,
            "position": 0,
            "is_active": true,
            "image": "/storage/store-1/1/conversions/c-tile.webp",
            "products_count": 0
        },
        {
            "id": 2,
            "parent_id": 1,
            "name": "Earphones",
            "slug": "earphones",
            "description": null,
            "position": 0,
            "is_active": true,
            "image": null,
            "products_count": 1
        },
        {
            "id": 1,
            "parent_id": null,
            "name": "Electronics & Gadgets",
            "slug": "electronics",
            "description": "Gadgets and gear",
            "position": 0,
            "is_active": false,
            "image": null,
            "products_count": 3
        }
    ]
}
```

## Delete a category that has 3 products and 1 subcategory (with 1 product)

`DELETE /api/v1/categories/1` → **200**

Response:

```json
{
    "message": "Category deleted."
}
```

## List categories AFTER delete

`GET /api/v1/categories` → **200**

Response:

```json
{
    "data": [
        {
            "id": 3,
            "parent_id": null,
            "name": "Accessories",
            "slug": "accessories",
            "description": null,
            "position": 0,
            "is_active": true,
            "image": "/storage/store-1/1/conversions/c-tile.webp",
            "products_count": 0
        },
        {
            "id": 2,
            "parent_id": null,
            "name": "Earphones",
            "slug": "earphones",
            "description": null,
            "position": 0,
            "is_active": true,
            "image": null,
            "products_count": 1
        }
    ]
}
```

### Observed

Products still exist: 4
Their category_ids: [null,null,2,null]
Subcategory parent_id: null
## Delete again (already gone)

`DELETE /api/v1/categories/1` → **404**

Response:

```json
{
    "message": "No query results for model [App\\Models\\Category] 1"
}
```

