#!/bin/bash
# Start both backend and frontend servers

echo "Starting ShopLocal Backend on port 5000..."
cd /home/dministrator/finalmasaiproject/backend
node server.js &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

sleep 2

echo "Starting ShopLocal Frontend on port 5173..."
cd /home/dministrator/finalmasaiproject/frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "Both servers running!"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers."

# Wait and kill both on Ctrl+C
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait
