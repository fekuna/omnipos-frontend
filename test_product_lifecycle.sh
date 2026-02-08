#!/bin/bash
set -e

echo "1. Login..."
TOKEN=$(curl -s -X POST http://localhost:8081/v1/merchant/login -d '{"phone": "628123", "pin": "112233"}' -H "Content-Type: application/json" | jq -r '.data.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "Login failed"
  exit 1
fi
echo "Token obtained."

echo "2. Create Category..."
CAT_ID=$(curl -s -X POST http://localhost:8081/v1/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Category 1",
    "description": "For testing products",
    "image_url": "http://example.com/cat.png",
    "sort_order": 1
  }' | jq -r '.data.category.id')
echo "Category Created: $CAT_ID"

echo "3. Create Product..."
PROD_ID=$(curl -s -X POST http://localhost:8081/v1/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "'"$CAT_ID"'",
    "sku": "TEST-SKU-001",
    "name": "Test Coffee",
    "description": "Delicious test coffee",
    "base_price": 25000,
    "cost_price": 15000,
    "image_url": "http://example.com/coffee.png",
    "track_inventory": true,
    "has_variants": false
  }' | jq -r '.data.product.id')
echo "Product Created: $PROD_ID"

echo "4. Get Product..."
curl -s -X GET "http://localhost:8081/v1/products/$PROD_ID" -H "Authorization: Bearer $TOKEN" | jq '.data.product.name'

echo "5. Update Product..."
curl -s -X PUT "http://localhost:8081/v1/products/$PROD_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "'"$CAT_ID"'",
    "sku": "TEST-SKU-001",
    "name": "Updated Test Coffee",
    "description": "Even more delicious",
    "base_price": 30000,
    "cost_price": 16000,
    "image_url": "http://example.com/coffee_v2.png",
    "track_inventory": true,
    "is_active": true
  }' | jq '.data.product.base_price'

echo "6. List/Search Products..."
COUNT=$(curl -s -X GET "http://localhost:8081/v1/products?query=Updated" -H "Authorization: Bearer $TOKEN" | jq '.data.total')
echo "Search found: $COUNT products"

echo "7. Delete Product..."
curl -s -X DELETE "http://localhost:8081/v1/products/$PROD_ID" -H "Authorization: Bearer $TOKEN"

echo "8. Verify Deletion..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "http://localhost:8081/v1/products/$PROD_ID" -H "Authorization: Bearer $TOKEN")
echo "Get Deleted Product Status: $STATUS"

echo "9. Delete Category..."
curl -s -X DELETE "http://localhost:8081/v1/categories/$CAT_ID" -H "Authorization: Bearer $TOKEN"

echo "Test Complete."
