import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend directory, or parent directory if not found
backend_dir = Path(__file__).parent.parent  # Go up from app/ to backend/
env_path = backend_dir / ".env"
if not env_path.exists():
    # Try parent directory (hackumass/.env)
    parent_env = backend_dir.parent / ".env"
    if parent_env.exists():
        env_path = parent_env

load_dotenv(env_path)  # Load from the correct location
print(f"📁 Loading .env from: {env_path}")

class Settings:
    snowflake_account: str = os.getenv("SNOWFLAKE_ACCOUNT", "")
    snowflake_user: str = os.getenv("SNOWFLAKE_USER", "")
    snowflake_password: str = os.getenv("SNOWFLAKE_PASSWORD", "")
    snowflake_warehouse: str = os.getenv("SNOWFLAKE_WAREHOUSE", "")
    snowflake_database: str = os.getenv("SNOWFLAKE_DATABASE", "")
    snowflake_schema: str = os.getenv("SNOWFLAKE_SCHEMA", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    server_host: str = os.getenv("SERVER_HOST", "0.0.0.0")
    server_port: int = int(os.getenv("SERVER_PORT", "8000"))

settings = Settings()
