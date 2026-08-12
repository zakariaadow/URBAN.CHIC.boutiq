# Create a file: backend/check_db.py
import os
import pymysql
from sqlalchemy import create_engine, inspect

# Your database URL
DATABASE_URL = "mysql+pymysql://root:zakariadowiman@acela.proxy.rlwy.net:57015/railway"

# Connect to database
engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

# Check tables
print("📊 Tables in database:")
for table in inspector.get_table_names():
    print(f"  - {table}")
    
# Check services table
try:
    with engine.connect() as conn:
        result = conn.execute("SELECT COUNT(*) FROM services")
        count = result.fetchone()[0]
        print(f"\n✅ Number of services: {count}")
        
        if count > 0:
            result = conn.execute("SELECT * FROM services LIMIT 5")
            for row in result:
                print(f"  - {row}")
        else:
            print("⚠️ No services found in database!")
except Exception as e:
    print(f"❌ Error checking services: {e}")