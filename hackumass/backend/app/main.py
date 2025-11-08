from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .testdb import router as test_db_router
from .routers import dashboard, meals, workout, coach, onboarding

app = FastAPI(title="UMunch API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(test_db_router)
app.include_router(dashboard.router)
app.include_router(meals.router)
app.include_router(workout.router)
app.include_router(coach.router)
app.include_router(onboarding.router)

@app.get("/health")
def health():
    return {"status": "ok"}
