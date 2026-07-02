from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.audit import AuditLog
from app.services.audit_service import get_actor

router = APIRouter()

@router.get("/")
def get_logs(request: Request, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    actor = get_actor(request)
    if actor == "anonymous":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .all()
    )

    return [
        {
            "id": log.id,
            "action": log.action,
            "actor": log.actor,
            "details": log.details,
            "timestamp": log.timestamp.isoformat()
        }
        for log in logs
    ]
