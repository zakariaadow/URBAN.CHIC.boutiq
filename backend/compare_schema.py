import sqlite3
import mysql.connector
import sys

SQLITE_DB = "instance/urban_chic_boutique_migration.db"

MYSQL_CONFIG = {
    "host": "localhost",
    "user": "urban_chic_user",
    "password": input("Enter MySQL password: "),
    "database": "urban_chic_boutique",
}

print("\nConnecting to SQLite...")
sqlite_conn = sqlite3.connect(SQLITE_DB)
sqlite_cursor = sqlite_conn.cursor()

print("Connecting to MySQL...")
try:
    mysql_conn = mysql.connector.connect(**MYSQL_CONFIG)
    mysql_cursor = mysql_conn.cursor()
except Exception as e:
    print(f"\nMySQL connection failed: {e}")
    sys.exit(1)

# Get SQLite tables
sqlite_cursor.execute("""
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
    ORDER BY name
""")

sqlite_tables = [row[0] for row in sqlite_cursor.fetchall()]

# Get MySQL tables
mysql_cursor.execute("""
    SELECT TABLE_NAME
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = %s
    ORDER BY TABLE_NAME
""", (MYSQL_CONFIG["database"],))

mysql_tables = [row[0] for row in mysql_cursor.fetchall()]

print("\n" + "=" * 70)
print("TABLE COMPARISON")
print("=" * 70)

missing_tables = sorted(set(sqlite_tables) - set(mysql_tables))
extra_tables = sorted(set(mysql_tables) - set(sqlite_tables))

if not missing_tables:
    print("✓ All SQLite tables exist in MySQL.")
else:
    print("\nTables missing from MySQL:")
    for table in missing_tables:
        print(f"  ✗ {table}")

if extra_tables:
    print("\nExtra MySQL tables:")
    for table in extra_tables:
        print(f"  + {table}")

print("\n" + "=" * 70)
print("COLUMN COMPARISON")
print("=" * 70)

schema_errors = False

for table in sqlite_tables:

    if table not in mysql_tables:
        continue

    # SQLite columns
    sqlite_cursor.execute(f'PRAGMA table_info("{table}")')
    sqlite_columns = [row[1] for row in sqlite_cursor.fetchall()]

    # MySQL columns
    mysql_cursor.execute("""
        SELECT COLUMN_NAME
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = %s
          AND TABLE_NAME = %s
        ORDER BY ORDINAL_POSITION
    """, (MYSQL_CONFIG["database"], table))

    mysql_columns = [row[0] for row in mysql_cursor.fetchall()]

    missing_columns = [
        column for column in sqlite_columns
        if column not in mysql_columns
    ]

    extra_columns = [
        column for column in mysql_columns
        if column not in sqlite_columns
    ]

    if missing_columns or extra_columns:

        schema_errors = True

        print(f"\nTABLE: {table}")

        if missing_columns:
            print("  SQLite columns missing in MySQL:")
            for column in missing_columns:
                print(f"    ✗ {column}")

        if extra_columns:
            print("  Extra MySQL columns:")
            for column in extra_columns:
                print(f"    + {column}")

print("\n" + "=" * 70)

if not missing_tables and not schema_errors:
    print("✓ SCHEMA CHECK PASSED")
    print("✓ Every SQLite table exists in MySQL.")
    print("✓ Every SQLite column exists in MySQL.")
    print("✓ Safe to proceed to data migration.")
else:
    print("⚠ SCHEMA DIFFERENCES FOUND")
    print("Do NOT import data yet.")
    print("Review the differences above first.")

print("=" * 70)

sqlite_conn.close()
mysql_conn.close()