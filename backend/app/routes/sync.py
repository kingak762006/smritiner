from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import GameSession, User, SyncLog
from ..schemas import SyncPayload, SyncResponse

router = APIRouter(prefix="/sync", tags=["Offline-First Synchronization"])


@router.post("", response_model=SyncResponse)
def synchronize_offline_sessions(payload: SyncPayload, db: Session = Depends(get_db)):
    """
    Offline-First Synchronization Endpoint:
    Field workers and rural primary healthcare clinics (PHCs) record cognitive
    sessions locally in IndexedDB/LocalStorage when network access is absent.
    When connectivity resumes, this endpoint batches and ingests all pending sessions.
    """
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        user = User(
            id=payload.user_id,
            name_alias=f"Participant {payload.user_id[-4:]}",
            cohort="adaptive"
        )
        db.add(user)
        db.commit()

    synced_count = 0
    for s_in in payload.sessions:
        acc_pct = s_in.accuracy if s_in.accuracy > 1.0 else s_in.accuracy * 100.0
        perf_score = (0.50 * acc_pct) + (0.30 * max(0.0, 100.0 - (s_in.response_time_ms / 100.0)))

        session_obj = GameSession(
            user_id=payload.user_id,
            game_type=s_in.game_type,
            timestamp=s_in.timestamp or datetime.utcnow(),
            difficulty_level=s_in.difficulty_level,
            accuracy=s_in.accuracy,
            response_time_ms=s_in.response_time_ms,
            attempts=s_in.attempts,
            completed=s_in.completed,
            session_duration_s=s_in.session_duration_s,
            hints_used=s_in.hints_used,
            performance_score=round(perf_score, 2),
            adaptation_mode=s_in.adaptation_mode or "adaptive",
            rationale="Synchronized from offline local client cache.",
            is_synthetic=s_in.is_synthetic or False,
            synced=True
        )
        db.add(session_obj)
        synced_count += 1

    # Record sync log
    sync_log = SyncLog(
        batch_id=payload.batch_id,
        user_id=payload.user_id,
        records_count=synced_count,
        synced_at=datetime.utcnow()
    )
    db.add(sync_log)
    db.commit()

    return SyncResponse(
        status="success",
        batch_id=payload.batch_id,
        records_synced=synced_count,
        server_timestamp=datetime.utcnow()
    )
