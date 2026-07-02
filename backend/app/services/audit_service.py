from fastapi import Request
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.models.audit import AuditLog


def get_actor(request: Request) -> str:
    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        return "anonymous"

    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload.get("sub", "anonymous")
    except JWTError:
        return "anonymous"


def get_current_role(request: Request) -> str:
    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        return "user"

    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload.get("role", "user")
    except JWTError:
        return "user"


def create_audit_log(
    db: Session,
    action: str,
    actor: str = "anonymous",
    details: str = ""
):
    log = AuditLog(
        action=action,
        actor=actor,
        details=details
    )

    db.add(log)
    db.commit()
    db.refresh(log)
    return log
