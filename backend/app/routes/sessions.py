from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import GameSession, User
from ..schemas import GameSessionCreate, GameSessionResponse

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("", response_model=GameSessionResponse)
def record_session(session_in: GameSessionCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == session_in.user_id).first()
    if not user:
        # Automatically register user if not found
        user = User(
            id=session_in.user_id,
            name_alias=f"Participant {session_in.user_id[-4:]}",
            cohort=session_in.adaptation_mode or "adaptive"
        )
        db.add(user)
        db.commit()

    # Fallback performance score calculation
    acc_pct = session_in.accuracy if session_in.accuracy > 1.0 else session_in.accuracy * 100.0
    perf_score = (0.50 * acc_pct) + (0.30 * max(0.0, 100.0 - (session_in.response_time_ms / 100.0)))

    session_obj = GameSession(
        user_id=session_in.user_id,
        game_type=session_in.game_type,
        timestamp=session_in.timestamp or datetime.utcnow(),
        difficulty_level=session_in.difficulty_level,
        accuracy=session_in.accuracy,
        response_time_ms=session_in.response_time_ms,
        attempts=session_in.attempts,
        completed=session_in.completed,
        session_duration_s=session_in.session_duration_s,
        hints_used=session_in.hints_used,
        performance_score=round(perf_score, 2),
        adaptation_mode=session_in.adaptation_mode or "adaptive",
        is_synthetic=session_in.is_synthetic or False,
        synced=True
    )
    db.add(session_obj)
    db.commit()
    db.refresh(session_obj)
    return session_obj


@router.get("/{user_id}", response_model=List[GameSessionResponse])
def get_user_sessions(user_id: str, db: Session = Depends(get_db)):
    sessions = (
        db.query(GameSession)
        .filter(GameSession.user_id == user_id)
        .order_by(GameSession.timestamp.desc())
        .limit(100)
        .all()
    )
    return sessions
