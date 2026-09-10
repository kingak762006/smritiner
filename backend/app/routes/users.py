import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("", response_model=UserResponse)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    user_id = user_in.id or f"NER-PAT-{uuid.uuid4().hex[:6].upper()}"
    existing = db.query(User).filter(User.id == user_id).first()
    if existing:
        return existing

    user = User(
        id=user_id,
        name_alias=user_in.name_alias,
        age_band=user_in.age_band or "65-74",
        preferred_language=user_in.preferred_language or "as",
        caregiver_contact=user_in.caregiver_contact or "PHC Caregiver",
        cohort=user_in.cohort or "adaptive"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    return user


@router.get("", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()
