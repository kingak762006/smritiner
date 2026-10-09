import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserUpdate, UserResponse

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
        cohort=user_in.cohort or "adaptive",
        has_dementia=user_in.has_dementia if user_in.has_dementia is not None else False,
        dementia_stage=user_in.dementia_stage or "None"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserResponse)
@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: str, user_in: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    
    if user_in.name_alias is not None:
        user.name_alias = user_in.name_alias
    if user_in.age_band is not None:
        user.age_band = user_in.age_band
    if user_in.preferred_language is not None:
        user.preferred_language = user_in.preferred_language
    if user_in.caregiver_contact is not None:
        user.caregiver_contact = user_in.caregiver_contact
    if user_in.cohort is not None:
        user.cohort = user_in.cohort
    if user_in.has_dementia is not None:
        user.has_dementia = user_in.has_dementia
    if user_in.dementia_stage is not None:
        user.dementia_stage = user_in.dementia_stage

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
