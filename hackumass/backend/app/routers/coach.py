from fastapi import APIRouter
from pydantic import BaseModel
from ..db import fetch_all
from ..gemini_client import ask_umunch

router = APIRouter()

class CoachRequest(BaseModel):
    external_user_key: str
    question: str

@router.post("/coach")
def coach(req: CoachRequest):
    # fetch today's user snapshot
    snap = fetch_all(
        """
        SELECT *
        FROM user_daily_targets t
        JOIN users u ON u.user_id = t.user_id
        WHERE u.external_user_key = %s
          AND t.date_id = CURRENT_DATE()
        """,
        (req.external_user_key,),
    )
    if not snap:
        return {"error": "no_snapshot_for_today"}
    snapshot = snap[0]

    # fetch menu items for user's preferred halls (today)
    menus = fetch_all(
        """
        SELECT d.hall_name, m.item_name, m.kcal, m.protein_g, m.carb_g, m.fat_g
        FROM menu_items m
        JOIN dining_halls d ON m.dining_hall_id = d.dining_hall_id
        JOIN users u ON u.user_id = %s
        WHERE m.date_id = CURRENT_DATE()
        """,
        (snapshot["USER_ID"],),
    )

    # generate Gemini response
    try:
        answer = ask_umunch(snapshot, menus, req.question)
        return {"answer": answer}
    except Exception as e:
        return {"error": str(e)}
