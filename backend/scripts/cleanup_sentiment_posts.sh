#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
CREATOR="${CREATOR:-sentiment_test_1775857684}"

POST_IDS=(
  "69d97014152d63c918a2c23f"
  "69d97014152d63c918a2c241"
  "69d97014152d63c918a2c243"
  "69d97014152d63c918a2c245"
  "69d97014152d63c918a2c247"
)

if [ "$#" -gt 0 ]; then
  POST_IDS=("$@")
fi

delete_post() {
  local post_id="$1"

  echo "Deleting post: ${post_id}"
  curl --silent --show-error --fail-with-body \
    -X DELETE "${BASE_URL}/api/posts/${post_id}" \
    -H "Content-Type: application/json" \
    --data "{\"creator\":\"${CREATOR}\"}"
  echo
  echo
}

for post_id in "${POST_IDS[@]}"; do
  delete_post "${post_id}"
done

echo "Finished deleting posts for creator: ${CREATOR}"
