import os
import sys

# Add parent dir to path so backend modules resolve
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

# Mount API routes
app.include_router(router, prefix="/api/v1")

# Mount static frontend assets (CSS, JS bundles)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(os.path.join(static_dir, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

# Serve static files from root (images, icons, etc.)
@app.get("/fifa_stadium_hero.png")
async def hero_image():
    return FileResponse(os.path.join(static_dir, "fifa_stadium_hero.png"))

@app.get("/favicon.svg")
async def favicon():
    path = os.path.join(static_dir, "favicon.svg")
    if os.path.exists(path):
        return FileResponse(path)
    return FileResponse(os.path.join(static_dir, "index.html"))

# SPA catch-all: serve index.html for all non-API routes
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    file_path = os.path.join(static_dir, full_path)
    if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(static_dir, "index.html"))
