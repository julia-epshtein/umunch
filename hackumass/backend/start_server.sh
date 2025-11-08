#!/bin/bash

# Start the UMunch backend server accessible from network devices
# This allows your mobile device/simulator to connect to the API

cd "$(dirname "$0")"

# Load environment variables from .env file
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Use SERVER_HOST and SERVER_PORT from .env, or defaults
HOST=${SERVER_HOST:-0.0.0.0}
PORT=${SERVER_PORT:-8000}

echo "Starting UMunch Backend API..."
echo "The API will be accessible at:"
echo "  - From this computer: http://localhost:${PORT}"
echo "  - From network devices: http://${HOST}:${PORT}"
echo ""
echo "Make sure your frontend is configured to use the correct IP address."
echo ""

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start uvicorn with host and port from environment
uvicorn app.main:app --reload --host ${HOST} --port ${PORT}
