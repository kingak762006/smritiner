import os
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .database import engine, Base
from .seed import seed_demonstration_database
from .routes import users, sessions, games, analytics, reminders, sync, export

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI App
app = FastAPI(
    title="SmritiNER Cognitive Platform API",
    description=(
        "Research Prototype API for AI-Based Statewide Cognitive Gaming and Memory Training "
        "for All Citizens across the Region. AVISHKAR 2026 / SIH 2026 (MDoNER)."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(sessions.router, prefix=settings.API_V1_STR)
app.include_router(games.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(reminders.router, prefix=settings.API_V1_STR)
app.include_router(sync.router, prefix=settings.API_V1_STR)
app.include_router(export.router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def startup_event():
    print("[Startup] SmritiNER backend starting up...")
    seed_demonstration_database()


@app.get("/health", tags=["System Health"])
def health_check():
    """
    Health check endpoint reporting system status, ML model status, and research disclaimer.
    """
    from ml.adaptive_engine import engine as adaptive_engine
    ml_ready = adaptive_engine.ml_model is not None

    return {
        "status": "healthy",
        "service": "SmritiNER Backend API",
        "timestamp_utc": datetime.utcnow().isoformat(),
        "database": "connected",
        "ml_adaptive_engine": "loaded" if ml_ready else "rule_based_fallback",
        "prototype_disclaimer": settings.DISCLAIMER
    }


@app.post(f"{settings.API_V1_STR}/demo/seed", tags=["Demonstration & Benchmark"])
def trigger_seed():
    """
    Populates synthetic benchmark cohort data on demand.
    """
    seed_demonstration_database()
    return {"message": "Synthetic demonstration dataset successfully populated."}
