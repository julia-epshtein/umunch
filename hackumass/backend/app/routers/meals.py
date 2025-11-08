from fastapi import APIRouter
from pydantic import BaseModel
from ..db import fetch_one, execute

router = APIRouter()

class MealLog(BaseModel):
    external_user_key: str
    dining_hall_code: str   # e.g. 'BERKSHIRE'
    meal_type_code: str     # 'BREAKFAST','LUNCH','DINNER','SNACK'
    kcal_total: float
    protein_total_g: float
    carb_total_g: float
    fat_total_g: float

@router.post("/meals")
def log_meal(meal: MealLog):
    user = fetch_one(
        "SELECT user_id FROM users WHERE external_user_key = %s",
        (meal.external_user_key,),
    )
    if not user:
        return {"error": "user_not_found"}

    dh = fetch_one(
        "SELECT dining_hall_id FROM dining_halls WHERE hall_code = %s",
        (meal.dining_hall_code.upper(),),
    )
    mt = fetch_one(
        "SELECT meal_type_id FROM meal_types WHERE meal_type_code = %s",
        (meal.meal_type_code.upper(),),
    )

    if not dh or not mt:
        return {"error": "invalid_hall_or_meal_type"}

    execute(
        """
        INSERT INTO food_logs (
            user_id, date_id, meal_type_id, dining_hall_id,
            kcal_total, protein_total_g, carb_total_g, fat_total_g,
            logged_mode
        )
        VALUES (%s, CURRENT_DATE(), %s, %s, %s, %s, %s, %s, 'MANUAL')
        """,
        (
            user["USER_ID"],
            mt["MEAL_TYPE_ID"],
            dh["DINING_HALL_ID"],
            meal.kcal_total,
            meal.protein_total_g,
            meal.carb_total_g,
            meal.fat_total_g,
        ),
    )

    return {"status": "ok"}
