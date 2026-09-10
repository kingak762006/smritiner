from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Reminder, User
from ..schemas import ReminderCreate, ReminderResponse

router = APIRouter(prefix="/reminders", tags=["Reminders"])


@router.post("", response_model=ReminderResponse)
def create_reminder(reminder_in: ReminderCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == reminder_in.user_id).first()
    if not user:
        # Create user if needed
        user = User(id=reminder_in.user_id, name_alias=f"Patient {reminder_in.user_id[-4:]}")
        db.add(user)
        db.commit()

    rem = Reminder(
        user_id=reminder_in.user_id,
        title=reminder_in.title,
        category=reminder_in.category or "medication",
        time_str=reminder_in.time_str,
        frequency=reminder_in.frequency or "Daily",
        is_active=reminder_in.is_active if reminder_in.is_active is not None else True
    )
    db.add(rem)
    db.commit()
    db.refresh(rem)
    return rem


@router.get("/{user_id}", response_model=List[ReminderResponse])
def list_user_reminders(user_id: str, db: Session = Depends(get_db)):
    return db.query(Reminder).filter(Reminder.user_id == user_id).all()


@router.patch("/{reminder_id}/toggle", response_model=ReminderResponse)
def toggle_reminder(reminder_id: int, db: Session = Depends(get_db)):
    rem = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found")
    rem.is_active = not rem.is_active
    db.commit()
    db.refresh(rem)
    return rem


@router.patch("/{reminder_id}/acknowledge", response_model=ReminderResponse)
def acknowledge_reminder(reminder_id: int, db: Session = Depends(get_db)):
    rem = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found")
    rem.last_acknowledged = datetime.utcnow()
    db.commit()
    db.refresh(rem)
    return rem
