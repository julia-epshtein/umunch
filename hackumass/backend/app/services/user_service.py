from typing import Optional, Dict, Any
from ..db import fetch_all


def get_user_data(user_id: int = 101) -> Optional[Dict[str, Any]]:
    """
    Fetch a user row from the UMUNCH_DB.CORE.USERS table.
    """

    sql = """
        SELECT *
        FROM UMUNCH_DB.CORE.USERS   -- fully qualified!
        WHERE USER_ID = %s
        LIMIT 1
    """

    rows = fetch_all(sql, (user_id,))

    if not rows:
        print(f"⚠️ No user found in UMUNCH_DB.CORE.USERS for USER_ID={user_id}")
        return None

    return rows[0]
