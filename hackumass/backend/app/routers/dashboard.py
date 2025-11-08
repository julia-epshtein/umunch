from fastapi import APIRouter, Query
from ..db import fetch_all

router = APIRouter()

@router.get("/dashboard/today")
def get_today_dashboard(external_user_key: str = Query(...)):
    """
    Returns today's snapshot of calories, macros, and workouts for a given user.
    """
    rows = fetch_all(
        """
        SELECT
            u.user_id,
            u.external_user_key,
            u.first_name,
            u.last_name,
            u.age_years,
            u.gender_identity,
            t.date_id AS day,
            t.kcal_target,
            t.protein_target_g,
            t.carb_target_g,
            t.fat_target_g,
            COALESCE(f.consumed_kcal, 0) AS consumed_kcal,
            COALESCE(f.consumed_protein_g, 0) AS consumed_protein_g,
            COALESCE(f.consumed_carb_g, 0) AS consumed_carb_g,
            COALESCE(f.consumed_fat_g, 0) AS consumed_fat_g,
            COALESCE(w.kcal_burned_total, 0) AS workout_kcal_burned,
            (COALESCE(f.consumed_kcal, 0) - COALESCE(w.kcal_burned_total, 0)) AS net_kcal,
            t.kcal_target - COALESCE(f.consumed_kcal, 0) AS remaining_kcal
        FROM user_daily_targets t
        JOIN users u ON u.user_id = t.user_id
        LEFT JOIN (
            SELECT user_id, date_id,
                   SUM(kcal_total) AS consumed_kcal,
                   SUM(protein_total_g) AS consumed_protein_g,
                   SUM(carb_total_g) AS consumed_carb_g,
                   SUM(fat_total_g) AS consumed_fat_g
            FROM food_logs
            GROUP BY user_id, date_id
        ) f ON f.user_id = t.user_id AND f.date_id = t.date_id
        LEFT JOIN (
            SELECT user_id, date_id, SUM(kcal_burned) AS kcal_burned_total
            FROM workout_logs
            GROUP BY user_id, date_id
        ) w ON w.user_id = t.user_id AND w.date_id = t.date_id
        WHERE u.external_user_key = %s AND t.date_id = CURRENT_DATE();
        """,
        (external_user_key,),
    )
    return {"snapshot": rows[0] if rows else None}
