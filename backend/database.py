from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Location of the SQLite database file
DATABASE_URL = "sqlite:///./assets.db"

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Session factory handling request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_user_role_column():
    import sqlite3

    conn = sqlite3.connect("assets.db")
    try:
        cur = conn.cursor()
        cur.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cur.fetchall()]
        if "role" not in columns:
            cur.execute("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'storekeeper'")
            conn.commit()
    finally:
        conn.close()


def ensure_asset_columns():
    import sqlite3

    conn = sqlite3.connect("assets.db")
    try:
        cur = conn.cursor()
        cur.execute("PRAGMA table_info(assets)")
        columns = [row[1] for row in cur.fetchall()]
        if "qr_code_path" not in columns:
            cur.execute("ALTER TABLE assets ADD COLUMN qr_code_path VARCHAR")
            conn.commit()
        if "barcode_path" not in columns:
            cur.execute("ALTER TABLE assets ADD COLUMN barcode_path VARCHAR")
            conn.commit()
        if "status" not in columns:
            cur.execute("ALTER TABLE assets ADD COLUMN status VARCHAR DEFAULT 'available'")
            conn.commit()
        if "purchase_date" not in columns:
            cur.execute("ALTER TABLE assets ADD COLUMN purchase_date VARCHAR")
            conn.commit()
        if "warranty_expiration_date" not in columns:
            cur.execute("ALTER TABLE assets ADD COLUMN warranty_expiration_date VARCHAR")
            conn.commit()
        if "salvage_value" not in columns:
            cur.execute("ALTER TABLE assets ADD COLUMN salvage_value INTEGER")
            conn.commit()
        if "useful_life_years" not in columns:
            cur.execute("ALTER TABLE assets ADD COLUMN useful_life_years INTEGER")
            conn.commit()
        if "annual_depreciation" not in columns:
            cur.execute("ALTER TABLE assets ADD COLUMN annual_depreciation INTEGER")
            conn.commit()
        if "expected_return_date" not in columns:
            cur.execute("ALTER TABLE assets ADD COLUMN expected_return_date DATE")
            conn.commit()
    finally:
        conn.close()


def ensure_asset_transaction_columns():
    import sqlite3

    conn = sqlite3.connect("assets.db")
    try:
        cur = conn.cursor()
        cur.execute("PRAGMA table_info(asset_transactions)")
        columns = [row[1] for row in cur.fetchall()]
        if "transaction_type" not in columns:
            cur.execute("ALTER TABLE asset_transactions ADD COLUMN transaction_type VARCHAR")
            conn.commit()
        if "transaction_date" not in columns:
            cur.execute("ALTER TABLE asset_transactions ADD COLUMN transaction_date DATETIME")
            conn.commit()
        if "create_at" not in columns:
            cur.execute("ALTER TABLE asset_transactions ADD COLUMN create_at DATETIME")
            conn.commit()
    finally:
        conn.close()