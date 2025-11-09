# app/routers/coach.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.services.user_service import get_user_data
from app.services.dining_service import get_dining_hall_data
from app.gemini_client import ask_umunch

router = APIRouter(prefix="/coach", tags=["coach"])


class RecommendationRequest(BaseModel):
    meal_type: str              # "breakfast" | "lunch" | "dinner" | "snack"
    dining_hall: str            # "Worcester", "Franklin", "Berkshire", "Hampshire"
    user_id: Optional[int] = 101  # TEMP: default test user


class MealItemRecommendation(BaseModel):
    itemName: str
    estimatedCalories: float
    reason: str


class RecommendationResponse(BaseModel):
    meal_type: str
    dining_hall: str
    recommendations: List[MealItemRecommendation]


@router.post("/recommendations", response_model=RecommendationResponse)
def get_recommendations(payload: RecommendationRequest):
    # 1. Get user data from USERS
    user = get_user_data(user_id=payload.user_id or 101)
    if not user:
        raise HTTPException(status_code=404, detail="User not found in USERS table")

    # 2. Get dining hall menu rows for this meal_type
    dining_rows = get_dining_hall_data(meal_type=payload.meal_type)
    if not dining_rows:
        raise HTTPException(
            status_code=404,
            detail=f"No dining data found for meal_type={payload.meal_type}",
        )

    # 3. Ask Gemini using your new client
    gemini_json = ask_umunch(
        user=user,
        dining_halls=dining_rows,
        meal_type=payload.meal_type,
    )

    # 4. Extract recommendations for the chosen dining_hall
    all_recs = gemini_json.get("recommendations", {})
    hall_recs = all_recs.get(payload.dining_hall, [])

    # Safety: ensure it's always a list
    if not isinstance(hall_recs, list):
        hall_recs = []

    return RecommendationResponse(
        meal_type=payload.meal_type,
        dining_hall=payload.dining_hall,
        recommendations=hall_recs,
    )


