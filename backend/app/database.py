import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

logger = logging.getLogger("smritiner.database")

db_url = settings.DATABASE_URL

# Auto-resolve SQLite path and ensure parent directory exists and is writable
if db_url.startswith("sqlite:///"):
    db_path = db_url[len("sqlite:///"):]
    # In native cloud environments (like Render native Python), /app does not exist
    if db_path.startswith("/app") and not os.path.exists("/app"):
        db_path = "/tmp/smriti_ner.db"
        db_url = f"sqlite:///{db_path}"
    
    dir_path = os.path.dirname(db_path)
    if dir_path:
        try:
            os.makedirs(dir_path, exist_ok=True)
        except Exception:
            # Fallback to /tmp on Unix or current directory on Windows if directory unwritable
            fallback_dir = "/tmp" if os.name != "nt" else "."
            db_path = os.path.join(fallback_dir, "smriti_ner.db")
            db_url = f"sqlite:///{db_path}"

connect_args = {"check_same_thread": False} if "sqlite" in db_url else {}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
