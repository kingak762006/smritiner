from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# User schemas
class UserBase(BaseModel):
    name_alias: str
    age_band: Optional[str] = "65-74"
    preferred_language: Optional[str] = "as"
    caregiver_contact: Optional[str] = "PHC Caregiver"
    cohort: Optional[str] = "adaptive"

class UserCreate(UserBase):
    id: Optional[str] = None

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# Game session schemas
class GameSessionBase(BaseModel):
    user_id: str
    game_type: str
    difficulty_level: int = 1
    accuracy: float
    response_time_ms: float
    attempts: int = 1
    completed: bool = True
    session_duration_s: float = 60.0
    hints_used: int = 0
    adaptation_mode: Optional[str] = "adaptive"

class GameSessionCreate(GameSessionBase):
    timestamp: Optional[datetime] = None
    is_synthetic: Optional[bool] = False

class GameSessionResponse(GameSessionBase):
    id: int
    timestamp: datetime
    performance_score: float
    rationale: Optional[str] = ""
    is_synthetic: bool = False
    synced: bool = True

    class Config:
        from_attributes = True


# Game result submission & AI adaptation output
class GameResultInput(BaseModel):
    user_id: str
    game_type: str
    current_difficulty: int = 1
    accuracy: float
    response_time_ms: float
    attempts: int = 1
    completed: bool = True
    hints_used: int = 0
    session_duration_s: float = 60.0
    adaptation_mode: Optional[str] = "adaptive"

class GameResultOutput(BaseModel):
    session_id: int
    user_id: str
    game_type: str
    performance_score: float
    speed_score: float
    accuracy_percent: float
    current_difficulty: int
    next_difficulty: int
    adaptation_direction: str
    adaptation_rationale: str
    game_parameters: Dict[str, Any]
    clinical_disclaimer: str


# Reminder schemas
class ReminderBase(BaseModel):
    user_id: str
    title: str
    category: str = "medication"
    time_str: str
    frequency: Optional[str] = "Daily"
    is_active: Optional[bool] = True

class ReminderCreate(ReminderBase):
    pass

class ReminderResponse(ReminderBase):
    id: int
    last_acknowledged: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Offline sync schemas
class SyncPayload(BaseModel):
    batch_id: str
    user_id: str
    sessions: List[GameSessionCreate]
    client_timestamp: Optional[datetime] = None

class SyncResponse(BaseModel):
    status: str
    batch_id: str
    records_synced: int
    server_timestamp: datetime
