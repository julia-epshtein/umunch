#!/bin/bash

# Quick start script for FastAPI server
# Usage: ./start_server.sh

echo "🚀 Starting FastAPI server..."
echo "📍 Server will be available at: http://localhost:8000"
echo "📚 API docs will be available at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

