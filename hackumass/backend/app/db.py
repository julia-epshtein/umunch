import snowflake.connector
from .config import settings
import time

def get_connection():
    """Get a Snowflake database connection with timeout handling."""
    try:
        print(f"🔌 Connecting to Snowflake: {settings.snowflake_account}/{settings.snowflake_database}")
        conn = snowflake.connector.connect(
            account=settings.snowflake_account,
            user=settings.snowflake_user,
            password=settings.snowflake_password,
            warehouse=settings.snowflake_warehouse,
            database=settings.snowflake_database,
            schema=settings.snowflake_schema,
            # Add connection timeout
            login_timeout=10,  # 10 second login timeout
            network_timeout=30,  # 30 second network timeout
        )
        print("✅ Snowflake connection established")
        return conn
    except Exception as e:
        print(f"❌ Snowflake connection error: {e}")
        raise

def fetch_one(query: str, params: tuple = ()):
    """Execute a query and return one row with timeout protection."""
    conn = None
    try:
        start_time = time.time()
        conn = get_connection()
        cur = conn.cursor()
        print(f"📊 Executing query (timeout: 25s)...")
        cur.execute(query, params)
        row = cur.fetchone()
        elapsed = time.time() - start_time
        if row is None:
            print(f"✅ Query completed in {elapsed:.2f}s, no rows returned")
            return None
        columns = [c[0] for c in cur.description]
        print(f"✅ Query completed in {elapsed:.2f}s, returned 1 row")
        return dict(zip(columns, row))
    except Exception as e:
        elapsed = time.time() - start_time if 'start_time' in locals() else 0
        print(f"❌ Query failed after {elapsed:.2f}s: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        if conn:
            try:
                conn.close()
            except:
                pass

def fetch_all(query: str, params: tuple = ()):
    """Execute a query and return all rows with timeout protection."""
    conn = None
    try:
        start_time = time.time()
        conn = get_connection()
        cur = conn.cursor()
        print(f"📊 Executing query (timeout: 25s)...")
        cur.execute(query, params)
        rows = cur.fetchall()
        columns = [c[0] for c in cur.description]
        elapsed = time.time() - start_time
        print(f"✅ Query completed in {elapsed:.2f}s, returned {len(rows)} rows")
        return [dict(zip(columns, r)) for r in rows]
    except Exception as e:
        elapsed = time.time() - start_time if 'start_time' in locals() else 0
        print(f"❌ Query failed after {elapsed:.2f}s: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        if conn:
            try:
                conn.close()
            except:
                pass

def execute(query: str, params: tuple = ()):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(query, params)
        conn.commit()
    finally:
        conn.close()
