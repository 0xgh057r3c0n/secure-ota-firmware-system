from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status
from jose import jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.auth import Token, UserCreate, UserLogin
from app.utils.security import hash_password, verify_password

router = APIRouter()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    payload = data.copy()
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": datetime.utcnow() + expires_delta})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    user_model = User(
        username=user.username,
        email="",
        password_hash=hash_password(user.password)
    )

    db.add(user_model)
    db.commit()
    db.refresh(user_model)

    return {
        "message": "registered",
        "username": user_model.username
    }


@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    user_model = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if not user_model or not verify_password(
        user.password,
        user_model.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token({"sub": user_model.username})

    return {
        "status":"ok"
        "access_token": access_token,
        "token_type": "bearer"
    }
