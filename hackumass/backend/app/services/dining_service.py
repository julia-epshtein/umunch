# app/services/dining_service.py
from typing import List, Dict, Any, Optional
from ..db import fetch_all   # use the shared Snowflake helper


def get_dining_hall_data(
    meal_type: Optional[str] = "breakfast",
    date: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Fetch dining hall rows from UMUNCH_DB.DINING_DATA.NOV_12_2025.
    Filters by MEAL and enforces CALORIES >= 100.
    """

    # fully qualified so we avoid "Object 'NOV_12_2025' does not exist" errors
    table_name = "UMUNCH_DB.DINING_DATA.NOV_12_2025"

    sql = f"""
        SELECT *
        FROM {table_name}
        WHERE LOWER(MEAL) = LOWER(%s)
          AND CALORIES >= 100
    """

    rows = fetch_all(sql, (meal_type,))
    return rows