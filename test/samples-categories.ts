// Parsed from the categories sections of docs/samples-catalogue.md (fake data). Do not edit by hand.
export const categorySamples: Record<string, unknown> = {
  "Create category (top level)": {
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
},
  "Create subcategory": {
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
},
  "Create category, validation errors": {
    "message": "The name field is required. (and 1 more error)",
    "errors": {
        "name": [
            "The name field is required."
        ],
        "parent_id": [
            "A subcategory cannot itself be used as a parent category."
        ]
    }
},
  "Create category with image": {
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
},
  "Update category (rename, hide)": {
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
},
  "Update category, make it a child of its own child": {
    "message": "A subcategory cannot itself be used as a parent category.",
    "errors": {
        "parent_id": [
            "A subcategory cannot itself be used as a parent category."
        ]
    }
},
  "Update category, parent_id = itself": {
    "message": "The selected parent id is invalid.",
    "errors": {
        "parent_id": [
            "The selected parent id is invalid."
        ]
    }
},
  "Update unknown category": {
    "message": "No query results for model [App\\Models\\Category] 9999"
},
  "List categories BEFORE delete": {
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
},
  "Delete a category that has 3 products and 1 subcategory (with 1 product)": {
    "message": "Category deleted."
},
  "List categories AFTER delete": {
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
},
  "Delete again (already gone)": {
    "message": "No query results for model [App\\Models\\Category] 1"
},
};
