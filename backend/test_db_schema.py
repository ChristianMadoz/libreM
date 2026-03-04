import sys
import os

# Append paths just in case
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from sqlalchemy import create_engine, text
    from database import engine
    from db_models import User
    
    with engine.connect() as conn:
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users';"))
        columns = [row[0] for row in result]
        print("Users table columns:", columns)
except Exception as e:
    print("Database check error:", e)
