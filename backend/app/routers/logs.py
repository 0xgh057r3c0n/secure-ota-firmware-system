from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.audit import AuditLog

router = APIRouter()

@router.get("/")
def get_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).all()

    return [
        {
            "id": log.id,
            "action": log.action,
            "created_at": str(log.created_at)
        }
        for log in logs
    ]
