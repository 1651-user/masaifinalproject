#!/bin/bash
cd "$(dirname "$0")/backend" || exit 1
node server.js &
SERVER_PID=$!
sleep 3

echo "=== Testing register endpoint ==="
node ../test-register.js

echo ""
echo "=== Backend logs ==="
kill $SERVER_PID 2>/dev/null
