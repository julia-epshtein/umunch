from fastapi import APIRouter, Query, HTTPException
from ..db import fetch_all

router = APIRouter()

@router.get("/dashboard/today")
def get_today_dashboard(external_user_key: str = Query(...)):
    """
    Returns today's snapshot of calories, macros, and workouts for a given user.
    """
    try:
        print(f"📊 Dashboard request for user: {external_user_key}")
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
        print(f"✅ Dashboard query completed, found {len(rows)} rows")
        
        if not rows:
            # Return empty snapshot instead of None - this is valid
            print(f"⚠️ No data found for user {external_user_key} on current date")
            return {"snapshot": None}
        
        return {"snapshot": rows[0]}
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Dashboard query error: {error_msg}")
        import traceback
        traceback.print_exc()
        
        # Return HTTP 500 with error details instead of crashing
        # This allows the frontend to handle the error gracefully
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Database query failed",
                "message": error_msg,
                "user_key": external_user_key
            }
        )
