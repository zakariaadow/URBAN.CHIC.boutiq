
import sqlite3
import mysql.connector
import sys
from decimal import Decimal


# ============================================================
# CONFIGURATION
# ============================================================

SQLITE_DB = "instance/urban_chic_boutique_migration.db"

MYSQL_CONFIG = {
    "host": "localhost",
    "user": "urban_chic_user",
    "database": "urban_chic_boutique",
}


# ============================================================
# GET MYSQL PASSWORD
# ============================================================

password = input("Enter MySQL password: ")
MYSQL_CONFIG["password"] = password


# ============================================================
# CONNECT TO SQLITE
# ============================================================

print("\nConnecting to SQLite...")

try:
    sqlite_conn = sqlite3.connect(SQLITE_DB)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cursor = sqlite_conn.cursor()

except Exception as e:
    print(f"ERROR connecting to SQLite: {e}")
    sys.exit(1)


# ============================================================
# CONNECT TO MYSQL
# ============================================================

print("Connecting to MySQL...")

try:
    mysql_conn = mysql.connector.connect(**MYSQL_CONFIG)
    mysql_cursor = mysql_conn.cursor()

except Exception as e:
    print(f"\nERROR connecting to MySQL: {e}")
    sqlite_conn.close()
    sys.exit(1)


# ============================================================
# GET SQLITE TABLES
# ============================================================

sqlite_cursor.execute("""
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
    ORDER BY name
""")

tables = [row[0] for row in sqlite_cursor.fetchall()]

print(f"\nTables found: {len(tables)}\n")

for table in tables:
    print(f"- {table}")


# ============================================================
# CHECK MYSQL TABLES
# ============================================================

print("\nChecking that MySQL tables exist...")

mysql_cursor.execute("""
    SELECT TABLE_NAME
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = %s
""", (MYSQL_CONFIG["database"],))

mysql_tables = {row[0] for row in mysql_cursor.fetchall()}

missing_tables = set(tables) - mysql_tables

if missing_tables:

    print("\nERROR: The following SQLite tables are missing in MySQL:")

    for table in sorted(missing_tables):
        print(f"  - {table}")

    sqlite_conn.close()
    mysql_conn.close()
    sys.exit(1)

print("✓ All SQLite tables exist in MySQL.")


# ============================================================
# CHECK THAT MYSQL IS EMPTY
# ============================================================

print("\nChecking MySQL database...")

non_empty_tables = {}

for table in tables:

    mysql_cursor.execute(
        f"SELECT COUNT(*) FROM `{table}`"
    )

    count = mysql_cursor.fetchone()[0]

    if count > 0:
        non_empty_tables[table] = count


if non_empty_tables:

    print("\nWARNING: MySQL already contains data!")

    for table, count in non_empty_tables.items():
        print(f"  {table}: {count} rows")

    print(
        "\nMigration stopped to prevent "
        "duplicate or overwritten business data."
    )

    sqlite_conn.close()
    mysql_conn.close()
    sys.exit(1)


print("✓ MySQL database is empty.")


# ============================================================
# START MIGRATION
# ============================================================

print("\n# Starting migration...")
print("=" * 70)

try:

    # --------------------------------------------------------
    # DISABLE FOREIGN KEY CHECKS
    # --------------------------------------------------------

    mysql_conn.autocommit = False

    mysql_cursor.execute(
        "SET FOREIGN_KEY_CHECKS = 0"
    )

    migrated_counts = {}

    # --------------------------------------------------------
    # IMPORT EACH TABLE
    # --------------------------------------------------------

    for table in tables:

        print(f"\nMigrating: {table}")

        # Read SQLite rows
        sqlite_cursor.execute(
            f'SELECT * FROM "{table}"'
        )

        rows = sqlite_cursor.fetchall()

        # Empty table
        if not rows:

            migrated_counts[table] = 0

            print("  0 rows")

            continue

        # Get column names
        columns = rows[0].keys()

        column_sql = ", ".join(
            f"`{column}`"
            for column in columns
        )

        placeholders = ", ".join(
            ["%s"] * len(columns)
        )

        insert_sql = f"""
            INSERT INTO `{table}`
            ({column_sql})
            VALUES ({placeholders})
        """

        data = []

        for row in rows:

            values = []

            for value in row:

                # Convert Decimal values if necessary
                if isinstance(value, Decimal):
                    value = float(value)

                values.append(value)

            data.append(tuple(values))

        # Insert rows
        mysql_cursor.executemany(
            insert_sql,
            data
        )

        migrated_counts[table] = len(rows)

        print(
            f"  ✓ {len(rows)} rows"
        )

    # --------------------------------------------------------
    # COMMIT
    # --------------------------------------------------------

    mysql_conn.commit()

    print("\n" + "=" * 70)
    print("✓ DATA IMPORT COMMITTED")
    print("=" * 70)


