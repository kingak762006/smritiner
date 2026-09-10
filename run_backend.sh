#!/bin/bash
echo "Starting SmritiNER Backend (FastAPI + ML Engine)..."
cd "$(dirname "$0")/backend"
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
