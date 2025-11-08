from fastapi import APIRouter
from .db import fetch_all

router = APIRouter()

@router.get("/testdb")
def test_db():
    try:
        rows = fetch_all("SELECT CURRENT_VERSION() AS version;")
        return {"connected": True, "snowflake_version": rows[0]["VERSION"]}
    except Exception as e:
        return {"connected": False, "error": str(e)}