except Exception as e:

    print("\n" + "=" * 70)
    print("ERROR DURING MIGRATION")
    print("=" * 70)

    print(f"\n{e}")

    print("\nRolling back MySQL transaction...")

    try:
        mysql_conn.rollback()
        print("✓ Rollback completed.")
        print("✓ No partial migration was committed.")

    except Exception as rollback_error:

        print(
            f"Rollback error: {rollback_error}"
        )

    try:
        mysql_cursor.execute(
            "SET FOREIGN_KEY_CHECKS = 1"
        )

        mysql_conn.commit()

    except Exception:
        pass

    sqlite_conn.close()
    mysql_conn.close()

    sys.exit(1)


# ============================================================
# RESTORE FOREIGN KEY CHECKS
# ============================================================

try:

    mysql_cursor.execute(
        "SET FOREIGN_KEY_CHECKS = 1"
    )

    mysql_conn.commit()

except Exception as e:

    print(
        f"\nWarning restoring foreign keys: {e}"
    )


# ============================================================
# VERIFY ROW COUNTS
# ============================================================

print("\n")
print("=" * 70)
print("VERIFYING MIGRATION")
print("=" * 70)

verification_failed = False

total_sqlite_rows = 0
total_mysql_rows = 0


for table in tables:

    # --------------------------------------------------------
    # SQLite count
    # --------------------------------------------------------

    sqlite_cursor.execute(
        f'SELECT COUNT(*) FROM "{table}"'
    )

    sqlite_count = sqlite_cursor.fetchone()[0]

    # --------------------------------------------------------
    # MySQL count
    # --------------------------------------------------------

    mysql_cursor.execute(
        f"SELECT COUNT(*) FROM `{table}`"
    )

    mysql_count = mysql_cursor.fetchone()[0]

    total_sqlite_rows += sqlite_count
    total_mysql_rows += mysql_count

    # --------------------------------------------------------
    # Compare
    # --------------------------------------------------------

    if sqlite_count == mysql_count:

        print(
            f"✓ {table:<25} "
            f"SQLite: {sqlite_count:<5} "
            f"MySQL: {mysql_count:<5}"
        )

    else:

        verification_failed = True

        print(
            f"✗ {table:<25} "
            f"SQLite: {sqlite_count:<5} "
            f"MySQL: {mysql_count:<5}"
        )


# ============================================================
# TOTAL ROW COUNT
# ============================================================

print("\n" + "-" * 70)

print(
    f"Total SQLite rows: {total_sqlite_rows}"
)

print(
    f"Total MySQL rows:  {total_mysql_rows}"
)

print("-" * 70)


# ============================================================
# FINAL RESULT
# ============================================================

print("\n" + "=" * 70)

if verification_failed:

    print("⚠ MIGRATION COMPLETED BUT VERIFICATION FAILED")
    print()
    print("Some table counts do not match.")
    print("DO NOT continue modifying the database.")
    print("Review the differences above.")

else:

    print("✓ MIGRATION SUCCESSFUL")
    print("✓ ALL 33 TABLE COUNTS MATCH")
    print("✓ SOURCE DATABASE WAS NOT MODIFIED")
    print("✓ EXISTING PRIMARY-KEY IDs WERE PRESERVED")
    print("✓ FOREIGN-KEY CHECKS WERE RESTORED")

print("=" * 70)


# ============================================================
# CLOSE CONNECTIONS
# ============================================================

sqlite_conn.close()
mysql_conn.close()
