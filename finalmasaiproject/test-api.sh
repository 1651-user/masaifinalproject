#!/bin/bash
cd /home/dministrator/finalmasaiproject/backend
node server.js &
SERVER_PID=$!
sleep 3

echo "=== Testing register endpoint ==="
node /home/dministrator/finalmasaiproject/test-register.js

echo ""
echo "=== Backend logs ==="
kill $SERVER_PID 2>/dev/null
