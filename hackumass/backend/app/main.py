from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .testdb import router as test_db_router
from . import elevenlabs_router
from .routers import dashboard, meals, workout, coach, onboarding
from .food_image_service import get_food_image_service

app = FastAPI(title="UMunch API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(test_db_router)
app.include_router(elevenlabs_router.router)
app.include_router(dashboard.router)
app.include_router(meals.router)
app.include_router(workout.router)
app.include_router(coach.router)
app.include_router(onboarding.router)

@app.get("/health")
def health():
    """Health check endpoint - responds immediately without database access."""
    return {"status": "ok", "message": "Server is running"}

@app.get("/health/db")
def health_db():
    """Health check with database connection test."""
    try:
        from .db import fetch_one
        result = fetch_one("SELECT CURRENT_VERSION() AS version;")
        return {
            "status": "ok",
            "database": "connected",
            "snowflake_version": result.get("VERSION") if result else "unknown"
        }
    except Exception as e:
        return {
            "status": "error",
            "database": "disconnected",
            "error": str(e)
        }

@app.on_event("startup")
async def startup_event():
    """Preload the food image dataset on server startup (non-blocking)."""
    import asyncio
    
    async def load_food_service():
        """Load food image service in background."""
        try:
            print("⏳ Preloading food image dataset (this may take a moment)...")
            # Run the blocking operation in a thread pool
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, get_food_image_service)
            print("✅ Food image service ready!")
        except Exception as e:
            print(f"⚠️ Warning: Failed to load food image service: {e}")
            print("⚠️ Server will continue without food images (some features may be limited)")
    
    # Start loading in background - don't block server startup
    asyncio.create_task(load_food_service())
    print("✅ Server is ready to accept requests (food images loading in background)")
