import sys
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import GameSession, User
from ..schemas import GameResultInput, GameResultOutput

# Import ML Adaptive Engine from ml/ folder
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))
from ml.adaptive_engine import engine as adaptive_engine

router = APIRouter(prefix="/games", tags=["Cognitive Games & Adaptation"])


@router.post("/result", response_model=GameResultOutput)
def submit_game_result(data: GameResultInput, db: Session = Depends(get_db)):
    """
    Core Research Engine Endpoint:
    1. Receives in-session cognitive interaction telemetry
    2. Retrieves recent user session history
    3. Runs AI Adaptive Difficulty Engine
    4. Records session in database
    5. Returns updated difficulty level, parameter bundle, and explainable rationale
    """
    # Ensure user exists
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        user = User(
            id=data.user_id,
            name_alias=f"Participant {data.user_id[-4:]}",
            cohort=data.adaptation_mode or "adaptive"
        )
        db.add(user)
        db.commit()

    # Fetch recent past performance scores for smoothing
    past_sessions = (
        db.query(GameSession.performance_score)
        .filter(GameSession.user_id == data.user_id)
        .order_by(GameSession.timestamp.desc())
        .limit(5)
        .all()
    )
    history_scores = [s[0] for s in past_sessions if s[0] is not None]

    # Evaluate with AI Adaptive Engine
    adaptation_result = adaptive_engine.evaluate_session(
        game_type=data.game_type,
        current_difficulty=data.current_difficulty,
        accuracy=data.accuracy,
        response_time_ms=data.response_time_ms,
        attempts=data.attempts,
        completed=data.completed,
        hints_used=data.hints_used,
        session_duration_s=data.session_duration_s,
        history_scores=history_scores
    )

    # If user is in Fixed Difficulty experimental control group, override next difficulty to 2
    if data.adaptation_mode == "fixed" or user.cohort == "fixed":
        next_diff = 2
        rationale = "Fixed Difficulty Control Mode: Difficulty held constant at Level 2 for baseline comparison."
        direction = "FIXED_CONTROL"
        game_params = adaptive_engine.GAME_PARAMETERS.get(
            data.game_type.lower().replace(" ", "_"), {}
        ).get(2, {"difficulty_level": 2})
    else:
        next_diff = adaptation_result["next_difficulty"]
        rationale = adaptation_result["adaptation_rationale"]
        direction = adaptation_result["adaptation_direction"]
        game_params = adaptation_result["game_parameters"]

    # Persist game session record
    session_obj = GameSession(
        user_id=data.user_id,
        game_type=data.game_type,
        timestamp=datetime.utcnow(),
        difficulty_level=data.current_difficulty,
        accuracy=data.accuracy,
        response_time_ms=data.response_time_ms,
        attempts=data.attempts,
        completed=data.completed,
        session_duration_s=data.session_duration_s,
        hints_used=data.hints_used,
        performance_score=adaptation_result["performance_score"],
        adaptation_mode="fixed" if (data.adaptation_mode == "fixed" or user.cohort == "fixed") else "adaptive",
        rationale=rationale,
        is_synthetic=False,
        synced=True
    )
    db.add(session_obj)
    db.commit()
    db.refresh(session_obj)

    return GameResultOutput(
        session_id=session_obj.id,
        user_id=data.user_id,
        game_type=data.game_type,
        performance_score=adaptation_result["performance_score"],
        speed_score=adaptation_result["speed_score"],
        accuracy_percent=adaptation_result["accuracy_percent"],
        current_difficulty=data.current_difficulty,
        next_difficulty=next_diff,
        adaptation_direction=direction,
        adaptation_rationale=rationale,
        game_parameters=game_params,
        clinical_disclaimer=adaptation_result["clinical_disclaimer"]
    )
