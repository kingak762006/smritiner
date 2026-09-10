from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)  # Hashed / Internal ID, e.g. "NER-PAT-4821"
    name_alias = Column(String(128), nullable=False)        # E.g. "Aita Hemaprabha"
    age_band = Column(String(32), default="65-74")          # Anonymized age group
    preferred_language = Column(String(16), default="as")   # "as", "hi", "en"
    caregiver_contact = Column(String(64), default="Dr. B. Barua / PHC Morigaon")
    cohort = Column(String(32), default="adaptive")         # "adaptive" or "fixed"
    created_at = Column(DateTime, default=datetime.utcnow)

    sessions = relationship("GameSession", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")


class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    game_type = Column(String(64), index=True, nullable=False)  # "memory_matching", "sequence_recall", etc.
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    difficulty_level = Column(Integer, default=1)
    accuracy = Column(Float, default=0.0)                    # 0.0 to 1.0 (or 0-100)
    response_time_ms = Column(Float, default=0.0)            # Reaction/move latency
    attempts = Column(Integer, default=1)
    completed = Column(Boolean, default=True)
    session_duration_s = Column(Float, default=0.0)
    hints_used = Column(Integer, default=0)
    performance_score = Column(Float, default=0.0)
    adaptation_mode = Column(String(32), default="adaptive") # "adaptive" or "fixed"
    rationale = Column(Text, default="")
    is_synthetic = Column(Boolean, default=False)            # Flag for synthetic research benchmarks
    synced = Column(Boolean, default=True)

    user = relationship("User", back_populates="sessions")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    title = Column(String(128), nullable=False)              # E.g. "Morning BP Medicine (Amlodipine 5mg)"
    category = Column(String(32), default="medication")      # "medication", "hydration", "meal", "activity", "appointment"
    time_str = Column(String(16), nullable=False)            # "07:30 AM"
    frequency = Column(String(32), default="Daily")
    is_active = Column(Boolean, default=True)
    last_acknowledged = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reminders")


class SyncLog(Base):
    __tablename__ = "sync_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    batch_id = Column(String(64), index=True, nullable=False)
    user_id = Column(String(64), nullable=False)
    records_count = Column(Integer, default=0)
    synced_at = Column(DateTime, default=datetime.utcnow)
