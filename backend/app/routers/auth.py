from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter

from fastapi import Depends
from fastapi import HTTPException
from fastapi import Request
from fastapi import status
from jose import jwt
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import AdminUserCreate, Token, UserCreate, UserLogin
from app.services.audit_service import create_audit_log, get_actor
from app.utils.security import hash_password, verify_password

router = APIRouter()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    payload = data.copy()
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": datetime.utcnow() + expires_delta})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


@router.post("/register")
def register(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    existing_username = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if not user.username or not user.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required"
        )

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    existing_email = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )

    user_model = User(
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password),
        role="user"
    )

    db.add(user_model)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed due to duplicate credentials"
        )
    db.refresh(user_model)

    create_audit_log(
        db,
        action="User registered",
        actor=user_model.username,
        details=f"username={user_model.username}, role={user_model.role}"
    )

    return {
        "message": "registered",
        "username": user_model.username,
        "role": user_model.role
    }


@router.post("/admin/create")
def create_user(request: Request, user: AdminUserCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )

    role = user.role if user.role in {"admin", "user"} else "user"
    existing_username = db.query(User).filter(User.username == user.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )

    user_model = User(
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password),
        role=role
    )

    db.add(user_model)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User creation failed due to duplicate credentials"
        )
    db.refresh(user_model)

    create_audit_log(
        db,
        action="User created",
        actor=current_user.username,
        details=f"username={user_model.username}, role={user_model.role}"
    )

    return {
        "message": "user created",
        "username": user_model.username,
        "role": user_model.role
    }


@router.post("/login", response_model=Token)
def login(request: Request, user: UserLogin, db: Session = Depends(get_db)):
    user_model = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if not user_model or not verify_password(
        user.password,
        user_model.password_hash
    ):
        create_audit_log(
            db,
            action="Failed login attempt",
            actor=user.username,
            details="invalid credentials"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token({
        "sub": user_model.username,
        "role": user_model.role,
        "is_admin": user_model.role == "admin"
    })

    create_audit_log(
        db,
        action="User login",
        actor=user_model.username,
        details="successful login"
    )

    return {
        "status": "ok",
        "access_token": access_token,
        "token_type": "bearer"
    }
