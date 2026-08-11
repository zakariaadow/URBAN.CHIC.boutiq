#!/usr/bin/env python
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

# Set environment
os.environ['FLASK_ENV'] = 'production'

try:
    from app import create_app, db
    from app.models import Service
    
    # Create app without session issues
    app = create_app('production')
    
    with app.app_context():
        print("🔍 Checking database tables...")
        
        # Check existing tables
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        
        print(f"📊 Existing tables: {tables}")
        
        if not tables:
            print("⚠️ No tables found. Creating all tables...")
            db.create_all()
            print("✅ All tables created!")
        else:
            print(f"✅ Found {len(tables)} tables")
        
        # Try to query services
        try:
            count = Service.query.count()
            print(f"✅ Services table exists with {count} records")
        except Exception as e:
            print(f"⚠️ Services table: {e}")
            
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()