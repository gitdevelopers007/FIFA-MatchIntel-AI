# Stage 1: Build the React Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install --registry=http://registry.npmjs.org/
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve Python Backend & static files
FROM python:3.12-slim
WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend
COPY run.py ./

# Copy built frontend from Stage 1 into backend's static directory
COPY --from=frontend-builder /frontend/dist ./static
# Copy the hero image asset
COPY frontend/public/fifa_stadium_hero.png ./static/fifa_stadium_hero.png

# Write a unified production entrypoint
COPY <<EOF main.py
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.endpoints import router
from backend.app.core.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FIFA MatchIntel AI", version="2.0.0")

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "BACKEND_CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

# Mount static frontend
if os.path.exists("static/assets"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

@app.get("/fifa_stadium_hero.png")
async def hero_image():
    return FileResponse("static/fifa_stadium_hero.png")

@app.get("/favicon.svg")
async def favicon():
    path = "static/favicon.svg"
    if os.path.exists(path):
        return FileResponse(path)
    return FileResponse("static/index.html")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    file_path = os.path.join("static", full_path)
    if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse("static/index.html")
EOF

# Seed the database at build time
RUN python backend/seed_db.py

EXPOSE 7860

# Start Uvicorn on port 7860 (Hugging Face expects port 7860 by default)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
