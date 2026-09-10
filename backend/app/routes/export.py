import csv
import io
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import GameSession

router = APIRouter(prefix="/export", tags=["Research Data Export"])


@router.get("/csv/{user_id}")
def export_research_csv(user_id: str, db: Session = Depends(get_db)):
    """
    Exports clean, reproducible research session dataset in CSV format.
    Allows researchers to import directly into R, Python pandas, SPSS, or Stata
    for secondary clinical and human-factors statistical analysis.
    """
    query = db.query(GameSession)
    if user_id.lower() != "all":
        query = query.filter(GameSession.user_id == user_id)

    sessions = query.order_by(GameSession.timestamp.asc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Standard research column headers
    writer.writerow([
        "session_id",
        "user_id",
        "game_type",
        "timestamp_utc",
        "difficulty_level",
        "accuracy_percent",
        "response_time_ms",
        "attempts",
        "completed",
        "session_duration_s",
        "hints_used",
        "performance_score",
        "adaptation_mode",
        "is_synthetic",
        "data_notice"
    ])

    for s in sessions:
        acc_pct = s.accuracy * 100.0 if s.accuracy <= 1.0 else s.accuracy
        writer.writerow([
            s.id,
            s.user_id,
            s.game_type,
            s.timestamp.isoformat() if s.timestamp else "",
            s.difficulty_level,
            round(acc_pct, 2),
            round(s.response_time_ms, 1),
            s.attempts,
            1 if s.completed else 0,
            round(s.session_duration_s, 1),
            s.hints_used,
            round(s.performance_score, 2),
            s.adaptation_mode,
            1 if s.is_synthetic else 0,
            "SYNTHETIC_PROTOTYPE_DATA" if s.is_synthetic else "ACTIVE_PROTOTYPE_RECORD"
        ])

    csv_data = output.getvalue()
    filename = f"smritiner_research_export_{user_id.lower()}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
