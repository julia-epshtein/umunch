from fastapi import APIRouter
from pydantic import BaseModel
from ..db import fetch_one, execute

router = APIRouter()

class WorkoutLog(BaseModel):
    external_user_key: str
    workout_type_code: str   # e.g. 'WALK', 'RUN', 'LIFT'
    duration_min: float
    intensity: str           # 'LIGHT','MODERATE','INTENSE'
    kcal_burned: float       # for now, frontend can send this

@router.post("/workouts")
def log_workout(workout: WorkoutLog):
    user = fetch_one(
        "SELECT user_id FROM users WHERE external_user_key = %s",
        (workout.external_user_key,),
    )
    if not user:
        return {"error": "user_not_found"}

    wt = fetch_one(
        "SELECT workout_type_id FROM workout_types WHERE workout_code = %s",
        (workout.workout_type_code.upper(),),
    )

    if not wt:
        return {"error": "invalid_workout_type"}  # later you can auto-create types

    execute(
        """
        INSERT INTO workout_logs (
            user_id, date_id, workout_type_id,
            duration_min, intensity, kcal_burned, is_planned
        )
        VALUES (%s, CURRENT_DATE(), %s, %s, %s, %s, FALSE)
        """,
        (
            user["USER_ID"],
            wt["WORKOUT_TYPE_ID"],
            workout.duration_min,
            workout.intensity.upper(),
            workout.kcal_burned,
        ),
    )

    return {"status": "ok"}
