#!/usr/bin/env bash
# Hit the edge a few times so access.json.log has interesting samples.
set -euo pipefail
BASE="${1:-http://localhost:8080}"

echo "== create =="
ORDER=$(curl -s -X POST "$BASE/api/orders" \
  -H 'Content-Type: application/json' \
  -H 'X-Request-ID: demo-create-1' \
  -d '{"sku":"WIDGET","quantity":2}')
echo "$ORDER"
ID=$(echo "$ORDER" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

echo "== get $ID =="
curl -s -D - "$BASE/api/orders/$ID" -H 'X-Request-ID: demo-get-1' -o /tmp/order.json
echo
cat /tmp/order.json
echo

echo "== not found =="
curl -s -o /dev/null -w "status=%{http_code}\n" "$BASE/api/orders/999999"

echo "== boom (5xx) =="
curl -s -o /dev/null -w "status=%{http_code}\n" "$BASE/api/orders/health-demo/boom"

echo
echo "Inspect: tail logs/nginx/access.json.log | jq"
echo "App logs: docker compose logs --tail=50 app"
