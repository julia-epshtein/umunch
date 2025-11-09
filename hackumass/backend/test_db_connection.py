#!/usr/bin/env python3
"""
Test script to verify Snowflake database credentials.
This script will test the connection without starting the full server.
"""

import sys
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.config import settings
import snowflake.connector

def test_connection():
    """Test Snowflake database connection with current credentials."""
    print("🔍 Testing Snowflake Database Connection")
    print("=" * 50)
    print(f"Account: {settings.snowflake_account}")
    print(f"User: {settings.snowflake_user}")
    print(f"Warehouse: {settings.snowflake_warehouse}")
    print(f"Database: {settings.snowflake_database}")
    print(f"Schema: {settings.snowflake_schema}")
    print(f"Password: {'*' * len(settings.snowflake_password) if settings.snowflake_password else '(not set)'}")
    print("=" * 50)
    
    # Check if credentials are set
    if not all([
        settings.snowflake_account,
        settings.snowflake_user,
        settings.snowflake_password,
        settings.snowflake_warehouse,
        settings.snowflake_database,
        settings.snowflake_schema,
    ]):
        print("❌ ERROR: Missing required credentials!")
        missing = []
        if not settings.snowflake_account:
            missing.append("SNOWFLAKE_ACCOUNT")
        if not settings.snowflake_user:
            missing.append("SNOWFLAKE_USER")
        if not settings.snowflake_password:
            missing.append("SNOWFLAKE_PASSWORD")
        if not settings.snowflake_warehouse:
            missing.append("SNOWFLAKE_WAREHOUSE")
        if not settings.snowflake_database:
            missing.append("SNOWFLAKE_DATABASE")
        if not settings.snowflake_schema:
            missing.append("SNOWFLAKE_SCHEMA")
        print(f"   Missing: {', '.join(missing)}")
        print("\n💡 Make sure these are set in your .env file:")
        print("   hackumass/.env or hackumass/backend/.env")
        return False
    
    # Attempt connection
    try:
        print("\n🔌 Attempting to connect to Snowflake...")
        conn = snowflake.connector.connect(
            account=settings.snowflake_account,
            user=settings.snowflake_user,
            password=settings.snowflake_password,
            warehouse=settings.snowflake_warehouse,
            database=settings.snowflake_database,
            schema=settings.snowflake_schema,
            login_timeout=10,
            network_timeout=30,
        )
        print("✅ Connection successful!")
        
        # Test a simple query
        print("\n📊 Testing query execution...")
        cur = conn.cursor()
        cur.execute("SELECT CURRENT_VERSION() AS version;")
        row = cur.fetchone()
        if row:
            print(f"✅ Query successful! Snowflake version: {row[0]}")
        
        # Test accessing the database
        print("\n📊 Testing database access...")
        cur.execute(f"USE DATABASE {settings.snowflake_database};")
        print(f"✅ Database '{settings.snowflake_database}' accessible")
        
        cur.execute(f"USE SCHEMA {settings.snowflake_schema};")
        print(f"✅ Schema '{settings.snowflake_schema}' accessible")
        
        # Test warehouse (optional - might fail due to permissions but connection still works)
        print("\n📊 Testing warehouse access...")
        try:
            cur.execute(f"USE WAREHOUSE {settings.snowflake_warehouse};")
            print(f"✅ Warehouse '{settings.snowflake_warehouse}' accessible")
        except Exception as warehouse_error:
            print(f"⚠️  Warehouse access warning: {warehouse_error}")
            print("   (This is usually a permissions issue, but queries should still work)")
        
        cur.close()
        conn.close()
        print("\n✅ Core database connection tests passed!")
        print("   Database connection is working correctly.")
        return True
        
    except snowflake.connector.errors.ProgrammingError as e:
        print(f"\n❌ Programming Error: {e}")
        if "Incorrect username or password" in str(e):
            print("\n💡 TROUBLESHOOTING:")
            print("   1. Verify your username is correct (case-sensitive)")
            print("   2. Verify your password is correct (check for typos)")
            print("   3. Check if your password contains special characters that need escaping")
            print("   4. Verify your account identifier is correct")
            print("   5. Make sure your user account is not locked or expired")
        return False
    except snowflake.connector.errors.DatabaseError as e:
        print(f"\n❌ Database Error: {e}")
        print("\n💡 TROUBLESHOOTING:")
        print("   1. Verify your account identifier is correct")
        print("   2. Check your network connection")
        print("   3. Verify the database/warehouse/schema names are correct")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)

